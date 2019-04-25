/*
 * Copyright 2019 DoubleDutch, Inc.
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

import React from 'react'
import { TouchableOpacity } from 'react-native'
import { __RouterContext as RouterContext } from 'react-router'
import client from '@doubledutch/rn-client'

const onPress = (context, to) => () => {
  const { staticContext } = context
  if (staticContext) {
    // Real router is a StaticRouter.
    const { extension } = staticContext || {}
    client.openURL(
      `dd://extensions/${extension}?path=${encodeURIComponent(to)}`
    )
  } else {
    // Emulated router is a MemoryRouter.
    context.history.push(to)
  }
}

const Link = ({ children, style, to }) => (
  <RouterContext.Consumer>
    {context => {
      return (
        <TouchableOpacity style={style} onPress={onPress(context, to)}>
          {children}
        </TouchableOpacity>
      )
    }}
  </RouterContext.Consumer>
)

export default Link

export function linkTo(to)