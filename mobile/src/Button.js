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
import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import { bold, fontFamily } from './styles'

export default ({ children, color, disabled, secondary, onPress, style, text, wrapper }) => {
  const buttonStyle = secondary
    ? disabled
      ? { backgroundColor: 'white', borderColor: '#ccc' }
      : { backgroundColor: 'white', borderColor: color }
    : disabled
    ? s.disabled
    : { backgroundColor: color, borderColor: color }

  const textStyle = secondary ? { color: disabled ? '#ccc' : color } : null
  const Wrapper = wrapper || TouchableOpacity
  return (
    <Wrapper onPress={onPress} disabled={disabled} style={[s.button, style, buttonStyle]}>
      {children}
      <Text style={[s.buttonText, textStyle]}>
        {children ? ' ' : ''}
        {text}
      </Text>
    </Wrapper>
  )
}

const s = StyleSheet.create({
  button: {
    flexDirection: 'row',
    borderRadius: 5,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  disabled: {
    backgroundColor: '#ccc',
    borderColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 19,
    fontFamily,
    fontWeight: bold,
  },
})
