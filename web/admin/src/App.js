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
import { TextInput } from '@doubledutch/react-components'
import '@doubledutch/react-components/lib/base.css'

import './App.css'

class App extends PureComponent {
  state = { slotCount: 12, currentSlotIndex: null }

  componentDidMount() {
    const { fbc } = this.props
    fbc.signinAdmin().then(() => {
      fbc.database.public
        .adminRef('slotCount')
        .on('value', data => this.setState({ slotCount: data.val() || 12 }))
      fbc.database.public
        .adminRef('currentSlotIndex')
        .on('value', data => this.setState({ currentSlotIndex: data.val() || -1 }))
      fbc.database.public
        .adminRef('topics')
        .on('value', data => this.setState({ topics: data.val() || '' }))
    })
  }

  render() {
    const { currentSlotIndex, slotCount, topics } = this.state
    if (currentSlotIndex === null) return <div>Loading...</div>
    return (
      <div className="vertical space-children">
        <label>
          Number of slots:
          <input
            className="number"
            type="number"
            min={3}
            max={12}
            value={slotCount}
            onChange={this.updatePublicNumber('slotCount')}
          />
        </label>
        {currentSlotIndex < 0 ? (
          <button className="dd-bordered" onClick={this.startOneOClock}>
            Start the &quot;1 o&apos;clock&quot; meeting
          </button>
        ) : (
          <div>
            <label>
              Current &quot;o&apos;clock&quot; time:
              <input
                className="number"
                type="number"
                min={1}
                max={slotCount}
                value={currentSlotIndex}
                onChange={this.updatePublicNumber('currentSlotIndex')}
              />
            </label>
            <button className="dd-bordered secondary" onClick={this.endMeetings}>
              Turn off current meeting
            </button>
          </div>
        )}
        <TextInput
          multiline
          label="Enter ordered slot topics, one per line"
          onChange={this.updateTopics}
          value={topics}
        />
        <div className="footer">
          <button className="dd-bordered destructive" onClick={this.clear}>
            Clear all meetings!
          </button>
        </div>
      </div>
    )
  }

  updatePublicNumber = prop => e => {
    this.props.fbc.database.public.adminRef(prop).set(+e.target.value)
  }

  updateTopics = e => {
    this.props.fbc.database.public.adminRef('topics').set(e.target.value)
  }

  startOneOClock = () => this.props.fbc.database.public.adminRef('currentSlotIndex').set(1)
  endMeetings = () => this.props.fbc.database.public.adminRef('currentSlotIndex').set(-1)

  clear = () => {
    if (
      window.confirm(
        "Are you sure you want to clear ALL attendees' meetings? This cannot be undone!",
      )
    ) {
      this.props.fbc.database.public.allRef('meetings').remove()
    }
  }
}

export default provideFirebaseConnectorToReactComponent(
  client,
  'magichour',
  (props, fbc) => <App {...props} fbc={fbc} />,
  PureComponent,
)
