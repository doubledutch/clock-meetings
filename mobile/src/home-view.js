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
  AsyncStorage,
  Button,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

// rn-client must be imported before FirebaseConnector
import client, { Avatar, TitleBar } from '@doubledutch/rn-client'
import { provideFirebaseConnectorToReactComponent } from '@doubledutch/firebase-connector'
import QRCode from 'react-native-qrcode'
import QRCodeScanner from 'react-native-qrcode-scanner'
import debounce from 'lodash.debounce'

import FadeCarousel from './FadeCarousel'
import { hand } from './images'

const avatarSize = 50
const clockPadding = 10
const cachedUsersKey = 'concierge_cachedUsers'

const getAsyncStorageValue = async key =>
  AsyncStorage.getItem(key).then(val => (val ? JSON.parse(val) : null))
const setAsyncStorageValue = async (key, value) => AsyncStorage.setItem(key, JSON.stringify(value))

class HomeView extends PureComponent {
  state = { selectedIndex: null, meetings: {} }
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
          if (meeting.a === currentUser.id || meeting.b === currentUser.id) {
            const otherId = meeting.a === currentUser.id ? meeting.b : meeting.a
            this.setState(({ meetings }) => ({
              meetings: { ...meetings, [meeting.slotIndex]: otherId },
            }))
          }
        })

        meetingsRef.on('child_removed', data => {
          const meeting = data.val()
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
    const { currentSlotIndex, currentUser, meetings, selectedIndex, slotCount, topics } = this.state
    if (!currentUser || !slotCount) return <Text>Loading...</Text>
    const windowWidth = Dimensions.get('window').width
    const width = windowWidth - clockPadding * 2 - avatarSize
    const scanWidth = Math.floor((width - avatarSize) / Math.sqrt(2))
    const scanOffset = (windowWidth - scanWidth) / 2
    const scanPosition = { top: scanOffset, left: scanOffset, height: scanWidth, width: scanWidth }
    const scanSize = { height: scanWidth, width: scanWidth }
    const handHeight = width * 0.9
    const handWidth = handHeight * 0.122388059701493
    const handPosition = {
      height: handHeight,
      width: handWidth,
      top: (windowWidth - handHeight) / 2,
      left: (windowWidth - handWidth) / 2,
    }

    const renderSlot = index => {
      const angle = (index / slotCount) * Math.PI * 2
      const position = {
        top: (width * (1 - Math.cos(angle))) / 2,
        left: (width * (1 + Math.sin(angle))) / 2,
      }

      const number = index || slotCount
      const meetingUserId = meetings[index]
      const user = meetingUserId
        ? this.getCachedUser(meetingUserId)
        : {
            firstName: number > 9 ? `${Math.floor(number / 10)}` : '',
            lastName: `${number % 10}`,
          }
      return (
        <View
          style={selectedIndex === index || currentSlotIndex === index ? s.selected : null}
          key={index}
        >
          <TouchableOpacity style={[s.slot, position]} onPress={() => this.onPressSlot(index)}>
            <Avatar size={avatarSize} user={user} client={client} />
          </TouchableOpacity>
        </View>
      )
    }

    const isScanning = selectedIndex != null
    const currentMeeting = currentSlotIndex > -1 ? meetings[currentSlotIndex % slotCount] : null
    const otherUser = currentMeeting ? this.getCachedUser(currentMeeting) : null

    return (
      <View style={s.container}>
        <TitleBar title="Quick Chats" client={client} signin={this.signin} />
        <View style={s.main}>
          <View style={[s.clock, { height: width }]}>
            {[...Array(slotCount).keys()].map(renderSlot)}
          </View>
          {currentSlotIndex > -1 && (
            <Image
              source={hand}
              style={[
                s.hand,
                handPosition,
                { transform: [{ rotate: `${(currentSlotIndex / slotCount) * 360}deg` }] },
              ]}
            />
          )}
          <View style={[s.scan, scanPosition]}>
            {isScanning ? (
              client._b.isEmulated ? (
                <Text>No scanner in emulator</Text>
              ) : (
                <QRCodeScanner
                  onRead={this.onScan}
                  cameraStyle={scanSize}
                  permissionDialogTitle="Camera Permission"
                  permissionDialogMessage="Required to scan for a meeting slot"
                />
              )
            ) : currentMeeting ? (
              <FadeCarousel key={currentSlotIndex}>
                <View />
                <Avatar size={scanWidth} user={otherUser} client={client} roundedness={0.5} />
                <Avatar size={scanWidth} user={currentUser} client={client} roundedness={0.5} />
                <QRCode size={scanWidth} value={JSON.stringify(currentUser.id)} />
              </FadeCarousel>
            ) : (
              <QRCode size={scanWidth} value={JSON.stringify(currentUser.id)} />
            )}
          </View>
          {currentSlotIndex > -1 ? (
            otherUser ? (
              <View style={s.info}>
                <Text style={s.infoTitle}>
                  Current meeting: {topics[currentSlotIndex % slotCount]}
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
          <View />
          {isScanning && <Button title="Cancel" onPress={this.cancelSlotPress} />}
        </View>
      </View>
    )
  }

  onScan = code => {
    const { selectedIndex, currentUser } = this.state
    this.setState({ selectedIndex: null })
    if (code) {
      try {
        const scannedUserId = JSON.parse(code.data)
        this.props.fbc.database.public
          .allRef('meetings')
          .push({ a: currentUser.id, b: scannedUserId, slotIndex: selectedIndex })
      } catch (e) {
        // Bad code
      }
    }
  }

  onPressSlot = index => {
    const { meetings } = this.state
    if (meetings[index]) {
      client.openURL(`dd://profile/${meetings[index]}`)
    } else {
      this.setState({ selectedIndex: index })
    }
  }

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
  clock: {
    margin: clockPadding,
    flex: 1,
  },
  hand: {
    position: 'absolute',
  },
  slot: {
    position: 'absolute',
  },
  selected: {
    opacity: 0.5,
  },
  scan: {
    position: 'absolute',
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
  'clockmeetings',
  (props, fbc) => <HomeView {...props} fbc={fbc} />,
  PureComponent,
)
