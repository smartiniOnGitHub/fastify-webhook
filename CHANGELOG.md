# Change Log

## [0.3.0](https://github.com/smartiniOnGitHub/fastify-webhook/releases/tag/0.3.0) (2018-12-03)
Summary Changelog:
- Update required Fastify version to '^1.1.0', but stay on 1.x
- Update dependency on 'fastify-plugin' to '^1.2.1'
- Updated plugins
- Updated unit tests and examples to use new Fastify syntax/features
- In examples, listen to '127.0.0.1' and no more to all addresses ('0.0.0.0'),
  best practice for examples (unless you need to publish from a container)
- Move plugin main source in a 'src' folder
- Small cleanup and simplifications in the code base

## [0.2.0](https://github.com/smartiniOnGitHub/fastify-webhook/releases/tag/0.2.0) (2018-05-29)
Summary Changelog:
- Changed dev dependencies from 'request' to 'simple-get' and related tests, like in Fastify and related core plugins
- Add an example using secret key and user token, to run with npm custom command 'example-enhanced'
- Simplified a little the 'package.json' file
- Update documentation with some more options

## [0.1.0](https://github.com/smartiniOnGitHub/fastify-webhook/releases/tag/0.1.0) (2018-04-18)
Summary Changelog:
- First release, with basic features: default configuration and the ability to specify custom operations
- Provide some basic handlers (acknowledge, echo, logger)
- Optional secret key that consumers must provide to call the webhook exposed

----
