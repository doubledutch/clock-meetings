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
import { ServerValue } from '@firebase/database'
import { mapPushedDataToStateObjects } from '@doubledutch/firebase-connector'
import { Avatar, TextInput } from '@doubledutch/react-components'
import CsvParse from '@vtex/react-csv-parse'
import { CSVLink } from '@doubledutch/react-csv'

import { openTab } from './utils'

export default class Admin extends PureComponent {
  state = {
    slotCount: null,
    secondsBeforeMeetings: null,
    secondsPerMeeting: null,
    startTime: null,
    meetings: {},
    users: {},
  }

  componentDidMount() {
    const { fbc } = this.props

    fbc.database.public
      .adminRef('startTime')
      .on('value', data => this.setState({ startTime: data.val() }))
    fbc.database.public
      .adminRef('topics')
      .on('value', data => this.setState({ topics: data.val() || '' }))
    fbc.database.public
      .adminRef('requireIsHere')
      .on('value', data => this.setState({ requireIsHere: data.val() || false }))
    fbc.database.public
      .adminRef('secondsBeforeMeetings')
      .on('value', data => this.setState({ secondsBeforeMeetings: data.val() || 120 }))
    fbc.database.public
      .adminRef('secondsPerMeeting')
      .on('value', data => this.setState({ secondsPerMeeting: data.val() || 300 }))
    fbc.database.public
      .adminRef('slotCount')
      .on('value', data => this.setState({ slotCount: data.val() || 12 }))

    mapPushedDataToStateObjects(fbc.database.public.allRef('meetings'), this, 'meetings')

    mapPushedDataToStateObjects(fbc.database.public.usersRef(), this, 'users', key => {
      // Trigger lookup for attendee as a side-effect, which will delete their data if not found (deleted).
      this.getCachedUser(key)
      return key
    })

    fbc.getLongLivedAdminToken().then(longLivedToken => this.setState({ longLivedToken }))
  }

  render() {
    const {
      meetings,
      requireIsHere,
      secondsBeforeMeetings,
      secondsPerMeeting,
      slotCount,
      startTime,
      topics,
      users,
    } = this.state
    if (slotCount === null) return <div>Loading...</div>

    const userIsHere = id => users[id] != null && users[id].isHere
    const notHereMeetings = requireIsHere
      ? Object.values(meetings).filter(m => !userIsHere(m.a) || !userIsHere(m.b))
      : []

    return (
      <div className="admin vertical space-children">
        <div>
          Host a fast networking opportunity for your attendees. Choose 3-12 slots that attendees
          can fill (e.g. &quot;Will you be my third slot?&quot;), and optionally assign a default
          topic to each slot. Attendees scan each other to confirm their speed-dating-style meeting.
          Begin advancing the clock (suggested 5 minutes per slot) and watch your attendees form
          new, meaningful connections.
        </div>
        <label>
          Number of meeting slots:
          <input
            className="number"
            type="number"
            min={3}
            max={12}
            value={slotCount}
            onChange={this.updatePublicNumber('slotCount')}
          />
        </label>
        <label>
          Seconds per meeting:
          <input
            className="number"
            type="number"
            min={30}
            max={900}
            value={secondsPerMeeting}
            onChange={this.updatePublicNumber('secondsPerMeeting')}
          />
        </label>
        <label>
          Seconds before meetings:
          <input
            className="number"
            type="number"
            min={30}
            max={900}
            value={secondsBeforeMeetings}
            onChange={this.updatePublicNumber('secondsBeforeMeetings')}
          />
        </label>
        <div className="horizontal space-children">
          <button className="dd-bordered" type="button" onClick={this.launchBigScreen}>
            Launch big screen
          </button>
        </div>
        {startTime ? (
          <div>
            TBD: Current meeting (auto)
            {/* <label>
            Current meeting slot:
            <input
              className="number"
              type="number"
              min={1}
              max={slotCount}
              value={currentSlotIndex}
              onChange={this.updatePublicNumber('currentSlotIndex')}
            />
          </label> */}
            <button className="dd-bordered secondary" onClick={this.endMeetings} type="button">
              Turn off current meeting
            </button>
          </div>
        ) : (
          <div className="horizontal space-children">
            <button className="dd-bordered" onClick={this.startOneOClock} type="button">
              Start the first meeting
            </button>
            {requireIsHere ? (
              [
                <button
                  className="dd-bordered secondary"
                  onClick={this.requireIsHere(false)}
                  type="button"
                >
                  Don&apos;t require &quot;I&apos;m here&quot;.
                </button>,
                notHereMeetings.length > 0 ? (
                  <button
                    className="dd-bordered destructive"
                    onClick={() => this.removeMeetings(notHereMeetings)}
                    type="button"
                  >
                    Remove {notHereMeetings.length} meetings of attendees who have not tapped
                    &quot;I&apos;m here&quot;.
                  </button>
                ) : (
                  <span>
                    All attendees with meetings scheduled have tapped &quot;I&apos;m here&quot;.
                  </span>
                ),
              ]
            ) : (
              <button
                className="dd-bordered secondary"
                onClick={this.requireIsHere(true)}
                type="button"
              >
                Require all attendees to tap &quot;I&apos;m here&quot; first.
              </button>
            )}
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
          <button className="dd-bordered destructive" onClick={this.clear} type="button">
            Clear all attendees&apos; scheduled meetings!
          </button>
        </div>
        <div>{Object.keys(meetings).length} meetings booked:</div>
        <div className="space-children vertical">
          {Object.values(meetings).map(m => (
            <div className="space-children horizontal" key={m.id}>
              <button
                className="dd-bordered destructive"
                onClick={() => this.removeMeeting(m.id)}
                type="button"
              >
                REMOVE
              </button>
              <Avatar user={this.getCachedUser(m.a) || {}} />
              <Avatar user={this.getCachedUser(m.b) || {}} />
              <span>
                {(this.getCachedUser(m.a) || {}).firstName}{' '}
                {(this.getCachedUser(m.a) || {}).lastName} -{' '}
                {(this.getCachedUser(m.b) || {}).firstName}{' '}
                {(this.getCachedUser(m.b) || {}).lastName} (slot {m.slotIndex || slotCount})
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  cachedUsers = {}

  getCachedUser = id => {
    let cached = this.cachedUsers[id]
    const now = new Date().valueOf()

    // Refetch attendee in the background if too old.
    if (!cached || !cached.fetched || cached.fetched + 1000 * 60 * 60 * 12 < now) {
      // Cache a placeholder so we don't lookup the same user multiple times
      if (!cached) cached = { id }
      cached.fetched = now
      this.cachedUsers[id] = cached

      const removeAttendee = () => {
        const { fbc } = this.props
        // Remove deleted attendee's info.
        fbc.database.public.usersRef(id).remove()

        // Remove deleted attendee's meetings.
        Object.values(this.state.meetings)
          .filter(m => m.a === id || m.b === id)
          .forEach(m =>
            fbc.database.public
              .allRef('meetings')
              .child(m.id)
              .remove(),
          )
      }

      client
        .getAttendee(id)
        .then(user => {
          this.cachedUsers[id] = { ...user, fetched: now }
          this.setState({ c: now })
          if (!user) removeAttendee()
        })
        .catch(() => {
          this.cachedUsers[id] = { fetched: now }
          removeAttendee()
        })
    }
    return cached
  }

  removeMeeting = id => {
    if (window.confirm(`Are you sure you want to delete this booked meeting?`))
      this.removeMeetingWithoutConfirm(id)
  }

  removeMeetings = meetings => {
    if (
      window.confirm(`Are you sure you want to delete these ${meetings.length} booked meetings?`)
    ) {
      meetings.forEach(m => this.removeMeetingWithoutConfirm(m.id))
    }
  }

  removeMeetingWithoutConfirm = id =>
    this.props.fbc.database.public
      .allRef('meetings')
      .child(id)
      .remove()

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
          obj[attendeeWithTopic.id] =
            attendeeWithTopic.topic && attendeeWithTopic.topic.trim()
              ? { ...attendeeWithTopic, id: null }
              : null // remove attendees with no topic set.
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

  startOneOClock = () =>
    this.props.fbc.database.public.adminRef('startTime').set(ServerValue.TIMESTAMP)

  endMeetings = () => this.props.fbc.database.public.adminRef('startTime').remove()

  requireIsHere = isRequired => () => {
    const { fbc } = this.props
    fbc.database.public.adminRef('requireIsHere').set(isRequired)
    if (isRequired) {
      fbc.database.public.usersRef().once('value', data => {
        Object.entries(data.val() || {})
          .filter(([id, user]) => user.isHere)
          .forEach(([id, user]) =>
            fbc.database.public
              .usersRef(id)
              .child('isHere')
              .remove(),
          )
      })
    }
  }

  clear = () => {
    if (
      window.confirm(
        "Are you sure you want to clear ALL attendees' meetings? This cannot be undone!",
      )
    ) {
      this.props.fbc.database.public.allRef('meetings').remove()
    }
  }

  launchBigScreen = () => {
    openTab(this.bigScreenUrl())
  }

  bigScreenUrl = () =>
    this.state.longLivedToken
      ? `?page=bigScreen&token=${encodeURIComponent(this.state.longLivedToken)}`
      : null
}
