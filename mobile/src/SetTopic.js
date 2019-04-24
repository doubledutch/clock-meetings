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
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native'
import Button from './Button'
import { formWithSave, TextInputWithDraft } from './Forms'
import { charcoalGray } from './styles'

const kavBehavior = Platform.select({ ios: 'padding', android: null })
export default formWithSave(['topic'], ({ fieldSet, save, primaryColor }) => (
  <KeyboardAvoidingView behavior={kavBehavior}>
    <TextInputWithDraft
      fieldSet={fieldSet}
      prop="topic"
      style={s.input}
      multiline
      placeholder="e.g. How do you define a life well-lived?"
    />
    <Button text="SAVE" onPress={save} color={primaryColor} style={s.button} />
  </KeyboardAvoidingView>
))

const s = StyleSheet.create({
  input: {
    fontSize: 16,
    height: 105,
    backgroundColor: '#f8f8f8',
    padding: 12,
    paddingTop: 12,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#ccc',
    color: charcoalGray,
  },
  button: {
    marginTop: 10,
  },
})
