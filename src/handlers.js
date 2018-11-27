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

// this module exports some handlers that could be used
// as default and non-default plugin conmfiguration

function _getRequestMimeType (req) {
  return req.headers['content-type']
  // return req.getHeader('content-type')
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
  // tell the MIME Type of the inpout data: true if it's json, false otherwise
  const reqMimeType = _getRequestMimeType(req)
  if (!reqMimeType || reqMimeType !== 'application/json') {
    return false
  }
  return true
}

function acknowledgeWebhookHandler (req, reply) {
  // return a simple acknowledge message
  _defaultSuccessWebhookReply(reply)
}

function loggerWebhookHandler (req, reply) {
  // log the given data with Fastify logger, and return a default acknowledge message
  req.log.info(`Request: MIME Type: "${_getRequestMimeType(req)}", ID: "${req.id}", body: "${req.body}"`)
  _defaultSuccessWebhookReply(reply)
}

function echoWebhookHandler (req, reply) {
  // return a json dump of given input data
  // note that the given data is also logged with Fastify logger
  // but in this case it's important to provide the content type as json, and content data (empty json is not valid) or and error will be raised
  if (!_isMimeTypeJSON(req)) {
    _failureWebhookReply(reply, `Missing or wrong input MIME Type: "${_getRequestMimeType(req)}"`)
    return
  }
  req.log.info(`Request: MIME Type: "${_getRequestMimeType(req)}", ID: "${req.id}", body: "${req.body}"`)
  reply.type('application/json').send(req.body)
}

module.exports = {
  acknowledge: acknowledgeWebhookHandler,
  echo: echoWebhookHandler,
  logger: loggerWebhookHandler
}
