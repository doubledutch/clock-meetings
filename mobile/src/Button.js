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
import { fontFamily } from './styles'

export default ({ children, color, disabled, onPress, style, text }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={[s.button, style, disabled ? s.disabled : { backgroundColor: color }]}
  >
    {children}
    <Text style={s.buttonText}>
      {children ? ' ' : ''}
      {text}
    </Text>
  </TouchableOpacity>
)

const s = StyleSheet.create({
  button: {
    flexDirection: 'row',
    borderRadius: 5,
    padding: 10,
    justifyContent: 'center',
  },
  disabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontFamily,
    fontWeight: '900',
  },
})
