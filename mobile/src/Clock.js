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
import { Alert, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import client, { Avatar } from '@doubledutch/rn-client'
import QRCode from 'react-native-qrcode'
import QRCodeScanner from 'react-native-qrcode-scanner'

import FadeCarousel from './FadeCarousel'
import { hand } from './images'

const avatarSize = 50
const clockPadding = 10
const indexes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

export default class Clock extends PureComponent {
  render() {
    const {
      currentSlotIndex,
      currentUser,
      getCachedUser,
      meetings,
      selectedIndex,
      slotCount,
      primaryColor,
    } = this.props
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
        ? getCachedUser(meetingUserId)
        : {
            firstName: number > 9 ? `${Math.floor(number / 10)}` : '',
            lastName: `${number % 10}`,
          }

      return (
        <View
          style={[currentSlotIndex === index ? s.selected : null, s.slot, position]}
          key={index}
        >
          <TouchableOpacity onPress={() => this.props.selectIndex(index)}>
            <Avatar
              size={avatarSize}
              user={user}
              client={client}
              backgroundColor={selectedIndex === index ? primaryColor : null}
              roundedness={0.6}
            />
          </TouchableOpacity>
        </View>
      )
    }

    const isScanning = selectedIndex != null && !meetings[selectedIndex]
    const currentMeeting = currentSlotIndex > -1 ? meetings[currentSlotIndex % slotCount] : null
    const otherUser = currentMeeting ? this.props.getCachedUser(currentMeeting) : null

    return (
      <View>
        <View style={[s.clock, { height: width + avatarSize }]}>
          {indexes.slice(0, slotCount).map(renderSlot)}
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
            <Avatar size={scanWidth} user={otherUser} client={client} roundedness={0.6} />
          ) : null}
        </View>
      </View>
    )
  }

  onScan = code => {
    const { addMeeting, allMeetings, selectedIndex, selectIndex, meetings } = this.props
    selectIndex(null)
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
        addMeeting(scannedUserId, selectedIndex)
      } catch (e) {
        Alert.alert('Scan error', e.message)
      }
    }
  }

  cancelSlotPress = () => this.props.selectIndex(null)
}

const s = StyleSheet.create({
  clock: {
    margin: clockPadding,
    flex: 1,
  },
  hand: {
    position: 'absolute',
    zIndex: 3,
  },
  slot: {
    position: 'absolute',
    zIndex: 1,
  },
  selected: {
    opacity: 0.5,
  },
  scan: {
    overflow: 'hidden',
    position: 'absolute',
    zIndex: 2,
  },
})
