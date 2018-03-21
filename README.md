# fastify-webhook
Fastify Plugin to serve webhooks with some default settings.

With this plugin, Fastify will have a route configured for `/webhook` POST requests.


## Usage

```js
const fastify = require('fastify')()

// example without specifying options, returning a default webhook that only dump the POST request
fastify.register(require('fastify-webhook'))
// or
// TODO: future use ...
// example with custom webhook URLs (one or more)
// fastify.register(require('fastify-webhook') {'webhook1': webhookHandler1, 'webhook2': webhookHandler2})

fastify.listen(3000)
// curl -X POST 127.0.0.1:3000/webhook -H 'Content-Type: application/json' -d '{"payload":"test"}' => returning a JSON dump of the given data, and no thrown error
```

## Requirements

Fastify 0.43.0 or later.


## License

Licensed under [Apache-2.0](./LICENSE).

----
