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
import { StyleSheet, Text, View } from 'react-native'
import client, { Avatar } from '@doubledutch/rn-client'
import { Link } from './NavStackRouter'
import SetTopic from './SetTopic'
import { charcoalGray, fontFamily } from './styles'

const Main = ({ currentUser, meetings, primaryColor, saveTopic, slotCount, me }) => {
  const openSlots = slotCount > meetings.length ? slotCount - meetings.length : 'no'

  return (
    <View style={s.container}>
      <View style={s.you}>
        <View style={s.row}>
          <Avatar user={currentUser} size={62} roundedness={0.5} client={client} />
          <Text style={s.yourName}>
            {currentUser.firstName} {currentUser.lastName}
          </Text>
        </View>
        <Text style={s.yourTopic}>Your Topic:</Text>
        <SetTopic topic={me && me.topic} onSave={saveTopic} primaryColor={primaryColor} />
      </View>
      <View style={s.slots}>
        <Text style={s.youHave}>
          You have {openSlots} open slot{openSlots === 1 ? '' : 's'}
        </Text>
        <Link to="/select">
          <Text>Select People</Text>
        </Link>
      </View>
    </View>
  )
}

export default Main

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
  },
  yourTopic: {
    color: charcoalGray,
    fontFamily,
    fontSize: 19,
    marginTop: 16,
    marginBottom: 11,
  },
  youHave: {
    color: charcoalGray,
    fontFamily,
    fontWeight: '900',
    fontSize: 26,
  },
  slots: { padding: 16, paddingTop: 21 },
})
