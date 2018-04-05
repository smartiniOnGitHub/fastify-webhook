/*
 * Copyright 2018 the original author or authors.
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

function fastifyWebHook (fastify, options, next) {
  const opts = options || {}
  const handlers = {
    acknowledge: acknowledgeWebhookHandler,
    echo: echoWebhookHandler,
    logger: loggerWebhookHandler
  }
  const webhookUrl = opts.url || '/webhook'
  const webhookHandler = opts.handler || handlers.acknowledge
  const disableDefaultWebhook = opts.disableDefaultWebhook || false
  const webhookSecretKey = opts.secretKey || null

  if (typeof webhookUrl !== 'string') {
    throw new TypeError(`The given url must be a string, instead got a '${typeof webhookUrl}'`)
  }
  if (typeof webhookHandler !== 'function') {
    throw new TypeError(`The given webhook must be a function, instead got a '${typeof webhookHandler}'`)
  }
  if (webhookSecretKey !== null && typeof webhookSecretKey !== 'string') {
    throw new TypeError(`The given secretKey must be a string, instead got a '${typeof webhookSecretKey}'`)
  }

  function _defaultSuccessWebhookReply (reply) {
    // return a simple default message for successful processing
    reply.type('application/json').send({ statusCode: 200, result: 'success' })
  }

  function _failureWebhookReply (reply, message) {
    // return a simple error when processing the request
    reply.type('application/json').send(new Error(message))
  }

  function _isMimeTypeJSON (req) {
    // tell the MIME Type of the inpout data, if it's json
    const reqMimeType = req.getHeader('content-type')
    if (!reqMimeType || reqMimeType !== 'application/json') {
      return false
    }
    return true
  }

  function echoWebhookHandler (req, reply) {
    // return a json dump of given input data
    if (!_isMimeTypeJSON(req)) {
      _failureWebhookReply(reply, `Missing or wrong input MIME Type: "${req.getHeader('content-type')}"`)
      return
    }
    // console.log('test log from echoWebhookHandler: request body = ' + req.body) // TODO: temp ...
    req.log(`Request: MIME Type: "${req.getHeader('content-type')}", ID: "${req.id}", body: "${req.body}"`) // TODO: temp ...
    reply.type('application/json').send(req.body)
  }

  function loggerWebhookHandler (req, reply) {
    req.log(`Request: MIME Type: "${req.getHeader('content-type')}", ID: "${req.id}", body: "${req.body}"`)
    _defaultSuccessWebhookReply(reply)
  }

  function acknowledgeWebhookHandler (req, reply) {
    // return a simple acknowledge message
    _defaultSuccessWebhookReply(reply)
  }

  // execute plugin code
  if (!disableDefaultWebhook) {
    fastify.post(webhookUrl, webhookHandler)
  }

  next()
}

module.exports = fp(fastifyWebHook, {
  fastify: '>=0.43.0',
  name: 'fastify-webhook'
})
