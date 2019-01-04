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
import CsvParse from '@vtex/react-csv-parse'
import { CSVLink } from 'react-csv'
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
        <div>
          Host a fast networking opportunity for your attendees. Choose 3-12 slots that attendees
          can fill (e.g. &quot;Will you be my &apos;three o&apos;clock?&apos;&quot;), and optionally
          assign a default topic to each slot. Attendees scan each other to confirm their
          speed-dating-style meeting. Begin advancing the &quot;clock&quot; (suggested 5 minutes per
          slot) and watch your attendees form new, meaningful connections.
        </div>
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
        <h2>Upload personal topics</h2>
        <CsvParse
          className="csv-input"
          keys={['email', 'topic']}
          onDataUploaded={this.handleImport}
          onError={this.handleError}
          render={onChange => <input type="file" onChange={onChange} />}
        />
        <CSVLink className="csvButton" data={this.getCSVTemplate()} filename="personal-topics.csv">
          Download Template
        </CSVLink>
        <TextInput
          multiline
          label="Enter ordered default slot topics, one per line (optional). These are used if attendees do not have personal topics selected."
          onChange={this.updateTopics}
          value={topics}
        />
        <div className="footer">
          <button className="dd-bordered destructive" onClick={this.clear}>
            Clear all attendees&apos; scheduled meetings!
          </button>
        </div>
      </div>
    )
  }

  getCSVTemplate = () => [
    {
      email: 'jean@valjean.com',
      topic:
        'Personal: What are good ways to meet friends in a new city? Professional: How do you approach a salary negotiation?',
    },
  ]

  handleImport = data => {
    const { fbc } = this.props
    const attendeePromises = data.map(({ email, topic }) =>
      client
        .getAttendees(email)
        .then(as => (as.length ? { ...as[0], topic } : null))
        .catch(() => null),
    )
    Promise.all(attendeePromises)
      .then(topics => topics.filter(x => x && x.id && x.topic != null))
      .then(attendeesWithTopics => {
        const attendeeUpdates = attendeesWithTopics.reduce((obj, attendeeWithTopic) => {
          obj[attendeeWithTopic.id] = { ...attendeeWithTopic, id: null }
          return obj
        }, {})
        fbc.database.public.usersRef().update(attendeeUpdates)
        let message = `Topics updated for ${attendeesWithTopics.length} attendees.`
        if (data.length > attendeesWithTopics.length) {
          message += ` ${data.length - attendeesWithTopics.length} attendees were not found.`
        }
        window.alert(message)
      })
  }

  handleError = error => console.error(error)

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
