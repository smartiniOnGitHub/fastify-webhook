# fastify-webhook

  [![NPM Version](https://img.shields.io/npm/v/fastify-webhook.svg?style=flat)](https://npmjs.org/package/fastify-webhook/)
  [![NPM Downloads](https://img.shields.io/npm/dm/fastify-webhook.svg?style=flat)](https://npmjs.org/package/fastify-webhook/)
  [![Code Style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)
  [![Coverage Status](https://coveralls.io/repos/github/smartiniOnGitHub/fastify-webhook/badge.svg?branch=master)](https://coveralls.io/github/smartiniOnGitHub/fastify-webhook/?branch=master)

Fastify Plugin to serve webhooks with some useful default settings.

With this plugin, Fastify will have a route configured for `/webhook` POST requests.


## Usage

```js
const fastify = require('fastify')()

// example without specifying options, returning a default webhook mapped to '/webhook' that only acknowledge the POST request
fastify.register(require('fastify-webhook'))
// or
// example with custom webhook url and handler, and secret key
// fastify.register(require('fastify-webhook'), {'url': '/custom-webhook', 'handler': myWebhookHandler, 'secretKey': 'secret key'})
//
// note that to use one of handlers bundled with the plugin, you need to get a reference to the plugin script 'handlers', and then as handler pass a reference to desired function, like:
// const webhookHandlers = require('fastify-webhook/handlers') // get plugin handlers (optional)
// const webhookPlugin = require('fastify-webhook')
// fastify.register(webhookPlugin, { 'url': '/custom-webhook', 'handler': webhookHandlers.echo, 'secretKey': 'secret key'})
//

fastify.listen(3000)

// To test, for example (in another terminal session) do:
// curl http://127.0.0.1:8000/webhook -X POST -H 'Content-Type: application/json' -d '{"payload":"test"}' => returning a JSON dump of the given data, and no thrown error
// in Windows you need to escape double quote char in the given json body, so do:
// curl http://127.0.0.1:8000/webhook -X POST -H "Content-Type: application/json" -d "{\"payload\":\"test\"}"
// or put data in a json file and pass with something like: '-d @body.json'
```

In the [example](./example/) folder there are some simple server scripts that uses the plugin (inline but it's the same using it from npm registry).


## Requirements

Fastify ^1.1.0 .
Node.js 8.14.x or later.


## Note

By default the plugin map a default handler on the URI `/webhook` to be called via POST, otherwise it's possible to change via the setting 'url' in plugin options.

The plugin exposes some handlers, for common base operations (and webhook debug help).
To use one of them, before registering the plugin, you need to get a reference from its `handlers` source file;
then you can configure the desired one in the setting 'handler' in plugin options.
They are:
- `acknowledge` (default handler) that simply acknowledge the request, and reply with a simple json response
- `echo` it dumps the given input data in the (json) response
- `logger` it dumps some info on the request using Fastify logger
but of course for a real world usage you need to specify your own handler function, with arguments '(req, reply)'.
Otherwise you can use yours, with signature `function handler (req, reply)`.

Other plugin options:
- 'disableDefaultWebhook' (default false) to disable the registration of the route for the webhook
- 'secretKey' (default null) to specify a string as secret key that callers of the webhook must provide, or webhook will reply with an error
- 'beforeHandlers' is a list of functions to be used as beforeHandler in the specific route of the webhook; currently the list contains an internal function to check the secret key (if given); otherwise you can define and use yours, with signature `function beforeHandler (req, reply, done)`.

Note that there is not a good general way to handle (usually user-specific) token in requests, so this is not managed via the plugin, but in examples and tests you can find some info.


## License

Licensed under [Apache-2.0](./LICENSE).

----
