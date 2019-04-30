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
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import client, { Avatar } from '@doubledutch/rn-client'
import { charcoalGray, bold, fontFamily } from './styles'
import Button from './Button'

const getId = x => x.id
const selectedSize = 68

const SelectPeople = ({
  addMeeting,
  attendeesToList,
  attendeesWithTopics,
  extraData,
  getCachedUser,
  meetings,
  viewAttendeeDetails,
  slotCount,
}) => {
  const slots = []
  for (let i = 0; i < slotCount; ++i) {
    const id = meetings[i]
    slots[i] = id ? { ...attendeesWithTopics[id], ...getCachedUser(id), id } : null
  }

  const viewAttendee = u => () => viewAttendeeDetails(u)
  const add = u => () => addMeeting(u.id, u.mutuallyAvailableSlots[0])
  function renderAvailable({ item }) {
    return (
      <TouchableOpacity style={s.available} onPress={viewAttendee(item)}>
        <Avatar client={client} user={item} size={77} roundedness={0.33} />
        <View style={s.details}>
          <Text style={s.name}>
            {item.firstName} {item.lastName}
          </Text>
          <Text style={s.topic} numberOfLines={2}>
            {item.topic}
          </Text>
        </View>
        <Button color="#30B95F" text="Add" onPress={add(item)} style={s.add} />
      </TouchableOpacity>
    )
  }

  return (
    <View style={s.container}>
      <View style={s.meetings}>
        <Text style={s.title}>Who you&apos;ll be meeting with:</Text>
        <View style={s.meetingAvatars}>
          {slots.map((m, i) =>
            m ? (
              <TouchableOpacity key={m.id} onPress={viewAttendee(m)}>
                <Avatar client={client} user={m} size={selectedSize} roundedness={0.4} />
              </TouchableOpacity>
            ) : (
              <NoUser key={i} />
            ),
          )}
        </View>
      </View>
      <FlatList
        data={attendeesToList}
        extraData={extraData}
        renderItem={renderAvailable}
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={Separator}
        ListFooterComponent={Separator}
        keyExtractor={getId}
      />
    </View>
  )
}

const NoUser = () => (
  <View style={s.noUser}>
    <Text style={s.noUserText}>?</Text>
  </View>
)

const Separator = () => <View style={s.separator} />

export default SelectPeople

const s = StyleSheet.create({
  container: { flex: 1 },
  meetings: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 50,
    elevation: 1,
  },
  meetingAvatars: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8 },
  title: {
    fontFamily,
    fontSize: 19,
    fontWeight: '600',
    color: charcoalGray,
  },
  noUser: {
    height: selectedSize,
    width: selectedSize,
    borderRadius: selectedSize * 0.2,
    backgroundColor: '#dedede',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noUserText: {
    color: charcoalGray,
    fontFamily,
    fontSize: selectedSize * 0.69,
  },
  available: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  details: {
    flex: 1,
    paddingHorizontal: 8,
    justifyContent: 'space-between',
  },
  name: {
    fontFamily,
    fontSize: 21,
    color: charcoalGray,
    fontWeight: bold,
    marginBottom: 5,
  },
  topic: {
    fontFamily,
    fontSize: 18,
    color: charcoalGray,
    lineHeight: 21,
  },
  add: { paddingHorizontal: 19 },
  separator: { height: 1, backgroundColor: '#dedede' },
})
