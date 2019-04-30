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

import React from 'react'
import {
  Dimensions,
  Image,
  SafeAreaView as SAV,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Avatar, Color } from '@doubledutch/rn-client'

import Timer from './Timer'
import { charcoalGray, fontFamily, bold } from './styles'
import vr from './images/vr.png.js'

const SafeAreaView = SAV || View // SafeAreaView added in React Native 0.50. Fall back to View.

function sortMeetings(m1, m2) {
  const mKey = m => `${[m.a, m.b].sort().join('_')}`
  const m1Key = mKey(m1)
  const m2Key = mKey(m2)
  if (m1Key < m2Key) return -1
  if (m1Key > m2Key) return 1
  return 0
}

const rainbowColor = x => new Color({ h: -x, s: 0.7, v: 0.85 }).rgbString()

const nameSize = user => {
  if (!user) return { fontSize: 43 }
  const maxLength = Math.max(
    user.firstName ? user.firstName.length : 1,
    user.lastName ? user.lastName.length : 1,
  )
  const fontSize = Math.min(330 / maxLength, 43)
  return { fontSize }
}

export default ({
  allMeetings,
  currentMeeting,
  getCachedUser,
  getServerTime,
  meeting,
  meetings,
  topic,
}) => {
  const currentMeetingUserId = meetings[meeting.roundIndex]
  if (!currentMeetingUserId) {
    const height = Dimensions.get('window').height * 0.3
    const vrSize = { height, width: height * (147 / 247) }
    return (
      <View style={s.outer}>
        <View style={s.breakDetail}>
          <Text style={s.round}>Break time!</Text>

          <Timer getTime={getServerTime} targetTime={meeting.endTime} style={s.timer} />
          <Text style={s.instructions}>Take a break!</Text>
          <Text style={s.instructions}>You have nothing scheduled this round.</Text>
        </View>
        <Image source={vr} style={[s.vr, vrSize]} />
      </View>
    )
  }

  const otherUser = getCachedUser(currentMeetingUserId) || {}

  // If every attendee has the same list of all the meetings, and they all sort in the same
  // way, then numbers and colors will match.
  const meetingsThisRound = allMeetings
    .filter(m => m.slotIndex === meeting.roundIndex)
    .sort(sortMeetings)

  const orderIndex = meetingsThisRound.indexOf(currentMeeting)

  const background = {
    backgroundColor: rainbowColor(orderIndex / meetingsThisRound.length),
  }

  return (
    <ScrollView style={[s.outer, background]}>
      <SafeAreaView style={s.inner}>
        <View style={s.top}>
          <Text style={s.number}>{orderIndex + 1}</Text>
          <View style={s.card}>
            <View style={s.row}>
              <Avatar user={otherUser} size={150} roundedness={0.15} />
              <View style={s.userDetail}>
                <Text style={[s.name, nameSize(otherUser)]} key="name">
                  {otherUser.firstName} {otherUser.lastName}
                </Text>
                <Text style={s.title}>{otherUser.title}</Text>
              </View>
            </View>
            <Text style={s.topicTitle}>Topic:</Text>
            <Text style={s.topic}>{topic}</Text>
          </View>
        </View>
        <Text style={s.footer}>
          Look for your talking partner to have the same Number and Color on their phone.
        </Text>
        {/* {meeting.isBreak ? (
          [
            <Text style={s.instructions} key="find">
              Find {otherUser.firstName} for the upcoming round.
            </Text>,
            <Text style={s.instructions} key="same">
              Their screen will have the same color and number.
            </Text>,
          ]
        ) : (
          <Text style={s.round}>Round {meeting.roundIndex + 1}</Text>
        )}
        <Timer getTime={getServerTime} targetTime={meeting.endTime} style={s.timer} />
        {!meeting.isBreak &&
          (topic ? (
            <View style={s.topics}>
              <Text style={s.instructions}>Topic:</Text>
              <Text style={s.topic}>{topic}</Text>
            </View>
          ) : null)} */}
      </SafeAreaView>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingTop: 22,
    paddingHorizontal: 16,
    paddingBottom: 11,
  },
  top: { flex: 1 },
  breakDetail: {
    flex: 1,
    alignItems: 'center',
    marginTop: 70,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
  },
  userDetail: {
    paddingLeft: 12,
    flex: 1,
  },
  name: {
    fontFamily,
    fontSize: 43,
    fontWeight: '500',
    color: charcoalGray,
  },
  title: {
    fontFamily,
    fontSize: 21,
    color: charcoalGray,
  },
  round: {
    fontSize: 32,
    color: charcoalGray,
    fontFamily,
    marginBottom: 10,
  },
  timer: {
    fontSize: 72,
    color: charcoalGray,
    fontFamily,
    fontWeight: '600',
    marginVertical: 20,
  },
  instructions: {
    fontSize: 18,
    color: charcoalGray,
    fontFamily,
    textAlign: 'center',
    marginVertical: 5,
  },
  number: {
    fontSize: 72,
    fontWeight: '600',
    color: 'white',
    fontFamily,
    marginTop: 15,
    marginBottom: 25,
  },
  topicTitle: {
    fontSize: 29,
    fontFamily,
    marginVertical: 5,
    color: charcoalGray,
    fontWeight: bold,
  },
  topic: {
    fontSize: 29,
    fontFamily,
    color: charcoalGray,
  },
  footer: {
    fontSize: 19,
    fontFamily,
    color: 'white',
    textAlign: 'center',
    marginTop: 30,
  },
  vr: {
    position: 'absolute',
    bottom: 15,
    left: 35,
    zIndex: 1,
    resizeMode: 'contain',
  },
})
