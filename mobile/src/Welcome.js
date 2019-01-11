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
import { StyleSheet, Text, View } from 'react-native'
import Button from './Button'
import Carousel from './Carousel'

export default class Welcome extends PureComponent {
  state = { canAccept: false }

  render() {
    const { dismiss, helpTexts, primaryColor } = this.props
    const { canAccept } = this.state
    return (
      <View style={s.buttonBottomContainer}>
        <View>
          <Text style={s.welcome}>Welcome to Magic Hour!</Text>
          <Carousel texts={helpTexts} onStepChange={this.onStepChange} style={s.carousel} />
        </View>
        <Button
          text="BEGIN"
          onPress={dismiss}
          disabled={!canAccept}
          style={s.bottomButton}
          color={primaryColor}
        />
      </View>
    )
  }

  onStepChange = ({ step, stepCount }) => this.setState({ canAccept: step === stepCount - 1 })
}

const s = StyleSheet.create({
  carousel: {
    height: 200,
  },
  welcome: {
    fontSize: 24,
    marginVertical: 15,
    marginLeft: 7,
  },
  bottomButton: {
    marginHorizontal: 7,
    marginVertical: 20,
  },
  buttonBottomContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
})
