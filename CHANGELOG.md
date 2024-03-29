# Change Log

## [4.0.1](https://github.com/smartiniOnGitHub/fastify-webhook/releases/tag/4.0.1) (2022-07-25)
[Full Changelog](https://github.com/smartiniOnGitHub/fastify-webhook/compare/4.0.0...4.0.1)
Summary Changelog:
- Removed reference to an internal Fastify data structure for the request

## [4.0.0](https://github.com/smartiniOnGitHub/fastify-webhook/releases/tag/4.0.0) (2022-07-22)
[Full Changelog](https://github.com/smartiniOnGitHub/fastify-webhook/compare/3.0.0...4.0.0)
Summary Changelog:
- Updated requirements to Fastify '^4.0.0' and Fastify-plugin '^4.0.0'; 
  update code with related changes
- Updated all dependencies to latest (for Node.js 14 LTS)
- Update and simplified example and test code
- Update documentation from sources with JSDoc

## [3.0.0](https://github.com/smartiniOnGitHub/fastify-webhook/releases/tag/3.0.0) (2022-03-27)
[Full Changelog](https://github.com/smartiniOnGitHub/fastify-webhook/compare/2.1.0...3.0.0)
Summary Changelog:
- Update requirements to latest Fastify 3.x and Node.js 10 LTS
- Ensure all works again

## [2.1.0](https://github.com/smartiniOnGitHub/fastify-webhook/releases/tag/2.1.0) (2021-04-07)
[Full Changelog](https://github.com/smartiniOnGitHub/fastify-webhook/compare/2.0.0...2.1.0)
Summary Changelog:
- Update requirements to latest Fastify 2.x, so currently release '^2.15.3'
- Feature: keep compatibility with Node.js 8 LTS (but this is last release)
- Update all other dependencies
- Update Tap to latest (major), and update deprecated calls in tests
- Add JSDoc to generate documentation from sources

## [2.0.0](https://github.com/smartiniOnGitHub/fastify-webhook/releases/tag/2.0.0) (2019-04-10)
[Full Changelog](https://github.com/smartiniOnGitHub/fastify-webhook/compare/1.0.0...2.0.0)
Summary Changelog:
- Update requirements to Fastify v2
- Update all dependencies
- Breaking Change: rename plugin option 'beforeHandler' to 'preHandler', 
  due to a change/rename in Fastify v2
- Update function arguments like in Fastify v2 (from req to request, etc)

## [1.0.0](https://github.com/smartiniOnGitHub/fastify-webhook/releases/tag/1.0.0) (2019-04-05)
Summary Changelog:
- Updated all dependencies
- Note that this release number means that the plugin is stable, 
  and for Fastify v1
- Small updates

## [0.4.0](https://github.com/smartiniOnGitHub/fastify-webhook/releases/tag/0.4.0) (2019-04-01)
Summary Changelog:
- Align with latest Fastify v1 (and related plugins)
- Updated all dependencies
- Updated Tap tests
- Update code to use latest ES6/7/8 syntax
- Improve tests and examples, to read 'secretKey' value from env var SECRET_KEY 
  or otherwise from a fixed default value
- Breaking Change: rename plugin option 'disableDefaultWebhook' into 'disableWebhook'
- Add plugin option 'enableGetPlaceholder' (default false) to publish via GET 
  a route with the same path of the webhook, 
  but returning an HTTP Error 405 Method Not Allowed;
  add a sample usage in the 'example-enhanced'

## [0.3.2](https://github.com/smartiniOnGitHub/fastify-webhook/releases/tag/0.3.2) (2019-02-03)
Summary Changelog:
- Updated all dependencies
- Updated Tap tests

## [0.3.1](https://github.com/smartiniOnGitHub/fastify-webhook/releases/tag/0.3.1) (2019-01-02)
Summary Changelog:
- Update dependency on 'fastify-plugin' to '^1.4.0'
- Updated all other plugin dependencies

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
