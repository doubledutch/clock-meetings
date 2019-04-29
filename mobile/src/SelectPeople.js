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
import { StyleSheet, View } from 'react-native'
import AvailableAttendees from './AvailableAttendees'
import PlannedMeetings from './PlannedMeetings'

const SelectPeople = ({
  addMeeting,
  attendeesToList,
  attendeesWithTopics,
  extraData,
  getCachedUser,
  meetings,
  viewAttendeeDetails,
  primaryColor,
  slotCount,
}) => {
  const selectedAttendees = Object.entries(meetings)
    .filter(([, id]) => id)
    .sort(([i1], [i2]) => i1 - i2)
    .map(([, id]) => ({
      ...attendeesWithTopics[id],
      ...getCachedUser(id),
      id,
    }))

  return (
    <View style={s.container}>
      {selectedAttendees.length > 0 && (
        <PlannedMeetings
          attendees={selectedAttendees}
          viewDetails={viewAttendeeDetails}
          primaryColor={primaryColor}
          slotCount={slotCount}
          extraData={extraData}
        />
      )}
      {attendeesToList.length > 0 && (
        <AvailableAttendees
          attendees={attendeesToList}
          viewDetails={viewAttendeeDetails}
          addMeeting={addMeeting}
          primaryColor={primaryColor}
          remainingSlotCount={slotCount - selectedAttendees.length}
          extraData={extraData}
        />
      )}
    </View>
  )
}

export default SelectPeople

const s = StyleSheet.create({
  container: { flex: 1 },
})
