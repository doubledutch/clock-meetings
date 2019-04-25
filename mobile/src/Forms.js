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
import { TextInput } from 'react-native'

// Creates a Component with prop `onSave({...newValues})` and props for each initial value
export function formWithSave(fieldNames, WrappedFormComponent) {
  return class extends PureComponent {
    state = {}

    fieldSet = {
      getValue: fieldName => {
        // Return draft value from state, else initial value from props, but never undefined.
        if (this.state[fieldName] == null) {
          if (this.props[fieldName] == null) {
            return null
          }
          return this.props[fieldName]
        }
        return this.state[fieldName]
      },
      setValue: (fieldName, value) => this.setState({ [fieldName]: value }),
      isDirty: () => Object.entries(this.state).some(([key, val]) => this.props[key] !== val),
    }

    render() {
      return <WrappedFormComponent fieldSet={this.fieldSet} save={this.save} {...this.props} />
    }

    onChanged = e => this.setState({ draft: e.target.value })

    save = () => {
      const values = fieldNames.reduce((obj, fieldName) => {
        obj[fieldName] = this.fieldSet.getValue(fieldName)
        return obj
      }, {})
      this.props.onSave(values)
    }
  }
}

export function fieldWithDraft(WrappedFieldComponent) {
  return ({ fieldSet, prop, ...rest }) => (
    <WrappedFieldComponent
      value={fieldSet.getValue(prop)}
      onChange={e => fieldSet.setValue(prop, e.target.value)}
      {...rest}
    />
  )
}

export const TextInputWithDraft = ({ fieldSet, prop, ...rest }) => (
  <TextInput
    value={fieldSet.getValue(prop)}
    onChangeText={text => fieldSet.setValue(prop, text)}
    {...rest}
  />
)
