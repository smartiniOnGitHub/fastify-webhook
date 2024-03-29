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

const assert = require('assert').strict
const test = require('tap').test
const sget = require('simple-get').concat
const Fastify = require('fastify')

const secrets = {
  // secretKeyEnv: process.env.SECRET_KEY || '',
  secretKeyGood: process.env.SECRET_KEY || 'my Secret Key',
  secretKeyBad: process.env.SECRET_KEY_ALT || 'a Wrong Key'
}
assert(secrets !== null)

const defaultReplyType = 'application/json; charset=utf-8'

test('default webhook (and empty body) does not return an error, but a good response (200) and some content', (t) => {
  // t.plan(5)
  const fastify = Fastify()
  t.teardown(() => { fastify.close() })
  fastify.register(require('../')) // configure this plugin with its default options

  fastify.listen({ port: 0 }, (err, address) => {
    t.error(err)

    sget({
      method: 'POST',
      timeout: 2000,
      url: `${address}/webhook`
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-type'], defaultReplyType)
      t.same(JSON.parse(body), { statusCode: 200, result: 'success' })
      t.end()
    })
  })
})

test('default webhook (and empty body) but called via GET instead of POST, return a not found error (404) and its description', (t) => {
  const fastify = Fastify()
  t.teardown(() => { fastify.close() })
  fastify.register(require('../')) // configure this plugin with its default options

  fastify.listen({ port: 0 }, (err, address) => {
    t.error(err)

    sget({
      method: 'GET',
      url: `${address}/webhook`
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 404)
      t.equal(response.headers['content-type'], defaultReplyType)
      t.same(JSON.parse(body), { statusCode: 404, error: 'Not Found', message: 'Route GET:/webhook not found' })
      t.end()
    })
  })
})

test('default webhook (and optional input content type and body) does not return an error, but a good response (200) and some content', (t) => {
  const fastify = Fastify()
  t.teardown(() => { fastify.close() })
  fastify.register(require('../')) // configure this plugin with its default options

  fastify.listen({ port: 0 }, (err, address) => {
    t.error(err)
    const sampleData = '{"payload":"test"}'

    sget({
      method: 'POST',
      timeout: 2000,
      url: `${address}/webhook`,
      // add some json payload (optional here), and of course all must work even without adding it, see previous test ...
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(sampleData)
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-type'], defaultReplyType)
      t.same(JSON.parse(body), { statusCode: 200, result: 'success' })
      t.end()
    })
  })
})

function consoleLoggerHandler (request, reply) {
  console.log(`Request: MIME Type: "${request.headers['content-type']}", ID: "${request.id}", body: "${request.body}"`)
  reply.send({ statusCode: 200, result: 'success' })
}

test('custom options for webhook and local handler (and empty body) does not return an error, but a good response (200) and some content', (t) => {
  const fastify = Fastify()
  t.teardown(() => { fastify.close() })
  fastify.register(require('../'), {
    url: '/custom-webhook',
    handler: consoleLoggerHandler
  }) // configure this plugin with some custom options

  fastify.listen({ port: 0 }, (err, address) => {
    t.error(err)

    sget({
      method: 'POST',
      timeout: 2000,
      url: `${address}/custom-webhook`
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-type'], defaultReplyType)
      t.same(JSON.parse(body), { statusCode: 200, result: 'success' })
    })
    // ensure by default webhook is not published via GET
    sget({
      method: 'GET',
      url: `${address}/custom-webhook`
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 404)
      t.equal(response.headers['content-type'], defaultReplyType)
      t.same(JSON.parse(body), { statusCode: 404, error: 'Not Found', message: 'Route GET:/custom-webhook not found' })
      t.end()
    })
  })
})

test('custom options for disabled webhook and get placeholder and local handler (and empty body) return a not found error', (t) => {
  const fastify = Fastify()
  t.teardown(() => { fastify.close() })
  fastify.register(require('../'), {
    url: '/custom-webhook',
    handler: consoleLoggerHandler,
    disableWebhook: true,
    enableGetPlaceholder: true
  }) // configure this plugin with some custom options

  fastify.listen({ port: 0 }, (err, address) => {
    t.error(err)

    sget({
      method: 'POST',
      timeout: 2000,
      url: `${address}/custom-webhook`
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 404)
      t.equal(response.headers['content-type'], defaultReplyType)
      t.same(JSON.parse(body), { statusCode: 404, error: 'Not Found', message: 'Route POST:/custom-webhook not found' })
    })
    // ensure webhook is not published via GET, because it's disabled here (takes priority)
    sget({
      method: 'GET',
      url: `${address}/custom-webhook`
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 404)
      t.equal(response.headers['content-type'], defaultReplyType)
      t.same(JSON.parse(body), { statusCode: 404, error: 'Not Found', message: 'Route GET:/custom-webhook not found' })
      t.end()
    })
  })
})

test('custom options for enabled webhook and get placeholder and local handler (and empty body) return a good response, but a not allowed error on the get', (t) => {
  const fastify = Fastify()
  t.teardown(() => { fastify.close() })
  fastify.register(require('../'), {
    url: '/custom-webhook',
    handler: consoleLoggerHandler,
    disableWebhook: false, // same as default
    enableGetPlaceholder: true
  }) // configure this plugin with some custom options

  fastify.listen({ port: 0 }, (err, address) => {
    t.error(err)

    sget({
      method: 'POST',
      timeout: 2000,
      url: `${address}/custom-webhook`
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-type'], defaultReplyType)
      t.same(JSON.parse(body), { statusCode: 200, result: 'success' })
    })
    // ensure webhook is not published via GET, because it's disabled here (takes priority)
    sget({
      method: 'GET',
      url: `${address}/custom-webhook`
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 405)
      t.equal(response.headers['content-type'], defaultReplyType)
      t.same(JSON.parse(body), { statusCode: 405, error: 'Method Not Allowed', message: 'Placeholder for a webhook, you need to call via POST' })
      t.end()
    })
  })
})

test('custom options for webhook and local handler (and optional input content type and body) does not return an error, but a good response (200) and some content', (t) => {
  const fastify = Fastify()
  t.teardown(() => { fastify.close() })
  fastify.register(require('../'), {
    url: '/custom-webhook',
    handler: consoleLoggerHandler
  })

  fastify.listen({ port: 0 }, (err, address) => {
    t.error(err)
    const sampleData = '{"payload":"test"}'

    sget({
      method: 'POST',
      timeout: 2000,
      url: `${address}/custom-webhook`,
      // add some json payload (optional here), and of course all must work even without adding it, see previous test ...
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(sampleData)
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-type'], defaultReplyType)
      t.same(JSON.parse(body), { statusCode: 200, result: 'success' })
      t.end()
    })
  })
})

test('custom options for webhook (using plugin logger handler and empty body) does not return an error, but a good response (200) and some content', (t) => {
  // note that this tests is successful even when given an empty body because input content won't be parsed but only logged
  const fastify = Fastify()
  const webhookHandlers = require('../src/handlers') // get plugin handlers
  const webhookPlugin = require('../') // get a reference to the plugin
  t.teardown(() => { fastify.close() })
  fastify.register(webhookPlugin, {
    url: '/custom-webhook',
    handler: webhookHandlers.logger
  })

  fastify.listen({ port: 0 }, (err, address) => {
    t.error(err)

    sget({
      method: 'POST',
      timeout: 2000,
      url: `${address}/custom-webhook`
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-type'], defaultReplyType)
      t.same(JSON.parse(body), { statusCode: 200, result: 'success' })
      t.end()
    })
  })
})

test('custom options for webhook (using plugin logger handler and optional input content type and body) does not return an error, but a good response (200) and some content', (t) => {
  const fastify = Fastify()
  const webhookHandlers = require('../src/handlers') // get plugin handlers
  const webhookPlugin = require('../') // get a reference to the plugin
  t.teardown(() => { fastify.close() })
  fastify.register(webhookPlugin, {
    url: '/custom-webhook',
    handler: webhookHandlers.logger
  })

  fastify.listen({ port: 0 }, (err, address) => {
    t.error(err)
    const sampleData = '{"payload":"test"}'

    sget({
      method: 'POST',
      timeout: 2000,
      url: `${address}/custom-webhook`,
      // add some json payload (optional here), and of course all must work even without adding it, see previous test ...
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(sampleData)
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-type'], defaultReplyType)
      t.same(JSON.parse(body), { statusCode: 200, result: 'success' })
      t.end()
    })
  })
})

test('custom options for webhook (using plugin echo handler with no mime type and empty body) to ensure it will reply with an error (500) and its description', (t) => {
  // note that this tests is failing because echo handler wants json as input content type, and a valid (non empty) json content
  const fastify = Fastify()
  const webhookHandlers = require('../src/handlers') // get plugin handlers
  const webhookPlugin = require('../')
  t.teardown(() => { fastify.close() })
  fastify.register(webhookPlugin, {
    url: '/custom-webhook',
    handler: webhookHandlers.echo
  })

  fastify.listen({ port: 0 }, (err, address) => {
    t.error(err)

    sget({
      method: 'POST',
      timeout: 2000,
      url: `${address}/custom-webhook`
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 500)
      t.equal(response.headers['content-type'], defaultReplyType)
      t.same(JSON.parse(body), { statusCode: 500, error: 'Internal Server Error', message: 'Missing or wrong input MIME Type: "undefined"' })
      t.end()
    })
  })
})

test('custom options for webhook (using plugin echo handler with given but empty mime type and some body content) to ensure it will reply with an error (415) and its description', (t) => {
  // note that this tests is failing because echo handler wants json as input content type, and a valid (non empty) json content
  const fastify = Fastify()
  const webhookHandlers = require('../src/handlers') // get plugin handlers
  const webhookPlugin = require('../')
  t.teardown(() => { fastify.close() })
  fastify.register(webhookPlugin, {
    url: '/custom-webhook',
    handler: webhookHandlers.echo
  })

  fastify.listen({ port: 0 }, (err, address) => {
    t.error(err)
    const sampleData = '{"payload":"test"}'

    sget({
      method: 'POST',
      timeout: 2000,
      url: `${address}/custom-webhook`,
      headers: {
        'content-type': '' // force an empty mime type
      },
      body: JSON.stringify(sampleData)
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 415)
      t.equal(response.headers['content-type'], defaultReplyType)
      t.same(JSON.parse(body), { statusCode: 415, code: 'FST_ERR_CTP_INVALID_MEDIA_TYPE', error: 'Unsupported Media Type', message: 'Unsupported Media Type: undefined' })
      t.end()
    })
  })
})

test('custom options for webhook (using plugin echo handler with a wrong mime type, not supported directly by Fastify) to ensure it will reply with an error (415) and its description', (t) => {
  // note that this tests is failing because echo handler wants json as input content type, and a valid (non empty) json content
  const fastify = Fastify()
  const webhookHandlers = require('../src/handlers') // get plugin handlers
  const webhookPlugin = require('../')
  t.teardown(() => { fastify.close() })
  fastify.register(webhookPlugin, {
    url: '/custom-webhook',
    handler: webhookHandlers.echo
  })

  fastify.listen({ port: 0 }, (err, address) => {
    t.error(err)
    const sampleData = '{"payload":"test"}'

    sget({
      method: 'POST',
      timeout: 2000,
      url: `${address}/custom-webhook`,
      headers: {
        'content-type': 'application/unknown' // force a mime type not handled directly by Fastify
      },
      body: JSON.stringify(sampleData)
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 415)
      t.equal(response.headers['content-type'], defaultReplyType)
      t.same(JSON.parse(body), { statusCode: 415, code: 'FST_ERR_CTP_INVALID_MEDIA_TYPE', error: 'Unsupported Media Type', message: 'Unsupported Media Type: application/unknown' })
      t.end()
    })
  })
})

test('custom options for webhook (using plugin echo handler and input content type but no body) to ensure it will reply with an error (400) and its description', (t) => {
  // note that this tests is failing because echo handler wants json as input content type, and a valid (non empty) json content
  const fastify = Fastify()
  const webhookHandlers = require('../src/handlers') // get plugin handlers
  const webhookPlugin = require('../')
  t.teardown(() => { fastify.close() })
  fastify.register(webhookPlugin, {
    url: '/custom-webhook',
    handler: webhookHandlers.echo
  })

  fastify.listen({ port: 0 }, (err, address) => {
    t.error(err)

    sget({
      method: 'POST',
      timeout: 2000,
      url: `${address}/custom-webhook`,
      headers: {
        'content-type': 'application/json' // force the right mime type to send data here
      }
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 400)
      t.equal(response.headers['content-type'], defaultReplyType)
      t.same(JSON.parse(body), {
        statusCode: 400,
        code: 'FST_ERR_CTP_EMPTY_JSON_BODY',
        error: 'Bad Request',
        message: 'Body cannot be empty when content-type is set to \'application/json\''
      })
      t.end()
    })
  })
})

test('custom options for webhook (using plugin echo handler and input content type and body) does not return an error, but a good response (200) and some content', (t) => {
  // note that this tests is successful because echo handler wants json as input content type, and a valid (non empty) json content
  const fastify = Fastify()
  const webhookHandlers = require('../src/handlers') // get plugin handlers
  const webhookPlugin = require('../')
  t.teardown(() => { fastify.close() })
  fastify.register(webhookPlugin, {
    url: '/custom-webhook',
    handler: webhookHandlers.echo
  })

  fastify.listen({ port: 0 }, (err, address) => {
    t.error(err)
    const sampleData = { payload: 'test' }
    // const sampleData = '{"payload":"test"}'

    sget({
      method: 'POST',
      timeout: 2000,
      url: `${address}/custom-webhook`,
      headers: {
        'content-type': 'application/json' // force the right mime type to send data here
      },
      body: JSON.stringify(sampleData)
      // body: sampleData  // good if already in JSON format ...
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-type'], defaultReplyType)
      t.same(JSON.parse(body), sampleData)
      t.end()
    })
  })
})

test('custom options for webhook (using plugin acknowledge handler and no input content type and no body content) so no secret key, must return a Forbidden error (403) and its description', (t) => {
  const fastify = Fastify()
  const webhookHandlers = require('../src/handlers') // get plugin handlers
  const webhookPlugin = require('../')
  t.teardown(() => { fastify.close() })
  fastify.register(webhookPlugin, {
    url: '/custom-webhook',
    handler: webhookHandlers.acknowledge,
    secretKey: secrets.secretKeyGood
  })

  fastify.listen({ port: 0 }, (err, address) => {
    t.error(err)

    sget({
      method: 'POST',
      timeout: 2000,
      url: `${address}/custom-webhook`
      // no secret key provided (in the body content)
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 403)
      t.equal(response.headers['content-type'], defaultReplyType)
      t.same(JSON.parse(body), { statusCode: 403, error: 'Forbidden', message: 'Missing or wrong secret key' })
      t.end()
    })
  })
})

test('custom options for webhook (using plugin acknowledge handler and input content type and body content) and a wrong secret key, must return a Forbidden error (403) and its description', (t) => {
  const fastify = Fastify()
  const webhookHandlers = require('../src/handlers') // get plugin handlers
  const webhookPlugin = require('../')
  t.teardown(() => { fastify.close() })
  fastify.register(webhookPlugin, {
    url: '/custom-webhook',
    handler: webhookHandlers.acknowledge,
    secretKey: secrets.secretKeyGood
  })

  fastify.listen({ port: 0 }, (err, address) => {
    t.error(err)
    const sampleData = { payload: 'test', secretKey: secrets.secretKeyBad }

    sget({
      method: 'POST',
      timeout: 2000,
      url: `${address}/custom-webhook`,
      headers: {
        'content-type': 'application/json' // force the right mime type to send data here
      },
      body: JSON.stringify(sampleData)
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 403)
      t.equal(response.headers['content-type'], defaultReplyType)
      t.same(JSON.parse(body), { statusCode: 403, error: 'Forbidden', message: 'Missing or wrong secret key' })
      t.end()
    })
  })
})

test('custom options for webhook (using plugin acknowledge handler and input content type and body content) and a secret key, must return a good response (200) and some content', (t) => {
  const fastify = Fastify()
  const webhookHandlers = require('../src/handlers') // get plugin handlers
  const webhookPlugin = require('../')
  t.teardown(() => { fastify.close() })
  fastify.register(webhookPlugin, {
    url: '/custom-webhook',
    handler: webhookHandlers.acknowledge,
    secretKey: secrets.secretKeyGood
  })

  fastify.listen({ port: 0 }, (err, address) => {
    t.error(err)
    const sampleData = { payload: 'test', secretKey: secrets.secretKeyGood }

    sget({
      method: 'POST',
      timeout: 2000,
      url: `${address}/custom-webhook`,
      headers: {
        'content-type': 'application/json' // force the right mime type to send data here
      },
      body: JSON.stringify(sampleData)
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-type'], defaultReplyType)
      t.same(JSON.parse(body), { statusCode: 200, result: 'success' })
      t.end()
    })
  })
})

test('custom options for webhook (using plugin echo handler and no input content type and no body content) so no secret key, must return a Forbidden error (403) and its description', (t) => {
  const fastify = Fastify()
  const webhookHandlers = require('../src/handlers') // get plugin handlers
  const webhookPlugin = require('../')
  t.teardown(() => { fastify.close() })
  fastify.register(webhookPlugin, {
    url: '/custom-webhook',
    handler: webhookHandlers.echo,
    secretKey: secrets.secretKeyGood
  })

  fastify.listen({ port: 0 }, (err, address) => {
    t.error(err)

    sget({
      method: 'POST',
      timeout: 2000,
      url: `${address}/custom-webhook`
      // no secret key provided (in the body content)
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 403)
      t.equal(response.headers['content-type'], defaultReplyType)
      t.same(JSON.parse(body), { statusCode: 403, error: 'Forbidden', message: 'Missing or wrong secret key' })
      t.end()
    })
  })
})

test('custom options for webhook (using plugin echo handler and input content type and body content) and a wrong secret key, must return a Forbidden error (403) and its description', (t) => {
  const fastify = Fastify()
  const webhookHandlers = require('../src/handlers') // get plugin handlers
  const webhookPlugin = require('../')
  t.teardown(() => { fastify.close() })
  fastify.register(webhookPlugin, {
    url: '/custom-webhook',
    handler: webhookHandlers.echo,
    secretKey: secrets.secretKeyGood
  })

  fastify.listen({ port: 0 }, (err, address) => {
    t.error(err)
    const sampleData = { payload: 'test', secretKey: secrets.secretKeyBad }

    sget({
      method: 'POST',
      timeout: 2000,
      url: `${address}/custom-webhook`,
      headers: {
        'content-type': 'application/json' // force the right mime type to send data here
      },
      body: JSON.stringify(sampleData)
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 403)
      t.equal(response.headers['content-type'], defaultReplyType)
      t.same(JSON.parse(body), { statusCode: 403, error: 'Forbidden', message: 'Missing or wrong secret key' })
      t.end()
    })
  })
})

test('custom options for webhook (using plugin echo handler and input content type and body content) and a secret key, must return a good response (200) and some content', (t) => {
  const fastify = Fastify()
  const webhookHandlers = require('../src/handlers') // get plugin handlers
  const webhookPlugin = require('../')
  t.teardown(() => { fastify.close() })
  fastify.register(webhookPlugin, {
    url: '/custom-webhook',
    handler: webhookHandlers.echo,
    secretKey: secrets.secretKeyGood
  })

  fastify.listen({ port: 0 }, (err, address) => {
    t.error(err)
    const sampleData = { payload: 'test', secretKey: secrets.secretKeyGood }

    sget({
      method: 'POST',
      timeout: 2000,
      url: `${address}/custom-webhook`,
      headers: {
        'content-type': 'application/json' // force the right mime type to send data here
      },
      body: JSON.stringify(sampleData)
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-type'], defaultReplyType)
      t.same(JSON.parse(body), { payload: 'test', secretKey: secrets.secretKeyGood })
      t.end()
    })
  })
})

const webhookSecretKey = secrets.secretKeyGood

function checkSecretKey (request, reply, done) {
  // function that checks the given secret key, if is good or not
  // note that for simplicity the secret key is mandatory here (not checked in input arguments)
  if (request.headers['content-type'] !== 'application/json' || request.body.secretKey !== webhookSecretKey) {
    reply.code(403).send(new Error('Missing or wrong secret key'))
  }
  done()
}

function checkTokenEven (request, reply, done) {
  const stringToken = request.params.token || ''
  // console.log(`chek token: given "${stringToken}", check if it's even`)
  const numToken = parseInt(stringToken)
  // console.log(`chek token: "${stringToken}" is a number, ${typeof numToken === 'number'}`)
  // console.log(`chek token: "${stringToken}" converted into the number ${numToken}`)
  // function that checks if the given token is good or not
  // for example even numbers are ok, odd or negatives not
  // note that for simplicity the user token is mandatory here (not checked in input arguments)
  if (!isNaN(numToken) && numToken > 0 && (numToken % 2 === 0)) {
    reply.code(200)
  } else {
    reply.code(403).send(new Error('Missing or wrong token'))
  }
  done()
}

test('custom options for webhook (using plugin echo handler and input content type and body content) and a secret key and a user token (needed but not provided), must return a Forbidden error (403) and its description', (t) => {
  const fastify = Fastify()
  const webhookHandlers = require('../src/handlers') // get plugin handlers
  const webhookPlugin = require('../')
  t.teardown(() => { fastify.close() })
  fastify.register(webhookPlugin, {
    url: '/custom-webhook/:token',
    handler: webhookHandlers.echo,
    secretKey: secrets.secretKeyGood,
    preHandlers: [checkSecretKey, checkTokenEven]
  })

  fastify.listen({ port: 0 }, (err, address) => {
    t.error(err)
    const sampleData = { payload: 'test', secretKey: secrets.secretKeyGood }
    // const userToken = '' // pass token empty

    sget({
      method: 'POST',
      timeout: 2000,
      // url: `${address}/custom-webhook/${userToken}`, // pass token empty
      url: `${address}/custom-webhook/`, // do not pass the token (or null)
      headers: {
        'content-type': 'application/json' // force the right mime type to send data here
      },
      body: JSON.stringify(sampleData)
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 403)
      t.equal(response.headers['content-type'], defaultReplyType)
      t.same(JSON.parse(body), { statusCode: 403, error: 'Forbidden', message: 'Missing or wrong token' })
      t.end()
    })
  })
})

test('custom options for webhook (using plugin echo handler and input content type and body content) and a secret key and a user token (provided but wrong), must return a Forbidden error (403) and its description', (t) => {
  const fastify = Fastify()
  const webhookHandlers = require('../src/handlers') // get plugin handlers
  const webhookPlugin = require('../')
  t.teardown(() => { fastify.close() })
  fastify.register(webhookPlugin, {
    url: '/custom-webhook/:token',
    handler: webhookHandlers.echo,
    secretKey: secrets.secretKeyGood,
    preHandlers: [checkSecretKey, checkTokenEven]
  })

  fastify.listen({ port: 0 }, (err, address) => {
    t.error(err)
    const sampleData = { payload: 'test', secretKey: secrets.secretKeyGood }
    const userToken = '0999'

    sget({
      method: 'POST',
      timeout: 2000,
      url: `${address}/custom-webhook/${userToken}`,
      headers: {
        'content-type': 'application/json' // force the right mime type to send data here
      },
      body: JSON.stringify(sampleData)
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 403)
      t.equal(response.headers['content-type'], defaultReplyType)
      t.same(JSON.parse(body), { statusCode: 403, error: 'Forbidden', message: 'Missing or wrong token' })
      t.end()
    })
  })
})

test('custom options for webhook (using plugin echo handler and input content type and body content) and a secret key and a user token, must return a good response (200) and some content', (t) => {
  const fastify = Fastify()
  const webhookHandlers = require('../src/handlers') // get plugin handlers
  const webhookPlugin = require('../')
  t.teardown(() => { fastify.close() })
  fastify.register(webhookPlugin, {
    url: '/custom-webhook/:token',
    handler: webhookHandlers.echo,
    secretKey: secrets.secretKeyGood,
    preHandlers: [checkSecretKey, checkTokenEven]
  })

  fastify.listen({ port: 0 }, (err, address) => {
    t.error(err)
    const sampleData = { payload: 'test', secretKey: secrets.secretKeyGood }
    const userToken = '1000'

    sget({
      method: 'POST',
      timeout: 2000,
      url: `${address}/custom-webhook/${userToken}`,
      headers: {
        'content-type': 'application/json' // force the right mime type to send data here
      },
      body: JSON.stringify(sampleData)
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-type'], defaultReplyType)
      t.same(JSON.parse(body), { payload: 'test', secretKey: secrets.secretKeyGood })
      t.end()
    })
  })
})
