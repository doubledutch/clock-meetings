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

export default function getMeetingState(
  getServerTime,
  { startTime, slotCount, secondsBeforeMeetings, secondsPerMeeting },
) {
  const msBeforeMeetings = secondsBeforeMeetings * 1000
  const msPerMeeting = secondsPerMeeting * 1000
  const now = getServerTime().valueOf()

  // A "round" is a break before a meeting to find your partner, plus the meeting itself.
  const msPerRound = msBeforeMeetings + msPerMeeting
  if (!startTime) {
    return { isLive: false, isMagicHourFinished: false }
  }
  if (now > startTime + slotCount * msPerRound) {
    return { isLive: false, isMagicHourFinished: true }
  }

  const roundIndex = Math.max(0, Math.floor((now - startTime) / msPerRound))
  const roundStarted = startTime + roundIndex * msPerRound
  const msSinceRoundStarted = now - roundStarted
  const isBreak = msSinceRoundStarted < msBeforeMeetings
  const endTime = new Date(roundStarted + msBeforeMeetings + (isBreak ? 0 : msPerMeeting))
  return { isLive: true, roundIndex, isBreak, endTime }
}
