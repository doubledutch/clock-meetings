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
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Avatar } from '@doubledutch/rn-client'
import { plus } from './images'

const getId = x => x.id

const AvailableAttendees = ({ addMeeting, attendees, viewDetails, primaryColor, slotCount }) => {
  const viewAttendeeDetails = attendee => () => viewDetails(attendee)

  const renderItem = ({ item }) => (
    <TouchableOpacity style={s.row} onPress={viewAttendeeDetails(item)}>
      <Avatar size={60} user={item} roundedness={0.6} />
      <View style={s.attendeeInfo}>
        <Text style={s.name}>
          {item.firstName} {item.lastName}
        </Text>
        <Text style={s.topic} ellipsizeMode="tail" numberOfLines={2}>
          {item.topic}
        </Text>
        <Text style={[s.more, { color: primaryColor }]}>More</Text>
      </View>
      <TouchableOpacity
        style={[s.actions, { borderColor: primaryColor }]}
        onPress={() => addMeeting(item.id, item.mutuallyAvailableSlots[0])}
      >
        <Image source={plus} style={[s.actionIcon, { backgroundColor: primaryColor }]} />
      </TouchableOpacity>
    </TouchableOpacity>
  )

  const ListHeader = () => (
    <View style={s.listHeader}>
      <Text style={s.listHeaderText}>Choose Your Networking Partners</Text>
      <Text style={s.listHeaderDescText}>
        Select {slotCount} people to have 5 minute chats with at the event.
      </Text>
    </View>
  )

  return (
    <FlatList
      data={attendees}
      renderItem={renderItem}
      keyExtractor={getId}
      ListHeaderComponent={ListHeader}
      ItemSeparatorComponent={ItemSeparator}
    />
  )
}

export default AvailableAttendees

const ItemSeparator = () => <View style={s.separator} />

const s = StyleSheet.create({
  listHeader: {
    backgroundColor: 'white',
    borderBottomWidth: 2,
    borderColor: '#d9d9d9',
    paddingVertical: 7,
    paddingHorizontal: 15,
  },
  listHeaderText: {
    fontSize: 16,
    fontWeight: '300',
    textAlign: 'left',
  },
  listHeaderDescText: {
    fontSize: 12,
    fontWeight: '300',
    textAlign: 'left',
    color: '#555',
    marginTop: 3,
  },
  row: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
  },
  attendeeInfo: {
    flex: 1,
    marginLeft: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  topic: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  actions: {
    height: 40,
    width: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  actionIcon: {
    height: 20,
    width: 20,
  },
  separator: {
    height: 1,
    backgroundColor: '#d9d9d9',
  },
})
