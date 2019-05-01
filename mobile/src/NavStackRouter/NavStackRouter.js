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
import { MemoryRouter, StaticRouter } from 'react-router'
import client from '@doubledutch/rn-client'

const NavStackRouter = ({ children, extension, path }) => {
  const context = { extension }
  const location = path && path.startsWith('/') ? path : `/${path || ''}`
  return (
    <StaticRouter context={context} location={location}>
      {children}
    </StaticRouter>
  )
}

const EmulatedNavStackRouter = ({ children, extension }) => {
  const context = { extension }
  return (
    <MemoryRouter context={context} initialEntries={['/']} initialIndex={0}>
      {children}
    </MemoryRouter>
  )
}

export default (client._b.isEmulated ? EmulatedNavStackRouter : NavStackRouter)
