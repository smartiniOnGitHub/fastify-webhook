/*
 * Copyright 2018-2023 the original author or authors.
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
'use strict'

const fp = require('fastify-plugin')

const webhookHandlers = require('./handlers') // get plugin handlers for default handler

function fastifyWebHook (fastify, options, next) {
  const {
    url = '/webhook',
    handler = webhookHandlers.acknowledge,
    disableWebhook = false,
    enableGetPlaceholder = false,
    secretKey = null,
    preHandlers = [checkSecretKey]
  } = options

  function checkSecretKey (request, reply, done) {
    if (secretKey) {
      const contentType = request.headers['content-type'] || ''
      const requestSecretKey = (request.body) ? request.body.secretKey : ''
      if (request.method !== 'POST' ||
        !contentType.startsWith('application/json') ||
        requestSecretKey !== secretKey) {
        reply.code(403).send(new Error('Missing or wrong secret key'))
      }
    }
    done()
  }

  // check plugin options
  if (typeof url !== 'string') {
    throw new TypeError(`The option url must be a string, instead got a '${typeof url}'`)
  }
  if (typeof handler !== 'function') {
    throw new TypeError(`The option webhook must be a function, instead got a '${typeof handler}'`)
  }
  if (typeof disableWebhook !== 'boolean') {
    throw new TypeError(`The option disableWebhook must be a boolean, instead got a '${typeof disableWebhook}'`)
  }
  if (typeof enableGetPlaceholder !== 'boolean') {
    throw new TypeError(`The option enableGetPlaceholder must be a boolean, instead got a '${typeof enableGetPlaceholder}'`)
  }
  if (secretKey !== null && typeof secretKey !== 'string') {
    throw new TypeError(`The option secretKey must be a string, instead got a '${typeof secretKey}'`)
  }
  if (preHandlers !== null && !Array.isArray(preHandlers)) {
    throw new TypeError(`The option preHandlers must be an array (of functions), instead got a '${typeof preHandlers}'`)
  }

  // execute plugin code
  if (disableWebhook === false) {
    fastify.route({
      method: 'POST',
      url,
      preHandler: preHandlers,
      handler
    })
    if (enableGetPlaceholder === true) {
      fastify.get(url, {}, (request, reply) => {
        reply.code(405).send(new Error('Placeholder for a webhook, you need to call via POST'))
      })
    }
  }

  next()
}

module.exports = fp(fastifyWebHook, {
  fastify: '4.x',
  name: 'fastify-webhook'
})
