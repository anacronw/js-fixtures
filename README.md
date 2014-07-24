## Fixtures

The fixtures module allows you to load HTML content to be used by your tests.  Try using this in conjunction with a powerful assertion library such as [chai-jquery](https://github.com/chaijs/chai-jquery).

The code was completely refactored from the awesome jasmine-jquery with all jasmine and jquery dependencies removed, specs written with Chai + Mocha, and using an iframe implementation as a sandbox.  This allows the fixtures to be more portable and minimizes side effects with the test runner.

## Installation

```
npm install js-fixtures // if you use npm
bower install fixtures // or if you prefer bower
```

then within your test runner:

```
<script src="fixtures.js"></script>

// or if you prefer AMD:
define(['fixtures'], function(fixtures){
  ...
})
```

## Usage

Use `fixtures.load('your-fixture.html')` in your specs.  Fixtures will load from `test/javascripts/fixtures/your-fixture.html` (see below to change this path).  Once that is setup, you should be able to write specs that look like this:

```javascript
describe('my jquery plugin', function(){
    var $$;
    beforeEach(function(){
        fixtures.load('fixture-with-jquery-and-plugin.html');
        $$ = fixtures.window().jQuery; // access the jquery instance from within the fixtures context
        $$('body').pizzazz();
    });
    it('it throws a lot of pizzazz on the screen', function(){
        $$('body').should.have.wonderful.colors;
        $$('body').should.contain(1000000).children;
        // etc.. etc..
    });
    afterEach(function(){
        fixtures.cleanUp(); // cleans up the fixture for the next test
    });
});
```

## Documentation
Your fixture is being loaded into an iframe container that is automatically added to the DOM.  Fixtures are internally cached, so you can load the same fixture file in several tests without penalty to your test suite's speed.

Several methods for loading fixtures are provided:

- `load(fixtureUrl[, fixtureUrl, ...], cb)`
  - Loads fixture(s) from one or more files and automatically appends them to the DOM (to the fixtures container).
  - If cb is provided, it will fire upon iframe ready
- `set(html)`
  - Same as `load` except you may load markup directly without specifying a path
- `sandbox(jsObject)`
  - Creates a quick fixture from the js object you provide (ex. `sandbox({id: 'foo-fixture', class: 'cool'})` )
- `read(fixtureUrl[, fixtureUrl, ...])`
  - Loads fixture(s) from one or more files but instead of appending them to the DOM returns them as a string (useful in combination with `set` if you want to use a templating engine).
- `cache(fixtureUrl[, fixtureUrl, ...])`
  - Pre-loads fixture(s) from one or more files and stores them into cache, without returning them or appending them to the DOM.

Additionally, two clean up methods are provided:

- `clearCache()`
  - purges internal cache
- `cleanUp()`
  - cleans-up fixtures container

Finally, there are two convenience methods to access the contents of the sandboxed iframe:
- `body`
  - returns the html contents of the body.  Use it to assert various values on the body of the iframe DOM.
- `window`
  - returns the global window reference of the iframe, giving you the ability to use the global variables injected into that context.
  
Options:
- `fixtures.containerId`
  - change the ID of the iframe that gets injected into the page
- `fixtures.path`
 - change the path to look for fixtures (default: `spec/javascripts/fixtures`)

## Executing Tests
Do an `npm install` to grab the test dependencies.  Then point your browser to the test/index.html file.
