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
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Box from './Box'

export default class Welcome extends PureComponent {
  state = { step: 0 }

  render() {
    const { step } = this.state
    const { texts } = this.props
    return (
      <Box style={[s.carousel, this.props.style]}>
        <View style={s.textContainer}>
          <Text style={s.text}>{texts[step]}</Text>
        </View>
        <View style={s.carouselDots}>
          {texts.map((t, i) => (
            <View key={texts[i]} style={[s.carouselDot, i === step ? s.carouselDotFilled : null]} />
          ))}
        </View>
        {step > 0 && (
          <TouchableOpacity style={[s.arrow, s.arrowLeft]} onPress={this.prev}>
            <Text style={s.arrowText}>←</Text>
          </TouchableOpacity>
        )}
        {step < texts.length - 1 && (
          <TouchableOpacity style={[s.arrow, s.arrowRight]} onPress={this.next}>
            <Text style={s.arrowText}>→</Text>
          </TouchableOpacity>
        )}
      </Box>
    )
  }

  moveStep(increment) {
    const step = this.state.step + increment
    this.setState({ step })
    if (this.props.onStepChange)
      this.props.onStepChange({ step, stepCount: this.props.texts.length })
  }

  next = () => this.moveStep(1)

  prev = () => this.moveStep(-1)
}

const carouselDotSize = 10
const s = StyleSheet.create({
  textContainer: {
    paddingVertical: 4,
  },
  text: {
    fontSize: 16,
  },
  carousel: {
    margin: 7,
    padding: 7,
    borderRadius: 5,
    justifyContent: 'space-between',
  },
  carouselDots: {
    flexDirection: 'row',
    padding: 6,
    justifyContent: 'center',
  },
  carouselDot: {
    borderRadius: carouselDotSize / 2,
    width: carouselDotSize,
    height: carouselDotSize,
    borderColor: '#555',
    borderWidth: 1,
    marginHorizontal: 3,
  },
  carouselDotFilled: {
    backgroundColor: '#555',
  },
  arrow: {
    position: 'absolute',
    paddingVertical: 7,
    paddingHorizontal: 10,
    bottom: 0,
  },
  arrowLeft: { left: 3 },
  arrowRight: { right: 3 },
  arrowText: {
    color: '#555',
    fontSize: 22,
  },
})
