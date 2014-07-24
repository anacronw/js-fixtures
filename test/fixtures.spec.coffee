define (require) ->
  fixtures = require '../fixtures'

  server = null

  describe 'fixtures', ->
    beforeEach ->
      server = sinon.fakeServer.create()
      server.respondWith 'hello!'
      server.autoRespondAfter = 1

    afterEach ->
      server.restore()
      fixtures.clearCache()
      fixtures.cleanUp()

    it 'sets "js-fixtures" as the default container id', ->
      fixtures.containerId.should.equal 'js-fixtures'
    it 'sets "test/javascripts/fixtures" as the default fixtures path', ->
      fixtures.path.should.equal 'test/javascripts/fixtures'
    it 'sets window to null', ->
      fixtures.window.should.be.a 'function'
      should.not.exist fixtures.window()

    describe 'content', ->
      it 'is always visible', ->
        fixtures.set '<button id="test">Test</button>'

        button = fixtures.window().document.getElementById 'test'
        button.offsetHeight.should.be.greaterThan 0
        button.offsetWidth.should.be.greaterThan 0
      it.skip 'throws unhandled errors in parent window'

    describe 'body', ->
      it 'defaults to null', ->
        fixtures.body.should.be.a 'function'
        should.not.exist fixtures.body()
      it 'returns the contents of the body', ->
        fixtures.set 'some silly string'
        fixtures.body().should.equal 'some silly string'

    describe 'window', ->
      it 'returns the window object of the iframe', ->
        fixtures.set 'test'
        window.should.not.equal fixtures.window()
      it 'contains global vars injected into frame', ->
        fixtures.set '<script>var test = "hello"</script>'
        fixtures.window().test.should.equal 'hello'

    describe 'read', ->
      it 'returns fixture HTML', ->
        html = fixtures.read 'some_url'
        html.should.equal 'hello!'
      it 'returns multiple fixtures', ->
        html = fixtures.read 'some_url', 'another_url'
        html.should.equal 'hello!hello!'
      it 'returns multiple fixtures with same url', ->
        html = fixtures.read 'some_url', 'some_url'
        html.should.equal 'hello!hello!'
      it 'reads from paths ending in slash', ->
        fixtures.path = 'somepath/'
        fixtures.read 'some_url'
        server.requests[0].url.should.have.string 'somepath/some_url'
      it 'adds ending slash if missing', ->
        fixtures.path = 'somepath'
        fixtures.read 'some_url'
        server.requests[0].url.should.have.string 'somepath/some_url'

    describe 'load', ->
      it 'inserts html into container', ->
        fixtures.load 'some_url'
        fixtures.body().should.equal 'hello!'
      it 'inserts multiple fixtures', ->
        fixtures.load 'some_url', 'another_url'
        fixtures.body().should.equal 'hello!hello!'
      it 'inserts multiple fixtures with same url', ->
        fixtures.load 'some_url', 'some_url'
        fixtures.body().should.equal 'hello!hello!'
      it 'creates fixtures container when doesnt exist', ->
        fixtures.load 'some_url'
        should.exist document.getElementById(fixtures.containerId)
      it 'appends new content when container already exists', ->
        fixtures.set 'old content'
        fixtures.load 'some_url'
        fixtures.body().should.equal 'old contenthello!'
      it 'can execute javascript', ->
        server.respondWith '<script>document.write("test")</script>'
        fixtures.load 'some_url'
        fixtures.body().should.equal 'test'

      describe.skip 'when provided a callback', ->
        stub = null
        beforeEach ->
          sinon.useFakeXMLHttpRequest().onCreate (xhr) ->
            stub = sinon.stub xhr, 'send', ->
              xhr.responseText = '<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>'
            console.log stub
        afterEach ->
          stub.restore()

        it 'executes callback on iframe ready', (done) ->
          fixtures.load 'some_url', ->
            should.exist fixtures.window().$
            done()

    describe 'cache', ->
      it 'reads from cache', ->
        fixtures.cache 'some_url', 'another_url'
        fixtures.read 'someUrl', 'another_url'
        server.requests.should.have.length 2
      it 'does not cache the same fixtures twice', ->
        fixtures.cache 'someUrl', 'someUrl'
        server.requests.should.have.length 1

    describe 'set', ->
      it 'inserts html into container', ->
        fixtures.set '<div>sometext</div>'
        fixtures.body().should.equal '<div>sometext</div>'
      it 'creates fixtures container when doesnt exist', ->
        fixtures.set '<div>sometext</div>'
        container = document.getElementById fixtures.containerId
        should.exist container

    describe 'sandbox', ->
      it 'inserts sandbox into container', ->
        fixtures.sandbox {id: 'foo'}
        fixtures.body().should.equal '<div id="foo"></div>'
      it 'accepts booleans', ->
        fixtures.sandbox {test: true}
        div = fixtures.window().document.body.childNodes[0]
        'true'.should.equal div.getAttribute 'test'
      it 'accepts numbers', ->
        fixtures.sandbox {test: 3}
        div = fixtures.window().document.body.childNodes[0]
        '3'.should.equal div.getAttribute 'test'
      it 'accepts strings', ->
        fixtures.sandbox {test: 'blah'}
        div = fixtures.window().document.body.childNodes[0]
        'blah'.should.equal div.getAttribute 'test'
    describe 'cleanUp', ->
      it 'removes fixture container', ->
        fixtures.set 'old content'
        fixtures.cleanUp()
        should.not.exist document.getElementById fixtures.containerId
      it 'succeeds even if no preexisting container', ->
        (-> fixtures.cleanUp()).should.not.throw Error
