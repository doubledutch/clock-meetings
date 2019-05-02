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
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import client, { Avatar } from '@doubledutch/rn-client'
import { bold, charcoalGray, fontFamily, lightGray } from './styles'
import Button from './Button'

const getId = x => x.id
const selectedSize = 68
const meetingsHorizontalPadding = 16

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

  const { width } = Dimensions.get('window')
  const slotSpacing =
    slots.length <= 1
      ? null
      : {
          marginRight: Math.max(
            10,
            (width - meetingsHorizontalPadding * 2 - slots.length * selectedSize) /
              (slots.length - 1),
          ),
        }

  const Footer = () =>
    attendeesToList.length === 0 ? (
      <Text style={s.footer}>Check back soon as more people join.</Text>
    ) : (
      Separator
    )

  return (
    <View style={s.container}>
      <View style={s.meetings}>
        <Text style={s.title}>Who you&apos;ll be meeting with:</Text>
        <ScrollView horizontal>
          <View style={s.meetingAvatars}>
            {slots.map((m, i) => {
              const style = i < slots.length - 1 ? slotSpacing : null
              return m ? (
                <TouchableOpacity key={m.id} onPress={viewAttendee(m)} style={style}>
                  <Avatar client={client} user={m} size={selectedSize} roundedness={0.35} />
                </TouchableOpacity>
              ) : (
                <NoUser key={i} style={style} />
              )
            })}
          </View>
        </ScrollView>
      </View>
      <FlatList
        data={attendeesToList}
        extraData={extraData}
        renderItem={renderAvailable}
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={Separator}
        ListFooterComponent={Footer}
        keyExtractor={getId}
      />
    </View>
  )
}

const NoUser = ({ style }) => (
  <View style={[s.noUser, style]}>
    <Text style={s.noUserText}>?</Text>
  </View>
)

const Separator = () => <View style={s.separator} />

export default SelectPeople

const s = StyleSheet.create({
  container: { flex: 1 },
  meetings: {
    backgroundColor: 'white',
    paddingTop: 8,
    paddingBottom: 12,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 50,
    elevation: 1,
  },
  meetingAvatars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingHorizontal: meetingsHorizontalPadding,
  },
  title: {
    fontFamily,
    fontSize: 19,
    fontWeight: '600',
    color: charcoalGray,
    paddingHorizontal: meetingsHorizontalPadding,
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
    backgroundColor: 'white',
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
  footer: {
    borderColor: '#dedede',
    borderBottomWidth: 1,
    padding: 20,
    color: lightGray,
    fontStyle: 'italic',
    fontFamily,
    fontSize: 16,
  },
})
