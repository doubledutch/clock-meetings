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
import {
  Alert,
  AsyncStorage,
  Button,
  Modal,
  SafeAreaView as SAV,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

// rn-client must be imported before FirebaseConnector
import client, { TitleBar } from '@doubledutch/rn-client'
import {
  provideFirebaseConnectorToReactComponent,
  mapPushedDataToStateObjects,
} from '@doubledutch/firebase-connector'
import { ServerValue } from '@firebase/database'

import debounce from 'lodash.debounce'

import AttendeeDetails from './AttendeeDetails'
import AvailableAttendees from './AvailableAttendees'
import LiveMeeting from './LiveMeeting'
import PlannedMeetings from './PlannedMeetings'
import SetTopic from './SetTopic'
import Welcome from './Welcome'
import serverTimeFactory from './shared/firebaseServerTime'
import getMeetingState from './shared/getMeetingState'
// import fire

const SafeAreaView = SAV || View // SafeAreaView added in React Native 0.50. Fall back to View.

const cachedUsersKey = 'magichour_cachedUsers'
const welcomeCompleteKey = 'magichour_welcomeComplete'
const topicCompleteKey = 'magichour_topicComplete'

const getAsyncStorageValue = async key =>
  AsyncStorage.getItem(key).then(val => (val ? JSON.parse(val) : null))
const setAsyncStorageValue = async (key, value) => AsyncStorage.setItem(key, JSON.stringify(value))

class HomeView extends PureComponent {
  state = {
    allMeetings: [],
    attendeesWithTopics: {},
    meeting: { isLive: false },
    meetings: {},
    showSettings: false,
    startTime: null,
    slotCount: null,
    secondsBeforeMeetings: null,
    secondsPerMeeting: null,
  }
  constructor(props) {
    super(props)

    this.signin = props.fbc.signin()
    this.signin.catch(err => console.error(err))

    this.cachedUsers = {}
    getAsyncStorageValue(cachedUsersKey).then(users => {
      this.cachedUsers = { ...(users || {}), ...this.cachedUsers }
    })
    getAsyncStorageValue(welcomeCompleteKey).then(isWelcomeComplete =>
      this.setState({ isWelcomeComplete }),
    )
    getAsyncStorageValue(topicCompleteKey).then(isTopicComplete =>
      this.setState({ isTopicComplete }),
    )
  }

  componentDidMount() {
    const { fbc } = this.props
    client.getPrimaryColor().then(primaryColor => this.setState({ primaryColor }))
    client.getCurrentUser().then(currentUser => {
      this.setState({ currentUser })
      this.signin.then(() => {
        this.getServerTime = serverTimeFactory(fbc.database.private.userRef('st'), ServerValue)

        const meetingsRef = fbc.database.public.allRef('meetings')

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

        fbc.database.public
          .adminRef('topics')
          .on('value', data => this.setState({ topics: [null, ...(data.val() || '').split('\n')] }))
        fbc.database.public
          .adminRef('requireIsHere')
          .on('value', data => this.setState({ requireIsHere: data.val() || false }))

        meetingsRef.on('child_added', data => {
          const meeting = { ...data.val(), id: data.key }
          this.setState(({ allMeetings }) => ({ allMeetings: [...allMeetings, meeting] }))
          if (meeting.a === currentUser.id || meeting.b === currentUser.id) {
            const otherId = meeting.a === currentUser.id ? meeting.b : meeting.a
            this.setState(({ meetings }) => ({
              meetings: { ...meetings, [meeting.slotIndex]: otherId },
            }))
          }
        })

        mapPushedDataToStateObjects(fbc.database.public.usersRef(), this, 'attendeesWithTopics')

        meetingsRef.on('child_removed', data => {
          const meeting = data.val()
          this.setState(({ allMeetings }) => ({
            allMeetings: allMeetings.filter(
              m => m.a !== meeting.a || m.b !== meeting.b || m.slotIndex !== meeting.slotIndex,
            ),
          }))
          if (meeting.a === currentUser.id || meeting.b === currentUser.id) {
            this.setState(({ meetings }) => ({
              meetings: { ...meetings, [meeting.slotIndex]: null },
            }))
          }
        })
      })

      // When debugging, the firebase signin Promise has to be coerced into resolving :/
      if (client._b.isEmulated)
        setTimeout(() => fbc.database.public.adminRef('junk').once('value'), 1000)
    })
  }

  componentDidUpdate(_, prevState) {
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
    const meeting = getMeetingState(this.getServerTime, this.state)
    this.setState({ meeting })
    if (meeting.isLive) setTimeout(this.setTimer, meeting.endTime - this.getServerTime())
  }

  mutuallyAvailableSlotIndexes = otherId => {
    const { allMeetings, currentUser, slotCount } = this.state
    const ourMeetings = allMeetings.filter(
      m => m.a === currentUser.id || m.b === currentUser.id || m.a === otherId || m.b === otherId,
    )

    // If we already have a meeting set with this attendee, don't show that we can schedule another slot.
    if (
      ourMeetings.find(
        m =>
          (m.a === currentUser.id && m.b === otherId) ||
          (m.a === otherId && m.b === currentUser.id),
      )
    ) {
      return []
    }

    const available = []
    for (let i = 0; i < slotCount; ++i) {
      if (!ourMeetings.find(m => m.slotIndex === i)) available.push(i)
    }

    return available
  }

  render() {
    const { suggestedTitle } = this.props
    const {
      allMeetings,
      attendeeDetails,
      attendeesWithTopics,
      currentUser,
      isTopicComplete,
      isWelcomeComplete,
      meeting,
      meetings,
      primaryColor,
      requireIsHere,
      secondsPerMeeting,
      showSettings,
      slotCount,
      topics,
    } = this.state
    if (!currentUser || !primaryColor || !slotCount) return <Text>Loading...</Text>

    const meetingWith = userId =>
      userId == null
        ? null
        : allMeetings.find(
            m =>
              (m.a === currentUser.id && m.b === userId) ||
              (m.b === currentUser.id && m.a === userId),
          )

    const currentMeetingUserId = meeting.isLive ? meetings[meeting.roundIndex % slotCount] : null
    const currentMeeting = meetingWith(currentMeetingUserId)

    const availableAttendees = Object.entries(attendeesWithTopics)
      .map(([id, attendee]) => ({
        ...attendee,
        ...this.getCachedUser(id),
        id,
        mutuallyAvailableSlots: this.mutuallyAvailableSlotIndexes(id),
      }))
      .filter(a => a.mutuallyAvailableSlots.length && a.id !== currentUser.id)

    const selectedAttendees = Object.entries(meetings)
      .filter(([, id]) => id)
      .sort(([i1], [i2]) => i1 - i2)
      .map(([, id]) => ({
        ...attendeesWithTopics[id],
        ...this.getCachedUser(id),
        id,
      }))

    let attendeesToList = availableAttendees

    if (requireIsHere) {
      attendeesToList = attendeesToList.filter(u => u.isHere)
    }

    const me = attendeesWithTopics[currentUser.id] || {}
    const title = suggestedTitle || 'MagicHour'
    const topicsForMeeting = m => {
      if (!m) return []
      const a = attendeesWithTopics[m.a]
      const b = attendeesWithTopics[m.b]
      return [a && a.topic, b && b.topic].filter(x => x)
    }

    const renderContent = () =>
      requireIsHere && !me.isHere ? (
        <SafeAreaView style={s.ready}>
          <Text style={s.readyText}>Are you ready for {title}?</Text>
          <Text style={s.readyText}>Mark yourself as ready!</Text>
          <Button title="I'm Here" onPress={this.setIsHere} />
          <SettingsButton onPress={this.showSettings} />
        </SafeAreaView>
      ) : meeting.isLive ? (
        <LiveMeeting
          allMeetings={allMeetings}
          currentMeeting={currentMeeting}
          meeting={meeting}
          meetings={meetings}
          topics={topicsForMeeting(currentMeeting)}
          defaultTopic={topics && topics[meeting.roundIndex]}
          slotCount={slotCount}
          currentUser={currentUser}
          primaryColor={primaryColor}
          getCachedUser={this.getCachedUser}
          getServerTime={this.getServerTime}
          otherData={this.state.c}
        />
      ) : (
        <View style={s.container}>
          {selectedAttendees.length > 0 && (
            <PlannedMeetings
              attendees={selectedAttendees}
              viewDetails={this.viewAttendeeDetails}
              primaryColor={primaryColor}
              otherData={this.state.c}
            />
          )}
          {attendeesToList.length > 0 && (
            <AvailableAttendees
              attendees={attendeesToList}
              viewDetails={this.viewAttendeeDetails}
              addMeeting={this.addMeeting}
              primaryColor={primaryColor}
              slotCount={slotCount}
              secondsPerMeeting={secondsPerMeeting}
              otherData={this.state.c}
            />
          )}
          <SettingsButton onPress={this.showSettings} />
        </View>
      )
    // {meeting.isLive &&
    //   (otherUser ? (
    //     <View style={s.info}>
    //       <Text style={s.infoTitle}>
    //         Current meeting:{' '}
    //         {(currentMeeting && topicForMeeting(currentMeeting)) ||
    //           topics[meeting.roundIndex % slotCount || slotCount]}
    //       </Text>
    //       <Text style={s.name}>
    //         {otherUser.firstName} {otherUser.lastName}
    //       </Text>
    //       <Text style={s.title}>{otherUser.title}</Text>
    //       <Text style={s.title}>{otherUser.company}</Text>
    //     </View>
    //   ) : (
    //     <View style={s.info}>
    //       <Text style={s.infoTitle}>No meeting currently</Text>
    //     </View>
    //   ))}

    const helpTexts = [
      `Magic Hour is a live, face-to-face speed-networking experience designed to get rid of small talk and make sure everyone walks away with at least ${slotCount} new friends`,
      `Browse through guests’ topics and choose ${slotCount} conversation partners now. You’ll get 5 minutes with each person you choose.`,
      'If you don’t choose now, you can scan QR codes of people live at the event. However, you might find yourself with a more limited selection of partners. Ready? Set? Choose your partners!',
    ]

    return (
      <View style={s.container}>
        <TitleBar title={title} client={client} signin={this.signin} />
        {isTopicComplete ? (
          renderContent()
        ) : isWelcomeComplete ? (
          <SafeAreaView style={s.container}>
            <SetTopic topic={me && me.topic} onSave={this.saveTopic} primaryColor={primaryColor} />
          </SafeAreaView>
        ) : (
          <Welcome
            dismiss={this.dismissWelcome}
            primaryColor={primaryColor}
            helpTexts={helpTexts}
          />
        )}
        <Modal animationType="slide" visible={showSettings}>
          <SafeAreaView style={s.container}>
            <SetTopic topic={me && me.topic} onSave={this.saveTopic} primaryColor={primaryColor} />
          </SafeAreaView>
        </Modal>
        <Modal animationType="slide" visible={!!attendeeDetails} onRequestClose={() => {}}>
          <SafeAreaView style={s.main}>
            <AttendeeDetails
              style={s.modalMain}
              user={attendeeDetails}
              hasMeeting={!!attendeeDetails && Object.values(meetings).includes(attendeeDetails.id)}
              primaryColor={primaryColor}
              addMeeting={this.addMeeting}
              removeMeeting={this.removeMeeting}
              dismiss={this.selectNone}
            />
            <TouchableOpacity style={s.closeButton} onPress={this.selectNone}>
              <Text style={[s.closeButtonText, { color: primaryColor }]}>Close</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Modal>
      </View>
    )
  }

  dismissWelcome = () => {
    this.setState({ isWelcomeComplete: true })
    setAsyncStorageValue(welcomeCompleteKey, true)
  }

  saveTopic = ({ topic }) => {
    this.setState({ isTopicComplete: true, showSettings: false })
    this.props.fbc.database.public.userRef('topic').set(topic)
    setAsyncStorageValue(topicCompleteKey, true)
  }

  selectNone = () => this.viewAttendeeDetails(null)

  showSettings = () => this.setState({ showSettings: true })

  viewAttendeeDetails = attendeeDetails => this.setState({ attendeeDetails })

  setIsHere = () => this.props.fbc.database.public.userRef('isHere').set(true)

  addMeeting = (userId, slotIndex) => {
    const { currentUser } = this.state
    const { fbc } = this.props
    fbc.database.public.allRef('meetings').push({ a: currentUser.id, b: userId, slotIndex })
    this.setState({ attendeeDetails: null })
  }

  removeMeeting = userId => {
    const { allMeetings, currentUser } = this.state
    const { fbc } = this.props
    const meeting = allMeetings.find(
      m => (m.a === currentUser.id && m.b === userId) || (m.a === userId && m.b === currentUser.id),
    )

    if (meeting)
      fbc.database.public
        .allRef('meetings')
        .child(meeting.id)
        .remove()
        .then(() => this.setState({ attendeeDetails: null }))
  }

  persistCachedUsers = debounce(() => setAsyncStorageValue(cachedUsersKey, this.cachedUsers), 5000)
  getCachedUser = id => {
    let cached = this.cachedUsers[id]
    const now = new Date().valueOf()

    // Refetch attendee in the background if too old.
    if (!cached || !cached.fetched || cached.fetched + 1000 * 60 * 60 * 12 < now) {
      // Cache a placeholder so we don't lookup the same user multiple times
      if (!cached) cached = { id }
      cached.fetched = now
      this.cachedUsers[id] = cached

      client.getAttendee(id).then(user => {
        this.cachedUsers[id] = { ...user, fetched: now }
        this.setState({ c: now })
        this.persistCachedUsers()
      })
    }
    return cached
  }
}

const SettingsButton = ({ onPress }) => (
  <TouchableOpacity onPress={onPress} style={s.settingsButton}>
    <Text style={s.settingsGear}>⚙️</Text>
  </TouchableOpacity>
)

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d9e1f9',
  },
  main: {
    flex: 1,
  },
  info: {
    padding: 10,
    backgroundColor: 'white',
    zIndex: 2,
  },
  modalMain: {
    flex: 1,
  },
  closeButton: {
    padding: 10,
    marginBottom: 20,
  },
  closeButtonText: {
    fontSize: 24,
    textAlign: 'center',
    color: '#fff',
  },
  ready: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  readyText: {
    fontSize: 24,
    margin: 10,
    textAlign: 'center',
  },
  settingsButton: {
    zIndex: 1,
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 10,
  },
  settingsGear: {
    fontSize: 30,
    backgroundColor: 'transparent',
  },
})

export default provideFirebaseConnectorToReactComponent(
  client,
  'magichour',
  (props, fbc) => <HomeView {...props} fbc={fbc} />,
  PureComponent,
)
