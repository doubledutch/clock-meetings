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
import { KeyboardAvoidingView, Platform, StyleSheet, Text } from 'react-native'
import Button from './Button'
import { formWithSave, TextInputWithDraft } from './Forms'

const kavBehavior = Platform.select({ ios: 'padding', android: null })
export default formWithSave(['topic'], ({ fieldSet, save, primaryColor }) => (
  <KeyboardAvoidingView style={s.container} behavior={kavBehavior}>
    <Text style={s.instructions}>
      Set or change the question you want to talk about during Magic Hour! No small talk, go for the
      deep questions (other guests select you based on the depth of your questions).
    </Text>
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
  container: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  instructions: {
    padding: 10,
    paddingTop: 30, // Hack to get around the fact that React Native 0.46 doesn't support SafeAreaView
    fontSize: 16,
  },
  input: {
    fontSize: 16,
    flex: 1,
    backgroundColor: 'white',
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  button: {
    margin: 10,
    marginBottom: 80,
  },
})
