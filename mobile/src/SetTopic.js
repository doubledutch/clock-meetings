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

import React, { PureComponent } from 'react'
import { Animated, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native'
import Button from './Button'
import { formWithSave, TextInputWithDraft } from './Forms'
import { charcoalGray, fontFamily } from './styles'

const kavBehavior = Platform.select({ ios: 'padding', android: null })
export default formWithSave(['topic'], ({ fieldSet, save, primaryColor, otherTopics }) => (
  <KeyboardAvoidingView behavior={kavBehavior} style={s.container}>
    <TextInputWithDraft
      fieldSet={fieldSet}
      prop="topic"
      style={s.input}
      multiline
      placeholder="Deep questions value other people and create empathy. No small talk!"
    />
    <OtherTopics topics={otherTopics} />
    <Button
      text="Save Topic"
      onPress={save}
      color={primaryColor}
      style={s.button}
      disabled={!fieldSet.getValue('topic')}
    />
  </KeyboardAvoidingView>
))

const OtherTopics = ({ topics }) => (
  <View>
    {topics.length > 0 && (
      <Text style={s.wondering}>
        Wondering what question to ask? Here are some recently submitted by other people:
      </Text>
    )}
    <TextCarousel texts={topics} numberOfLines={3} style={s.carousel} />
  </View>
)

class TextCarousel extends PureComponent {
  state = { index: 0, fadeAnim: new Animated.Value(0) }

  componentDidMount() {
    const ms = 6000
    const fadeMs = 300
    this.interval = setInterval(() => this.setState(({ index }) => ({ index: index + 1 })), ms)
    Animated.loop(
      Animated.sequence([
        Animated.timing(this.state.fadeAnim, {
          toValue: 1,
          duration: fadeMs,
          useNativeDriver: true,
        }),
        Animated.delay(ms - fadeMs * 2),
        Animated.timing(this.state.fadeAnim, {
          toValue: 0,
          duration: fadeMs,
          useNativeDriver: true,
        }),
      ]),
    ).start()
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  render() {
    const { style, texts, numberOfLines } = this.props
    const { fadeAnim } = this.state
    if (texts.length === 0) return null
    const index = this.state.index % texts.length

    const fadeStyle = texts.length > 1 ? { opacity: fadeAnim } : null

    return (
      <Animated.Text style={[style, fadeStyle]} numberOfLines={numberOfLines}>
        {texts[index]}
      </Animated.Text>
    )
  }
}

const s = StyleSheet.create({
  container: { marginTop: 8 },
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
  wondering: {
    fontSize: 16,
    color: charcoalGray,
    fontFamily,
    marginVertical: 7,
    fontWeight: 'bold',
  },
  carousel: {
    height: 58,
    fontSize: 16,
    color: charcoalGray,
    fontFamily,
    textAlignVertical: 'center',
  },
})
