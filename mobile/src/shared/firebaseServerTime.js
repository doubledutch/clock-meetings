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

export default function serverTimeFactory(tempRef, ServerValue) {
  // Assume our local clock is correct until Firebase tells us otherwise
  let serverTimeDifference = 0

  tempRef
    .set(ServerValue.TIMESTAMP)
    .then(() => tempRef.once('value'))
    .then(data => {
      const serverNow = data.val()
      if (serverNow) {
        const localNow = new Date().valueOf()
        serverTimeDifference = serverNow - localNow
        tempRef.remove()
      }
    })

  return () => new Date(new Date().valueOf() + serverTimeDifference)
}
