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
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Avatar } from '@doubledutch/rn-client'

const getAttendeeKey = x => `${x.id}-${x.firstName}-${x.lastName}`

const PlannedMeetings = ({ attendees, extraData, primaryColor, viewDetails }) => {
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
    </TouchableOpacity>
  )

  const ListHeader = () => (
    <View style={s.listHeader}>
      <Text style={s.listHeaderText}>Networking Partners</Text>
      <Text style={s.listHeaderDescText}>{attendees.length} chosen so far</Text>
    </View>
  )

  return (
    <View style={s.container}>
      <ListHeader />
      <FlatList
        data={attendees}
        renderItem={renderItem}
        keyExtractor={getAttendeeKey}
        ItemSeparatorComponent={ItemSeparator}
        extraData={extraData}
      />
    </View>
  )
}

export default PlannedMeetings

const ItemSeparator = () => <View style={s.separator} />

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  separator: {
    height: 1,
    backgroundColor: '#d9d9d9',
  },
})
