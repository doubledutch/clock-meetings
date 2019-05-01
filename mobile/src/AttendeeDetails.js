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
import { StyleSheet, Text, View } from 'react-native'
import client, { Avatar } from '@doubledutch/rn-client'
import Button from './Button'
import { bold, charcoalGray, fontFamily } from './styles'

const nameSize = user => {
  if (!user) return { fontSize: 43 }
  const maxLength = Math.max(
    user.firstName ? user.firstName.length : 1,
    user.lastName ? user.lastName.length : 1,
  )
  const fontSize = Math.min(280 / maxLength, 43)
  return { fontSize }
}

const AttendeeDetails = ({
  addMeeting,
  dismiss,
  hasMeeting,
  mutuallyAvailableSlotIndexes,
  primaryColor,
  removeMeeting,
  style,
  user,
}) => {
  if (!user) return null

  const viewProfile = () => {
    dismiss()
    client.openURL(`dd://profile/${user.id}`)
  }
  const addMeetingWithUser = () => addMeeting(user.id, mutuallyAvailableSlotIndexes[0])
  const removeMeetingWithUser = () => removeMeeting(user.id)

  const nameSizeStyle = nameSize(user)

  return (
    <View style={style}>
      <View style={s.main}>
        <View style={s.box}>
          <View style={s.row}>
            <Avatar user={user} size={150} roundedness={0.15} />
            <View style={s.infoBox}>
              <Text style={[s.name, nameSizeStyle]}>{user.firstName}</Text>
              <Text style={[s.name, nameSizeStyle]}>{user.lastName}</Text>
              <Text style={s.title}>{user.title}</Text>
            </View>
          </View>
          <View>
            <Text style={[s.topic, s.bold]}>Topic:</Text>
            <Text style={s.topic}>{user.topic}</Text>
          </View>
        </View>
        {mutuallyAvailableSlotIndexes.length > 0 && (
          <Button text="Add" color="#30B95F" onPress={addMeetingWithUser} />
        )}
        {hasMeeting && <Button text="Remove" color="#B93636" onPress={removeMeetingWithUser} />}
        <Button
          style={s.bottomButton}
          text="View Profile"
          color={primaryColor}
          onPress={viewProfile}
        />
      </View>
    </View>
  )
}

export default AttendeeDetails

const s = StyleSheet.create({
  box: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 1,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  infoBox: {
    marginLeft: 12,
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  name: {
    fontSize: 43,
    marginBottom: 5,
    fontWeight: '700',
    marginLeft: 0,
    color: charcoalGray,
    fontFamily,
  },
  title: {
    fontSize: 21,
    marginBottom: 5,
    color: charcoalGray,
    fontFamily,
  },
  topic: {
    fontSize: 29,
    fontFamily,
    color: charcoalGray,
  },
  bold: { fontWeight: bold },
  main: {
    padding: 16,
  },
  bottomButton: { marginTop: 15 },
})
