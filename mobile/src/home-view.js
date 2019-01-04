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
  SafeAreaView as SAV,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

// rn-client must be imported before FirebaseConnector
import client, { TitleBar } from '@doubledutch/rn-client'
import { provideFirebaseConnectorToReactComponent } from '@doubledutch/firebase-connector'
import debounce from 'lodash.debounce'

import Clock from './Clock'

const SafeAreaView = SAV || View // SafeAreaView added in React Native 0.50. Fall back to View.

const cachedUsersKey = 'magichour_cachedUsers'

const getAsyncStorageValue = async key =>
  AsyncStorage.getItem(key).then(val => (val ? JSON.parse(val) : null))
const setAsyncStorageValue = async (key, value) => AsyncStorage.setItem(key, JSON.stringify(value))

class HomeView extends PureComponent {
  state = { selectedIndex: null, meetings: {}, allMeetings: [] }
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
          const meeting = data.val()
          this.setState(({ allMeetings }) => ({ allMeetings: [...allMeetings, meeting] }))
          if (meeting.a === currentUser.id || meeting.b === currentUser.id) {
            const otherId = meeting.a === currentUser.id ? meeting.b : meeting.a
            this.setState(({ meetings }) => ({
              meetings: { ...meetings, [meeting.slotIndex]: otherId },
            }))
          }
        })

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

  render() {
    const { suggestedTitle } = this.props
    const {
      allMeetings,
      currentSlotIndex,
      currentUser,
      meetings,
      primaryColor,
      selectedIndex,
      slotCount,
      topics,
    } = this.state
    if (!currentUser || !primaryColor || !slotCount) return <Text>Loading...</Text>

    const isScanning = selectedIndex != null
    const currentMeeting = currentSlotIndex > -1 ? meetings[currentSlotIndex % slotCount] : null
    const otherUser = currentMeeting ? this.getCachedUser(currentMeeting) : null

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
            <View style={s.info}>
              {isScanning ? (
                <Text>
                  Scan the code for the attendee you are going to meet with during this time slot.
                </Text>
              ) : (
                <Text>Tap an open slot number and scan someone to chat with during that time.</Text>
              )}
            </View>
          )}
          {isScanning && <Button title="Cancel" onPress={this.cancelSlotPress} />}
        </SafeAreaView>
      </View>
    )
  }

  onScan = code => {
    const { allMeetings, selectedIndex, currentUser, meetings } = this.state
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
        this.props.fbc.database.public
          .allRef('meetings')
          .push({ a: currentUser.id, b: scannedUserId, slotIndex: selectedIndex })
      } catch (e) {
        // Bad code
      }
    }
  }

  selectIndex = selectedIndex => this.setState({selectedIndex})

  cancelSlotPress = () => this.setState({ selectedIndex: null })

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
        // this.hydrateUsersDebounced()
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
})

export default provideFirebaseConnectorToReactComponent(
  client,
  'magichour',
  (props, fbc) => <HomeView {...props} fbc={fbc} />,
  PureComponent,
)
