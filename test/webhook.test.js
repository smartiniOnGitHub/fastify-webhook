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

const test = require('tap').test
const request = require('request')
const Fastify = require('fastify')

test('default webhook does not return an error, but a good response (200) and some content', (t) => {
  t.plan(5)
  const fastify = Fastify()
  fastify.register(require('../')) // configure this plugin with its default options

  fastify.listen(0, (err) => {
    fastify.server.unref()
    t.error(err)
    const port = fastify.server.address().port

    request({
      method: 'POST',
      uri: `http://localhost:${port}/webhook`
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-type'], 'application/json')
      t.deepEqual(JSON.parse(body), { statusCode: 200, result: 'success' })

      fastify.close()
    })
  })
})

test('default webhook (but called via GET instead of POST) return a not found error (404) and some content', (t) => {
  t.plan(5)
  const fastify = Fastify()
  fastify.register(require('../')) // configure this plugin with its default options

  fastify.listen(0, (err) => {
    fastify.server.unref()
    t.error(err)
    const port = fastify.server.address().port

    request({
      method: 'GET',
      uri: `http://localhost:${port}/webhook`
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 404)
      t.strictEqual(response.headers['content-type'], 'application/json')
      t.deepEqual(JSON.parse(body), { statusCode: 404, error: 'Not Found', message: 'Not found' })

      fastify.close()
    })
  })
})

function consoleLoggerHandler (req, reply) {
  console.log(`Request MIME Type: "${req.headers['content-type']}"`)
  console.log(`Request ID: "${request.id}"`)
  console.log(`Request body: "${req.body}"`)
  // reply.type('application/json').send(req.body)
  reply.type('application/json').send({ statusCode: 200, result: 'success' })
}

test('custom options for webhook (and empty body) does not return an error, but a good response (200) and some content', (t) => {
  t.plan(5)
  const fastify = Fastify()
  fastify.register(require('../'), {
    'url': '/custom-webhook',
    'handler': consoleLoggerHandler
  }) // configure this plugin with some custom options

  fastify.listen(0, (err) => {
    fastify.server.unref()
    t.error(err)
    const port = fastify.server.address().port

    request({
      method: 'POST',
      uri: `http://localhost:${port}/custom-webhook`
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-type'], 'application/json')
      t.deepEqual(JSON.parse(body), { statusCode: 200, result: 'success' })

      fastify.close()
    })
  })
})

test('custom options for webhook (and optional input content type and body) does not return an error, but a good response (200) and some content', (t) => {
  t.plan(5)
  const fastify = Fastify()
  fastify.register(require('../'), {
    'url': '/custom-webhook',
    'handler': consoleLoggerHandler
  })

  fastify.listen(0, (err) => {
    fastify.server.unref()
    t.error(err)
    const port = fastify.server.address().port
    const sampleData = '{"payload":"test"}'

    request({
      method: 'POST',
      uri: `http://localhost:${port}/custom-webhook`,
      // TODO: add some json payload, and expect it as result ... ok but not with this handler
      /*
// TODO: remove because not supported by Fastify without a specific plugin like 'fastify-multipart' ...
      multipart: [
        {
          'content-type': 'application/json',
          body: JSON.stringify(sampleData)
        }
      ]
       */
      /*
 // TODO: same as the previous commented block, but in a shorter way ...
      json: true,
      body: JSON.stringify(sampleData)
       */
      // add some json payload (optional here), and of course all must work even without adding it, see previous test ...
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(sampleData)
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-type'], 'application/json')
      t.deepEqual(JSON.parse(body), { statusCode: 200, result: 'success' })
      // TODO: add checks on response type and content ... ok but not with this handler

      fastify.close()
    })
  })
})

// TODO: add tests (using plugin echoHandler) on content (in the response) here, when passing some argument in the call, like 'token' ... wip
