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

function sortMeetings(m1, m2) {
  const mKey = m => `${[m.a, m.b].sort().split('_')}`
  const m1Key = mKey(m1)
  const m2Key = mKey(m2)
  if (m1Key < m2Key) return -1
  if (m1Key > m2Key) return 1
  return 0
}

export function stableIndexForMeetingInSlotIndex(meeting, meetingList) {
  const arr = meetings.sort(sortMeetings)
  return arr.indexOf(meeting)
}
