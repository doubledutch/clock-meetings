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

const renderItem = ({ item }) => (
  <TouchableOpacity style={s.row}>
    <Avatar size={60} user={item} roundedness={0.6} />
    <View style={s.attendeeInfo}>
      <Text style={s.name}>
        {item.firstName} {item.lastName}
      </Text>
      <Text style={s.topic} ellipsizeMode="tail" numberOfLines={3}>
        {item.topic}
      </Text>
    </View>
  </TouchableOpacity>
)

const getId = x => x.id

const AvailableAttendees = ({ attendees }) => (
  <FlatList
    style={s.list}
    data={attendees}
    renderItem={renderItem}
    keyExtractor={getId}
    ListHeaderComponent={ListHeader}
    ItemSeparatorComponent={ItemSeparator}
  />
)

export default AvailableAttendees

const ListHeader = () => <Text style={s.listHeader}>AVAILABLE TOPICS</Text>

const ItemSeparator = () => <View style={s.separator} />

const s = StyleSheet.create({
  list: {
    margin: 10,
  },
  listHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 7,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
    flex: 1,
  },
  separator: {
    height: 10,
  },
})
