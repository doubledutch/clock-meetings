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
  ScrollView,
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
import debounce from 'lodash.debounce'

import AttendeeDetails from './AttendeeDetails'
import AvailableAttendees from './AvailableAttendees'
import Clock from './Clock'

const SafeAreaView = SAV || View // SafeAreaView added in React Native 0.50. Fall back to View.

const cachedUsersKey = 'magichour_cachedUsers'

const getAsyncStorageValue = async key =>
  AsyncStorage.getItem(key).then(val => (val ? JSON.parse(val) : null))
const setAsyncStorageValue = async (key, value) => AsyncStorage.setItem(key, JSON.stringify(value))

class HomeView extends PureComponent {
  state = { selectedIndex: null, meetings: {}, allMeetings: [], attendeesWithTopics: {} }
  constructor(props) {
    super(props)

    this.signin = props.fbc.signin()
    this.signin.catch(err => console.error(err))

    this.cachedUsers = {}
    getAsyncStorageValue(cachedUsersKey).then(users => {
      this.cachedUsers = { ...(users || {}), ...this.cachedUsers }
    })
  }

  componentDidMount() {
    const { fbc } = this.props
    client.getPrimaryColor().then(primaryColor => this.setState({ primaryColor }))
    client.getCurrentUser().then(currentUser => {
      this.setState({ currentUser })
      this.signin.then(() => {
        const meetingsRef = fbc.database.public.allRef('meetings')
        fbc.database.public
          .adminRef('slotCount')
          .on('value', data => this.setState({ slotCount: data.val() || 12 }))
        fbc.database.public
          .adminRef('topics')
          .on('value', data => this.setState({ topics: [null, ...(data.val() || '').split('\n')] }))
        fbc.database.public
          .adminRef('currentSlotIndex')
          .on('value', data => this.setState({ currentSlotIndex: data.val() || -1 }))
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
    for (let i = 1; i < slotCount; ++i) {
      if (!ourMeetings.find(m => m.slotIndex === i)) available.push(i)
    }
    // Do slot index 0 (12 o'clock?) last
    if (!ourMeetings.find(m => m.slotIndex === 0)) available.push(0)

    return available
  }

  render() {
    const { suggestedTitle } = this.props
    const {
      allMeetings,
      attendeeDetails,
      attendeesWithTopics,
      currentSlotIndex,
      currentUser,
      meetings,
      primaryColor,
      selectedIndex,
      slotCount,
      topics,
    } = this.state
    if (!currentUser || !primaryColor || !slotCount) return <Text>Loading...</Text>

    const isScanning = selectedIndex != null && !meetings[selectedIndex]
    const currentMeeting = currentSlotIndex > -1 ? meetings[currentSlotIndex % slotCount] : null
    const otherUser = currentMeeting ? this.getCachedUser(currentMeeting) : null

    const availableAttendees = Object.entries(attendeesWithTopics)
      .map(([id, attendee]) => ({
        ...attendee,
        id,
        mutuallyAvailableSlots: this.mutuallyAvailableSlotIndexes(id),
      }))
      .filter(a => a.mutuallyAvailableSlots.length)

    const slotsRemaining = slotCount - Object.keys(meetings).length
    const selectedMeetingUserId = meetings[selectedIndex]
    const selectedMeeting =
      selectedMeetingUserId == null
        ? null
        : allMeetings.find(
            m =>
              (m.a === currentUser.id && m.b === selectedMeetingUserId) ||
              (m.b === currentUser.id && m.a === selectedMeetingUserId),
          )

    return (
      <View style={s.container}>
        <TitleBar title={suggestedTitle || 'MagicHour'} client={client} signin={this.signin} />
        <SafeAreaView style={s.main}>
          <ScrollView>
            <Clock
              currentSlotIndex={currentSlotIndex}
              selectedIndex={selectedIndex}
              selectIndex={this.selectIndex}
              meetings={meetings}
              slotCount={slotCount}
              currentUser={currentUser}
              primaryColor={primaryColor}
              allMeetings={allMeetings}
              getCachedUser={this.getCachedUser}
            />
            {allMeetings.length > 1 && (
              <View style={s.booked}>
                <Text style={[s.bookedNum, { color: primaryColor }]}>{allMeetings.length}</Text>
                <Text style={s.bookText}>meetings booked so far</Text>
              </View>
            )}
            {!isScanning && slotsRemaining > 0 && availableAttendees.length > 0 && (
              <Text style={s.bookText}>
                Book conversations you find meaningful and interesting while they are still
                available! You have {slotsRemaining} open slot{slotsRemaining > 1 ? 's' : ''}{' '}
                remaining.
              </Text>
            )}
            {!isScanning && availableAttendees.length > 0 && (
              <AvailableAttendees
                attendees={availableAttendees}
                viewDetails={this.viewAttendeeDetails}
              />
            )}
          </ScrollView>
          {currentSlotIndex > -1 ? (
            otherUser ? (
              <View style={s.info}>
                <Text style={s.infoTitle}>
                  Current meeting: {topics[currentSlotIndex % slotCount || slotCount]}
                </Text>
                <Text style={s.name}>
                  {otherUser.firstName} {otherUser.lastName}
                </Text>
                <Text style={s.title}>{otherUser.title}</Text>
                <Text style={s.title}>{otherUser.company}</Text>
              </View>
            ) : (
              <View style={s.info}>
                <Text style={s.infoTitle}>No meeting currently</Text>
              </View>
            )
          ) : (
            isScanning && (
              <View style={s.info}>
                <Text>
                  Scan the code for the attendee you are going to meet with during this time slot.
                </Text>
              </View>
            )
          )}
          {isScanning && <Button title="Cancel" onPress={this.cancelSlotPress} />}
        </SafeAreaView>
        <Modal
          animationType="slide"
          visible={(!isScanning && !!selectedMeetingUserId) || !!attendeeDetails}
          onRequestClose={() => {}}
        >
          <SafeAreaView style={s.main}>
            <AttendeeDetails
              style={s.modalMain}
              user={
                attendeeDetails ||
                (selectedMeetingUserId && this.getCachedUser(selectedMeetingUserId))
              }
              hasMeeting={!!selectedMeetingUserId && !attendeeDetails}
              topic={(selectedMeeting || {}).topic || (attendeeDetails || {}).topic}
              primaryColor={primaryColor}
              addMeeting={this.addMeeting}
              removeMeeting={this.removeMeeting}
            />
            <TouchableOpacity style={s.closeButton} onPress={this.selectNone}>
              <Text style={[s.closeButtonText, { color: primaryColor }]}>Close</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Modal>
      </View>
    )
  }

  onScan = code => {
    const { allMeetings, selectedIndex, meetings } = this.state
    this.setState({ selectedIndex: null })
    if (code) {
      try {
        const scannedUserId = JSON.parse(code.data)
        if (Object.values(meetings).includes(scannedUserId)) {
          Alert.alert('You already have a meeting scheduled with this person!')
          return
        }
        if (
          allMeetings.find(
            m => m.slotIndex === selectedIndex && (m.a === scannedUserId || m.b === scannedUserId),
          )
        ) {
          Alert.alert('This person already has this slot filled. Sorry!')
          return
        }
        this.addMeeting(scannedUserId, selectedIndex)
      } catch (e) {
        // Bad code
      }
    }
  }

  selectIndex = selectedIndex => this.setState({ selectedIndex, attendeeDetails: null })
  selectNone = () => this.selectIndex(null)

  viewAttendeeDetails = attendeeDetails => this.setState({ attendeeDetails })

  cancelSlotPress = () => this.setState({ selectedIndex: null })

  addMeeting = (userId, slotIndex, topic) => {
    const { currentUser } = this.state
    const { fbc } = this.props
    topic = topic || null
    fbc.database.public
      .allRef('meetings')
      .push({ a: currentUser.id, b: userId, slotIndex, topic })
      .then(() => this.setState({ attendeeDetails: null, selectIndex: null }))
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
        .then(() => this.setState({ attendeeDetails: null, selectedIndex: null }))
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
        this.persistCachedUsers()
      })
    }
    return cached
  }
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d9e1f9',
  },
  main: {
    flex: 1,
  },
  booked: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  bookedNum: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  bookText: {
    marginHorizontal: 10,
    marginVertical: 5,
  },
  info: {
    padding: 10,
  },
  infoTitle: {
    fontSize: 14,
    fontStyle: 'italic',
    color: 'gray',
  },
  name: {
    fontSize: 20,
  },
  title: {
    fontSize: 16,
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
})

export default provideFirebaseConnectorToReactComponent(
  client,
  'magichour',
  (props, fbc) => <HomeView {...props} fbc={fbc} />,
  PureComponent,
)
