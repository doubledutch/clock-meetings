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
import { Button, Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native'

// rn-client must be imported before FirebaseConnector
import client, { Avatar, TitleBar } from '@doubledutch/rn-client'
import { provideFirebaseConnectorToReactComponent } from '@doubledutch/firebase-connector'

const avatarSize = 50
const clockPadding = 10

class HomeView extends PureComponent {
  state = { selectedIndex: null, meetings: {} }
  constructor(props) {
    super(props)

    this.signin = props.fbc.signin()

    this.signin.catch(err => console.error(err))
  }

  componentDidMount() {
    const { fbc } = this.props
    this.signin.then(() => {
      client.getCurrentUser().then(currentUser => {
        this.setState({ currentUser })
        const meetingsRef = fbc.database.public.allRef('meetings')
        fbc.database.public
          .adminRef('slotCount')
          .on('value', data => this.setState({ slotCount: data.val() || 12 }))
        meetingsRef.on('child_added', data => {
          const meeting = data.val()
          if (meeting.a === currentUser.id || meeting.b === currentUser.id) {
            const otherId = meeting.a === currentUser.id ? meeting.b : meeting.a
            this.setState(({ meetings }) => ({
              meetings: { ...meetings, [meeting.slotIndex]: otherId },
            }))
          }
        })

        meetingsRef.on('child_removed', data => {
          const meeting = data.val()
          if (meeting.a === currentUser.id || meeting.b === currentUser.id) {
            this.setState(({ meetings }) => ({
              meetings: { ...meetings, [meeting.slotIndex]: null },
            }))
          }
        })
      })
    })
  }

  render() {
    const { meetings, selectedIndex, slotCount } = this.state
    if (!this.state.currentUser || !slotCount) return null
    const width = Dimensions.get('window').width - clockPadding * 2 - avatarSize

    const renderSlot = index => {
      const angle = (index / slotCount) * Math.PI * 2
      const position = {
        top: (width * (1 - Math.cos(angle))) / 2,
        left: (width * (1 + Math.sin(angle))) / 2,
      }

      const number = index || slotCount
      const meetingUserId = meetings[index]
      const user = meetingUserId
        ? { id: meetingUserId }
        : {
            firstName: number > 9 ? `${Math.floor(number / 10)}` : '',
            lastName: `${number % 10}`,
          }
      return (
        <View style={selectedIndex === index ? s.selected : null} key={index}>
          <TouchableOpacity
            style={[s.slot, position]}
            onPress={() => this.onPressSlot(index)}
            disabled={!!meetingUserId}
          >
            <Avatar size={avatarSize} user={user} client={client} />
          </TouchableOpacity>
        </View>
      )
    }

    return (
      <View style={s.container}>
        <TitleBar title="Quick Chats" client={client} signin={this.signin} />
        <View style={s.main}>
          <View style={[s.clock, { height: width }]}>
            {[...Array(slotCount).keys()].map(renderSlot)}
          </View>
          {selectedIndex != null && <Button title="Cancel" onPress={this.cancelSlotPress} />}
        </View>
      </View>
    )
  }

  onPressSlot = index => {
    const { meetings } = this.state
    if (!meetings[index]) {
      this.setState({ selectedIndex: index })
    }
  }
  cancelSlotPress = () => this.setState({ selectedIndex: null })
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d9e1f9',
  },
  main: {
    flex: 1,
    backgroundColor: 'orange',
  },
  clock: {
    margin: clockPadding,
    flex: 1,
  },
  slot: {
    position: 'absolute',
  },
  selected: {
    opacity: 0.5,
  },
})

export default provideFirebaseConnectorToReactComponent(
  client,
  'clockmeetings',
  (props, fbc) => <HomeView {...props} fbc={fbc} />,
  PureComponent,
)
