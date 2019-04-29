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
import Button from './Button'
import { bold, charcoalGray, fontFamily } from './styles'

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
  user,
}) => {
  if (!user) return null

  const viewProfile = () => {
    dismiss()
    client.openURL(`dd://profile/${user.id}`)
  }
  const addMeetingWithUser = () => addMeeting(user.id, user.mutuallyAvailableSlots[0])
  const removeMeetingWithUser = () => removeMeeting(user.id)

  const primaryBackground = { backgroundColor: primaryColor }
  const secondaryBackground = { backgroundColor: getSecondaryColor(primaryColor) }

  return (
    <View style={style}>
      <View style={s.main}>
        <View style={s.box}>
          <View style={s.row}>
            <Avatar user={user} size={150} roundedness={0.15} />
            <View style={s.infoBox}>
              <Text style={s.name}>
                {user.firstName} {user.lastName}
              </Text>
              <Text style={s.title}>{user.title}</Text>
            </View>
          </View>
          <View>
            <Text style={s.header}>Topic:</Text>
            <Text style={s.topic}>{user.topic}</Text>
          </View>
        </View>
        {user.mutuallyAvailableSlots != null && user.mutuallyAvailableSlots.length > 0 && (
          <Button text="Add Meeting" color="#30B95F" onPress={addMeetingWithUser} />
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
  header: {
    fontWeight: bold,
    fontSize: 14,
    fontFamily,
  },
  topic: {
    fontSize: 14,
    fontFamily,
    color: charcoalGray,
  },
  main: {
    padding: 16,
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
    fontWeight: bold,
    fontFamily,
  },
  destructiveBackground: {
    backgroundColor: '#d14e53',
  },
})
