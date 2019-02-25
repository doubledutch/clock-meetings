/*
 * Copyright 2018 DoubleDutch, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { PureComponent } from 'react'
import client from '@doubledutch/admin-client'
import { provideFirebaseConnectorToReactComponent } from '@doubledutch/firebase-connector'
import { ServerValue } from '@firebase/database'
import Admin from './Admin'
import BigScreen from './BigScreen'
import { parseQueryString } from './utils'
import serverTimeFactory from './firebaseServerTime'

import '@doubledutch/react-components/lib/base.css'
import './App.css'

const { token } = parseQueryString()
if (token) client.longLivedToken = token

class App extends PureComponent {
  state = {
    meeting: { isLive: false },
    startTime: null,
    slotCount: null,
    secondsBeforeMeetings: null,
    secondsPerMeeting: null,
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.startTime !== this.state.startTime ||
      prevState.slotCount !== this.state.slotCount ||
      prevState.secondsBeforeMeetings !== this.state.secondsBeforeMeetings ||
      prevState.secondsPerMeeting !== this.state.secondsPerMeeting
    ) {
      if (this.timer) clearTimeout(this.timer)
      this.setTimer()
    }
  }

  componentWillUnmount() {
    if (this.timer) clearTimeout(this.timer)
  }

  setTimer = () => {
    const meeting = this.getMeetingState()
    this.setState({ meeting })
    if (meeting.isLive) setTimeout(this.setTimer, meeting.endTime - this.getServerTime())
  }

  componentDidMount() {
    const { fbc } = this.props
    this.props.fbc.signinAdmin().then(() => {
      this.getServerTime = serverTimeFactory(fbc.database.private.adminRef('st'), ServerValue)

      fbc.database.public
        .adminRef('startTime')
        .on('value', data => this.setState({ startTime: data.val() }))

      fbc.database.public
        .adminRef('secondsBeforeMeetings')
        .on('value', data => this.setState({ secondsBeforeMeetings: data.val() || 120 }))
      fbc.database.public
        .adminRef('secondsPerMeeting')
        .on('value', data => this.setState({ secondsPerMeeting: data.val() || 300 }))
      fbc.database.public
        .adminRef('slotCount')
        .on('value', data => this.setState({ slotCount: data.val() || 12 }))
    })
  }

  render() {
    const { meeting, startTime, slotCount, secondsBeforeMeetings, secondsPerMeeting } = this.state
    if (!slotCount) return <div className="admin">Loading...</div>

    const { fbc } = this.props
    const qs = parseQueryString()

    switch (qs.page) {
      case 'bigScreen':
        return <BigScreen fbc={fbc} getServerTime={this.getServerTime} meeting={meeting} />
      default:
        return (
          <Admin
            fbc={fbc}
            meeting={meeting}
            startTime={startTime}
            slotCount={slotCount}
            secondsBeforeMeetings={secondsBeforeMeetings}
            secondsPerMeeting={secondsPerMeeting}
          />
        )
    }
  }

  getMeetingState = () => {
    const { startTime, slotCount, secondsBeforeMeetings, secondsPerMeeting } = this.state
    const msBeforeMeetings = secondsBeforeMeetings * 1000
    const msPerMeeting = secondsPerMeeting * 1000
    const now = this.getServerTime().valueOf()

    // A "round" is a break before a meeting to find your partner, plus the meeting itself.
    const msPerRound = msBeforeMeetings + msPerMeeting
    if (!startTime || now > startTime + slotCount * msPerRound) {
      return { isLive: false }
    }

    const roundIndex = Math.floor((now - startTime) / msPerRound)
    const roundStarted = startTime + roundIndex * msPerRound
    const msSinceRoundStarted = now - roundStarted
    const isBreak = msSinceRoundStarted < msBeforeMeetings
    const endTime = new Date(roundStarted + msBeforeMeetings + (isBreak ? 0 : msPerMeeting))
    return { isLive: true, roundIndex, isBreak, endTime }
  }
}

export default provideFirebaseConnectorToReactComponent(
  client,
  'magichour',
  (props, fbc) => <App {...props} fbc={fbc} />,
  PureComponent,
)
