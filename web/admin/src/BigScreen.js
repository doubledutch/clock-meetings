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

import Timer from './Timer'

export default class BigScreen extends PureComponent {
  state = { finalCTAText: null }

  componentDidMount() {
    const { fbc } = this.props
    fbc.database.public
      .adminRef('finalCTAText')
      .on('value', data => this.setState({ finalCTAText: data.val() }))
  }

  render() {
    const { getServerTime, meeting, meetings } = this.props
    const { finalCTAText } = this.state
    if (!meeting.isLive) {
      return (
        <div className="big-screen">
          {this.wasLive ? (
            <div className="big-screen__timer">{finalCTAText || '0:00'}</div>
          ) : (
            <div className="big-screen__start">Start Magic Hour from the CMS</div>
          )}
        </div>
      )
    }

    this.wasLive = true
    const meetingsThisRound = Object.values(meetings).filter(
      m => m.slotIndex === meeting.roundIndex,
    )

    return (
      <div className={`big-screen${meeting.isBreak ? ' break' : ''}`}>
        <Timer className="big-screen__timer" getTime={getServerTime} targetTime={meeting.endTime} />
        <div className="big-screen__round">
          {meeting.isBreak ? 'Find your partner for ' : ''}Round {meeting.roundIndex + 1}
        </div>
        <div>{meetingsThisRound.length} meetings this round</div>
      </div>
    )
  }
}
