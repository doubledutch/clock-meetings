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
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

// rn-client must be imported before FirebaseConnector
import client, { Avatar, TitleBar } from '@doubledutch/rn-client'
import { provideFirebaseConnectorToReactComponent } from '@doubledutch/firebase-connector'

class HomeView extends PureComponent {
  constructor(props) {
    super(props)

    this.state = { task: '', userPrivateTasks: [], sharedTasks: [] }
    client.getCurrentUser().then(currentUser => this.setState({ currentUser }))

    this.signin = props.fbc.signin()

    this.signin.catch(err => console.error(err))
  }

  componentDidMount() {
    const { fbc } = this.props
    this.signin.then(() => {
      const userPrivateRef = fbc.database.private.userRef('tasks')
      userPrivateRef.on('child_added', data => {
        this.setState({
          userPrivateTasks: [...this.state.userPrivateTasks, { ...data.val(), key: data.key }],
        })
      })
      userPrivateRef.on('child_removed', data => {
        this.setState({
          userPrivateTasks: this.state.userPrivateTasks.filter(x => x.key !== data.key),
        })
      })

      const sharedRef = fbc.database.public.allRef('tasks')
      sharedRef.on('child_added', data => {
        this.setState({
          sharedTasks: [...this.state.sharedTasks, { ...data.val(), key: data.key }],
        })
      })
      sharedRef.on('child_removed', data => {
        this.setState({ sharedTasks: this.state.sharedTasks.filter(x => x.key !== data.key) })
      })
    })
  }

  render() {
    if (!this.state.currentUser) return null
    const { userPrivateTasks, sharedTasks } = this.state
    const tasks = userPrivateTasks
      .map(t => ({ ...t, type: 'private' }))
      .concat(sharedTasks.map(t => ({ ...t, type: 'shared' })))

    return (
      <KeyboardAvoidingView
        style={s.container}
        behavior={Platform.select({ ios: 'padding', android: null })}
      >
        <TitleBar title="To do ✅" client={client} signin={this.signin} />
        <ScrollView style={s.scroll}>
          {tasks.map(task => (
            <View key={task.key} style={s.task}>
              <TouchableOpacity onPress={() => this.markComplete(task)}>
                <Text style={s.checkmark}>✅ </Text>
              </TouchableOpacity>
              {renderCreator(task)}
              <Text style={s.taskText}>{task.text}</Text>
            </View>
          ))}
        </ScrollView>
        <View style={s.compose}>
          <TextInput
            style={s.composeText}
            placeholder="Add task..."
            value={this.state.task}
            onChangeText={task => this.setState({ task })}
          />
          <View style={s.sendButtons}>
            <TouchableOpacity style={s.sendButton} onPress={this.createPrivateTask}>
              <Text style={s.sendButtonText}>+ private 🕵️️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.sendButton} onPress={this.createSharedTask}>
              <Text style={s.sendButtonText}>+ shared 📢</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    )
  }

  createPrivateTask = () => this.createTask(this.props.fbc.database.private.userRef)
  createSharedTask = () => this.createTask(this.props.fbc.database.public.allRef)

  createTask(ref) {
    const { currentUser } = this.state
    if (this.state.task) {
      ref('tasks')
        .push({
          text: this.state.task,
          creator: currentUser,
        })
        .then(() => this.setState({ task: '' }))
        .catch(x => console.error(x))
    }
  }

  markComplete(task) {
    const { fbc } = this.props
    getRef(task).remove()

    function getRef(t) {
      switch (t.type) {
        case 'private':
          return fbc.database.private.userRef('tasks').child(t.key)
        case 'shared':
          return fbc.database.public.allRef('tasks').child(t.key)
        default:
          return null
      }
    }
  }
}

function renderCreator(task) {
  if (task.type === 'private') return <Text style={s.creatorEmoji}>🕵️️</Text>
  return <Avatar user={task.creator} size={22} style={s.creatorAvatar} />
}

const fontSize = 18
const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d9e1f9',
  },
  scroll: {
    flex: 1,
    padding: 15,
  },
  task: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 10,
  },
  checkmark: {
    textAlign: 'center',
    fontSize,
  },
  creatorAvatar: {
    marginRight: 4,
  },
  creatorEmoji: {
    marginRight: 4,
    fontSize,
  },
  taskText: {
    fontSize,
    flex: 1,
  },
  compose: {
    height: 70,
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 10,
  },
  sendButtons: {
    justifyContent: 'center',
  },
  sendButton: {
    justifyContent: 'center',
    margin: 5,
  },
  sendButtonText: {
    fontSize: 20,
    color: 'gray',
  },
  composeText: {
    flex: 1,
  },
})

export default provideFirebaseConnectorToReactComponent(
  client,
  'clockmeetings',
  (props, fbc) => <HomeView {...props} fbc={fbc} />,
  PureComponent,
)
