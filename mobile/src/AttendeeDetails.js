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
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import client, { Avatar, Color } from '@doubledutch/rn-client'

const getSecondaryColor = primaryColor =>
  new Color(primaryColor)
    .shiftHue(-1 / 3)
    .limitLightness(0.8)
    .rgbString()

const AttendeeDetails = ({
  addMeeting,
  dismiss,
  hasMeeting,
  primaryColor,
  removeMeeting,
  style,
  topic,
  user,
}) => {
  if (!user) return null

  const viewProfile = () => {
    dismiss()
    client.openURL(`dd://profile/${user.id}`)
  }
  const addMeetingWithUser = () => addMeeting(user.id, user.mutuallyAvailableSlots[0], user.topic)
  const removeMeetingWithUser = () => removeMeeting(user.id)

  const primaryBackground = { backgroundColor: primaryColor }
  const secondaryBackground = { backgroundColor: getSecondaryColor(primaryColor) }

  return (
    <View style={style}>
      <View style={s.main}>
        <View style={s.box}>
          <View style={s.row}>
            <Avatar user={user} size={100} roundedness={0.6} />
            <View style={s.infoBox}>
              <Text style={s.name}>
                {user.firstName} {user.lastName}
              </Text>
              <Text style={s.title}>
                {user.title} - {user.company}
              </Text>
            </View>
          </View>
          <View>
            <Text style={s.header}>Topic:</Text>
            <Text style={s.topic}>{topic}</Text>
          </View>
        </View>
        {user.mutuallyAvailableSlots != null && user.mutuallyAvailableSlots.length > 0 && (
          <TouchableOpacity
            onPress={addMeetingWithUser}
            style={[s.footerButton, secondaryBackground]}
          >
            <Text style={s.footerButtonText}>Add Meeting</Text>
          </TouchableOpacity>
        )}
        {hasMeeting && (
          <TouchableOpacity
            onPress={removeMeetingWithUser}
            style={[s.footerButton, s.destructiveBackground]}
          >
            <Text style={s.footerButtonText}>Remove Meeting</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={viewProfile} style={[s.footerButton, primaryBackground]}>
          <Text style={s.footerButtonText}>View Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default AttendeeDetails

const s = StyleSheet.create({
  box: {
    borderColor: '#c9d3de',
    borderWidth: 1,
    backgroundColor: '#f2f6fb',
    padding: 10,
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  infoBox: {
    marginLeft: 10,
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    marginBottom: 5,
    fontWeight: 'bold',
    marginLeft: 0,
    color: '#303030',
  },
  title: {
    fontSize: 14,
    marginBottom: 5,
    color: '#636363',
  },
  header: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  topic: {
    fontSize: 14,
  },
  main: {
    padding: 20,
  },
  footerButton: {
    borderRadius: 20,
    paddingVertical: 15,
    marginTop: 10,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  destructiveBackground: {
    backgroundColor: '#d14e53',
  },
})
