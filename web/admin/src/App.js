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

import client from '@doubledutch/admin-client'
import { provideFirebaseConnectorToReactComponent } from '@doubledutch/firebase-connector'

import './App.css'

class App extends PureComponent {
  constructor(props) {
    super(props)

    this.state = { sharedTasks: [] }
  }

  componentDidMount() {
    const { fbc } = this.props
    fbc.signinAdmin().then(() => {
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
    return (
      <div className="App">
        <p className="App-intro">
          This is a sample admin page. Developers should replace this page, or remove the{' '}
          <code>web/admin</code> folder entirely
        </p>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <h3>Public tasks:</h3>
        <ul>
          {this.state.sharedTasks.map(task => {
            const { image, firstName, lastName } = task.creator
            return (
              <li key={task.key}>
                <img className="avatar" src={image} alt="" />
                <span>
                  {' '}
                  {firstName} {lastName} - {task.text} -{' '}
                </span>
                <button onClick={() => this.markComplete(task)}>Mark complete</button>
              </li>
            )
          })}
        </ul>
      </div>
    )
  }

  markComplete(task) {
    this.props.fbc.database.public
      .allRef('tasks')
      .child(task.key)
      .remove()
  }
}

export default provideFirebaseConnectorToReactComponent(
  client,
  'clockmeetings',
  (props, fbc) => <App {...props} fbc={fbc} />,
  PureComponent,
)
