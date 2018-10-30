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
import '@doubledutch/react-components/lib/base.css'

import './App.css'

class App extends PureComponent {
  state = { slotCount: 12 }

  componentDidMount() {
    const { fbc } = this.props
    fbc.signinAdmin().then(() => {
      fbc.database.public
        .adminRef('slotCount')
        .on('value', data => this.setState({ slotCount: data.val() || 12 }))
    })
  }

  render() {
    const { slotCount } = this.state
    return (
      <div className="App">
        <label>
          Number of slots:{' '}
          <input
            type="number"
            min={3}
            max={12}
            value={slotCount}
            onChange={this.updatePublicNumber('slotCount')}
          />
        </label>
      </div>
    )
  }

  updatePublicNumber = prop => e => {
    this.props.fbc.database.public.adminRef(prop).set(+e.target.value)
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
