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
import { Animated, StyleSheet, View } from 'react-native'

const duration = 3500
const fadeDuration = 500

export default class FadeCarousel extends PureComponent {
  constructor(props) {
    super(props)
    const { children } = this.props
    this.currentIndex = 0
    this.opacities = []
    for (let i = 0; i < children.length; ++i) {
      this.opacities.push(new Animated.Value(0))
    }
  }

  componentDidMount() {
    Animated.loop(
      Animated.sequence(
        this.opacities.map(v =>
          Animated.sequence([
            Animated.timing(v, { toValue: 1, useNativeDriver: true, duration: fadeDuration }),
            Animated.delay(duration),
            Animated.timing(v, { toValue: 0, useNativeDriver: true, duration: fadeDuration }),
          ]),
        ),
      ),
    ).start()
  }

  render() {
    const { children } = this.props
    return (
      <View>
        {children.map((c, i) => (
          <Animated.View key={i} style={[s.fade, { opacity: this.opacities[i] }]}>
            {c}
          </Animated.View>
        ))}
      </View>
    )
  }
}

const s = StyleSheet.create({
  fade: { position: 'absolute', top: 0 },
})
