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
import { SafeAreaView as SAV, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Avatar, Color } from '@doubledutch/rn-client'

import Timer from './Timer'

const SafeAreaView = SAV || View // SafeAreaView added in React Native 0.50. Fall back to View.

function sortMeetings(m1, m2) {
  const mKey = m => `${[m.a, m.b].sort().join('_')}`
  const m1Key = mKey(m1)
  const m2Key = mKey(m2)
  if (m1Key < m2Key) return -1
  if (m1Key > m2Key) return 1
  return 0
}

const rainbowColor = x => new Color({ h: -x, s: 1, v: 0.8 }).rgbString()

export default ({
  allMeetings,
  currentMeeting,
  defaultTopic,
  getCachedUser,
  getServerTime,
  meeting,
  meetings,
  topics,
}) => {
  const currentMeetingUserId = meetings[meeting.roundIndex]
  if (!currentMeetingUserId) {
    return (
      <View style={s.outer}>
        <SafeAreaView style={s.inner}>
          {meeting.isBreak ? (
            <Text style={s.round}>Break</Text>
          ) : (
            <Text style={s.round}>Round {meeting.roundIndex + 1}</Text>
          )}

          <Timer getTime={getServerTime} targetTime={meeting.endTime} style={s.timer} />
          <Text style={s.instructions}>Take a break!</Text>
          <Text style={s.instructions}>You have nothing scheduled this round.</Text>
        </SafeAreaView>
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
        <Text style={s.number}>{orderIndex + 1}</Text>
        <Avatar user={otherUser} size={150} roundedness={0.6} />
        <Text style={s.name} key="name">
          {otherUser.firstName} {otherUser.lastName}
        </Text>
        {meeting.isBreak ? (
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
          (topics.length > 0 ? (
            <View style={s.topics}>
              <Text style={s.instructions}>Your topics:</Text>
              {topics.map(t => (
                <Text style={s.topic} key={t}>
                  {t}
                </Text>
              ))}
            </View>
          ) : (
            !!defaultTopic && (
              <View style={s.topics}>
                <Text style={s.instructions}>Your topics:</Text>
                {topics.map(t => (
                  <Text style={s.topic} key={t}>
                    {t}
                  </Text>
                ))}
              </View>
            )
          ))}
      </SafeAreaView>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: 'black',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  round: {
    fontSize: 32,
    color: 'white',
    marginBottom: 10,
  },
  timer: {
    fontSize: 60,
    color: 'white',
    marginVertical: 20,
  },
  instructions: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginVertical: 5,
  },
  name: {
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
    marginVertical: 5,
  },
  number: {
    fontSize: 100,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginVertical: 15,
  },
  topics: {
    marginHorizontal: 10,
  },
  topic: {
    fontSize: 14,
    marginVertical: 5,
    color: 'white',
  },
})
