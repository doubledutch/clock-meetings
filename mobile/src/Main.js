/*
 * Copyright 2019 DoubleDutch, Inc.
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
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import client, { Avatar } from '@doubledutch/rn-client'
import { Link } from './NavStackRouter'
import Button from './Button'
import SetTopic from './SetTopic'
import { bold, charcoalGray, fontFamily } from './styles'
import chevron from './images/chevron.png.js'

const Main = ({
  attendeesWithTopics,
  currentUser,
  fbc,
  getCachedUser,
  me,
  meetings,
  primaryColor,
  requireIsHere,
  saveTopic,
  slotCount,
  viewAttendeeDetails,
}) => {
  const filledMeetings = meetings.filter(x => x)
  const openSlots = slotCount > filledMeetings.length ? slotCount - filledMeetings.length : 0

  const otherTopics = Object.values(attendeesWithTopics)
    .filter(x => x.id !== me.id)
    .map(x => x.topic)

  const buddyOpener = attendee => () => viewAttendeeDetails(attendee)
  const setIsHere = () => fbc.database.public.userRef('isHere').set(true)

  return (
    <ScrollView style={s.container}>
      <View style={s.you}>
        <View style={s.row}>
          <Avatar user={currentUser} size={62} roundedness={0.5} client={client} />
          <Text style={s.yourName}>
            {currentUser.firstName} {currentUser.lastName}
          </Text>
        </View>
        <Text style={s.yourTopic}>Your Topic:</Text>
        <SetTopic
          topic={me && me.topic}
          onSave={saveTopic}
          primaryColor={primaryColor}
          otherTopics={otherTopics}
        />
      </View>
      <View style={s.slots}>
        <View style={[s.row, s.youHaveContainer]}>
          {openSlots ? (
            <Text style={s.youHave}>
              You have {openSlots} open slot{openSlots === 1 ? '' : 's'}
            </Text>
          ) : (
            <Text style={s.youHave}>You have {slotCount} people to talk with!</Text>
          )}
          {requireIsHere && !me.isHere && (
            <Button
              secondary
              text="I'm Here"
              color={primaryColor}
              style={s.imHere}
              onPress={setIsHere}
            />
          )}
        </View>
        {filledMeetings.map(userId => {
          const buddy = getCachedUser(userId)
          const { topic } = attendeesWithTopics[userId] || {}
          return (
            <Meeting
              key={userId}
              buddy={buddy}
              topic={topic}
              numberOfLines={1}
              onPress={buddyOpener({ ...buddy, topic })}
            />
          )
        })}
        <Link to="/select" style={s.add}>
          <Button text="Add a Person +" color={primaryColor} secondary wrapper={View} />
        </Link>
      </View>
    </ScrollView>
  )
}

export default Main

const Meeting = ({ buddy, topic, numberOfLines, onPress }) => (
  <TouchableOpacity style={s.buddy} onPress={onPress}>
    <Avatar user={buddy} size={55} roundedness={0.5} client={client} />
    <View style={s.buddyDetails}>
      <Text style={s.buddyName}>
        {buddy.firstName} {buddy.lastName}
      </Text>
      <Text style={s.buddyTopic} numberOfLines={numberOfLines}>
        {topic}
      </Text>
    </View>
    <Image source={chevron} style={s.chevron} color={charcoalGray} />
  </TouchableOpacity>
)

const s = StyleSheet.create({
  container: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  you: {
    backgroundColor: 'white',
    padding: 16,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 50,
    elevation: 1,
  },
  yourName: {
    marginLeft: 14,
    color: charcoalGray,
    fontFamily,
    fontSize: 24,
    fontWeight: bold,
  },
  buddyName: {
    color: charcoalGray,
    fontFamily,
    fontSize: 21,
    fontWeight: bold,
  },
  yourTopic: {
    color: charcoalGray,
    fontFamily,
    fontSize: 19,
    marginTop: 16,
    marginBottom: 11,
  },
  buddyTopic: {
    color: charcoalGray,
    fontFamily,
    fontSize: 19,
    marginTop: 3,
  },
  youHave: {
    flex: 1,
    color: charcoalGray,
    fontFamily,
    fontWeight: '700',
    fontSize: 26,
  },
  youHaveContainer: {
    marginTop: 5,
    marginBottom: 8,
  },
  slots: { padding: 16 },
  buddy: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#dedede',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 5,
  },
  buddyDetails: {
    flex: 1,
    marginLeft: 12,
  },
  add: { marginTop: 10 },
  chevron: { height: 14, width: 8 },
  imHere: {
    borderWidth: 1,
    paddingHorizontal: 20,
    marginLeft: 10,
  },
})
