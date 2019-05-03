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
import client from '@doubledutch/rn-client'
import Button from './Button'
import { charcoalGray, fontFamily } from './styles'

export default ({ exit, link, primaryColor, text }) => {
  const go = () => client.openURL(link)
  return (
    <View style={s.container}>
      <Text style={s.text}>{text}</Text>
      <Button text="Let's GO!" color={primaryColor} onPress={go} />
      {/* <Button text="Done" color={primaryColor} onPress={exit} secondary style={s.done} /> */}
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginBottom: 20,
    textAlign: 'center',
    fontFamily,
    fontSize: 22,
    color: charcoalGray,
  },
  done: {
    marginTop: 20,
    borderWidth: 1,
    paddingHorizontal: 20,
  },
})
