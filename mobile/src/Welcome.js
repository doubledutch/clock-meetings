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
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import Button from './Button'
import { bold, charcoalGray, lightGray, fontFamily } from './styles'
import networking from './images/networking.png.js'
import peopleOnPhones from './images/peopleOnPhones.png.js'

const CarouselMarkers = ({ index, primaryColor }) => (
  <View style={s.carouselMarkers}>
    {welcomes.map((_, i) => (
      <CarouselMarker isSelected={index === i} primaryColor={primaryColor} key={i} />
    ))}
  </View>
)

const CarouselMarker = ({ isSelected, primaryColor }) => {
  const style = isSelected
    ? { backgroundColor: primaryColor, borderColor: primaryColor }
    : { borderColor: primaryColor }
  return <View style={[s.carouselMarker, style]} />
}

const Welcome1 = ({ helpText, primaryColor, advance }) => (
  <View style={s.container}>
    <ScrollView style={s.scroll}>
      <Text style={s.h1}>Magic Hour</Text>
      <View style={s.row}>
        <Text style={s.h2}>Talk</Text>
        <Text style={[s.h2, s.lightGray]}> about what </Text>
        <Text style={s.h2}>matters</Text>
      </View>
      <Image source={networking} style={[s.image, s.image1]} />
      <Text style={s.h3}>{helpText}</Text>
    </ScrollView>
    <CarouselMarkers index={0} count={welcomes.length} primaryColor={primaryColor} />
    <Button color={primaryColor} style={s.button} onPress={advance}>
      <Text style={s.buttonText}>Next</Text>
    </Button>
  </View>
)
const Welcome2 = ({ helpText, primaryColor, advance }) => (
  <View style={s.container}>
    <ScrollView style={s.scroll}>
      <Text style={[s.h2, s.center]}>How it works.</Text>
      <Image source={peopleOnPhones} style={[s.image, s.image2]} />
      <Text style={s.h3}>{helpText}</Text>
    </ScrollView>
    <CarouselMarkers index={1} count={welcomes.length} primaryColor={primaryColor} />
    <Button color={primaryColor} style={s.button} onPress={advance}>
      <Text style={s.buttonText}>Let&apos;s do this!</Text>
    </Button>
  </View>
)

const welcomes = [Welcome1, Welcome2]
export default class Welcome extends PureComponent {
  state = { stage: 0 }

  render() {
    const { stage } = this.state
    const { dismiss, primaryColor, secondsPerMeeting, slotCount } = this.props
    const WelcomeComponent = welcomes[stage]
    const advance =
      stage + 1 < welcomes.length ? () => this.setState({ stage: stage + 1 }) : dismiss

    const time =
      secondsPerMeeting >= 120
        ? `${Math.round(secondsPerMeeting / 60)} minutes`
        : `${secondsPerMeeting} seconds`
    const helpTexts = [
      `Magic Hour is a live, face-to-face networking experience designed to make sure everyone walks away with ${slotCount} new friends`,
      `Browse through guests’ topics and select people you’d like to talk with. You’ll have ${time} with each person and can edit your time slots until 10 minutes beforehand.`,
    ]

    return (
      <WelcomeComponent helpText={helpTexts[stage]} primaryColor={primaryColor} advance={advance} />
    )
  }
}

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 5 },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  h1: {
    fontFamily,
    fontWeight: bold,
    fontSize: 72,
    color: charcoalGray,
  },
  h2: {
    fontFamily,
    fontWeight: bold,
    fontSize: 36,
    color: charcoalGray,
  },
  h3: {
    fontFamily,
    fontWeight: bold,
    fontSize: 24,
    color: charcoalGray,
    textAlign: 'center',
  },
  center: { textAlign: 'center' },
  button: {
    marginHorizontal: 16,
    marginVertical: 11,
  },
  buttonText: {
    color: 'white',
    fontWeight: bold,
    fontSize: 20,
  },
  lightGray: { color: lightGray },
  image: {
    resizeMode: 'contain',
    marginVertical: 40,
  },
  image1: { height: 220 },
  image2: { height: 250 },
  carouselMarkers: { flexDirection: 'row', justifyContent: 'center', padding: 8 },
  carouselMarker: { height: 8, width: 8, borderWidth: 2, borderRadius: 4, marginHorizontal: 3 },
})

// export class Welcome extends PureComponent {
//   state = { canAccept: false }

//   render() {
//     const { dismiss, helpTexts, primaryColor } = this.props
//     const { canAccept } = this.state
//     return (
//       <View style={s.buttonBottomContainer}>
//         <View>
//           <Text style={s.welcome}>Welcome to Magic Hour!</Text>
//           <Carousel texts={helpTexts} onStepChange={this.onStepChange} style={s.carousel} />
//         </View>
//         <Button
//           text="BEGIN"
//           onPress={dismiss}
//           disabled={!canAccept}
//           style={s.bottomButton}
//           color={primaryColor}
//         />
//       </View>
//     )
//   }

//   onStepChange = ({ step, stepCount }) => this.setState({ canAccept: step === stepCount - 1 })
// }

// const ss = StyleSheet.create({
//   carousel: {
//     height: 200,
//   },
//   welcome: {
//     fontSize: 24,
//     marginVertical: 15,
//     marginLeft: 7,
//   },
//   bottomButton: {
//     marginHorizontal: 7,
//     marginVertical: 20,
//   },
//   buttonBottomContainer: {
//     flex: 1,
//     justifyContent: 'space-between',
//   },
// })
