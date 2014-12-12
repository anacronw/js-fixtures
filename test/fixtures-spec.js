define(function(require){
    var fixtures = require('../fixtures');
    return function(){
        describe("fixtures", function(){
            var ajaxData = "some ajax data";
            var fixtureUrl = "some_url";
            var anotherFixtureUrl = "another_url";
            var server = sinon.fakeServer.create();
            var xhr = sinon.useFakeXMLHttpRequest();
            var appendFixturesContainerToDom = function(){
                fixtures.set('old content');
            };
            var text = 'some text';
            var html = '<div>' + text + '</div>';

            beforeEach(function(done){
                server = sinon.fakeServer.create();
                server.respondWith(ajaxData);
                server.autoRespondAfter = 1;

                setTimeout(done, 0); //Workaround for Mocha bug in IE https://github.com/visionmedia/mocha/issues/502
            });
            afterEach(function(){
                server.restore();
                fixtures.cleanUp();
                fixtures.clearCache();
            });

            describe("default initial config values", function(){
                it("should set 'js-fixtures' as the default container id", function(){
                    expect(fixtures.containerId).to.equal('js-fixtures');
                });
                it("should set 'spec/javascripts/fixtures/' as the default fixtures path", function(){
                    expect(fixtures.path).to.equal('spec/javascripts/fixtures');
                });
                it("should set body to null", function(){
                    expect(fixtures.body()).to.be(null);
                });
                it("should set window to null", function(){
                    expect(fixtures.window()).to.be(null);
                });
            });
            describe("content", function(){
                // jQuery defines 'visible' based on if an element consumes space in the page layout.
                // See http://api.jquery.com/visible-selector/
                // and https://github.com/jquery/jquery/blob/master/src/css/hiddenVisibleSelectors.js
                it("should be 'visible'", function(){
                    fixtures.set("<button id='test'>Test</button>");
                    var button = fixtures.window().document.getElementById('test');
                    expect(button.offsetHeight).to.be.greaterThan(0);
                    expect(button.offsetWidth).to.be.greaterThan(0);
                });
                describe("throws an unhandled error", function(){
                    var errorHandler;
                    beforeEach(function(){
                        errorHandler = window.onerror;
                    });
                    afterEach(function(){
                        window.onerror = errorHandler;
                    });
                    it("is reported in the parent window", function(done){
                        window.onerror = function (message) {
                            // Need to manually pass failed exceptions to the
                            // callback since we have overriden the default
                            // error handler for the test case.
                            try {
                                expect(message).to.equal('Uncaught fixture error: boom');
                                return done();
                            } catch (error) {
                                return done(error);
                            }
                        };
                        fixtures.set('<scr' + 'ipt>throw new Error("boom")</scr' + 'ipt>');
                    });
                });
            });
            describe("body", function(){
                it("should not be null when initialized properly", function(){
                    fixtures.set('test');
                    expect(fixtures.body()).to.not.be(null);
                });
                it("should return the body contents of the iframe", function(){
                    var sillyString = 'some silly string';
                    fixtures.set(sillyString);
                    expect(fixtures.body()).to.equal(sillyString);
                });
            });
            describe("window", function(){
                it("should return the window object of the iframe", function(){
                    fixtures.set('test');
                    expect(fixtures.window()).to.not.equal(window);
                });
                it("should contain global vars injected into frame", function(){
                    fixtures.set('<scr' + 'ipt>' + 'var test = "globalVar"' +  '</scr' + 'ipt>');
                    expect(fixtures.window().test).to.equal('globalVar');
                });
            });
            describe("read", function(){
                it("should return fixture HTML", function(){
                    var html = fixtures.read(fixtureUrl);

                    expect(html).to.equal(ajaxData);
                });
                it("should return duplicated HTML of a fixture when its url is provided twice in a single call", function(){
                    var html = fixtures.read(fixtureUrl, fixtureUrl);
                    expect(html).to.equal(ajaxData + ajaxData);
                });
                it("should return merged HTML of two fixtures when two different urls are provided in a single call", function(){
                    var html = fixtures.read(fixtureUrl, anotherFixtureUrl);
                    expect(html).to.equal(ajaxData + ajaxData);
                });
                it("should use the configured fixtures path concatenating it to the requested url (without concatenating a slash if it already has an ending one)", function(){
                    fixtures.path = 'a path ending with slash/';
                    fixtures.read(fixtureUrl);
                    expect(server.requests[0].url).to.have.string('a path ending with slash/' + fixtureUrl);
                });
                it("should use the configured fixtures path concatening it to the requested url (concatenating a slash if it doesn't have an ending one)", function(){
                    fixtures.path = "a path without an ending slash";
                    fixtures.read(fixtureUrl);
                    expect(server.requests[0].url).to.have.string("a path without an ending slash/" + fixtureUrl);
                });
            });
            describe("load", function(){
                it("should insert fixture HTML into container", function(){
                    fixtures.load(fixtureUrl);
                    expect(fixtures.body()).to.equal(ajaxData);
                });
                it("should insert duplicated fixture HTML into container when the same url is provided twice in a single call", function(){
                    fixtures.load(fixtureUrl, fixtureUrl);
                    expect(fixtures.body()).to.equal(ajaxData + ajaxData);
                });
                it("should insert merged HTML of two fixtures into container when two different urls are provided in a single call", function(){
                    fixtures.load(fixtureUrl, anotherFixtureUrl);
                    expect(fixtures.body()).to.equal(ajaxData + ajaxData);
                });
                describe("when fixture container does not exist", function(){
                    it("should automatically create fixtures container and append it to the DOM", function(){
                        fixtures.load(fixtureUrl);
                        expect(document.getElementById(fixtures.containerId)).to.not.be.null;
                    });
                });
                describe("when fixture container exists", function(){
                    beforeEach(function(){
                        appendFixturesContainerToDom();
                    });
                    it("should append it with new content", function(){
                        fixtures.load(fixtureUrl);
                        expect(fixtures.body()).to.equal('old content' + ajaxData);
                    });
                });
                describe("when fixture contains an inline script tag", function(){
                    beforeEach(function(){
                        ajaxData = "<script>document.write('test')</script>";
                        server.respondWith(ajaxData);
                    });
                    it("should execute the inline javascript after the fixture has been inserted into the body", function(){
                        fixtures.load(fixtureUrl);
                        expect(fixtures.body()).to.equal('test');
                    });
                });
                describe('when callback is passed', function(){
                    var stub;
                    var stubCount = 0;
                    beforeEach(function(){
                        var xhr = sinon.useFakeXMLHttpRequest();
                        xhr.onCreate = function(xhr){
                            stub = sinon.stub(xhr, "send", function(something){
                                stubCount++;
                                xhr.responseText = '<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>';
                            });
                        };
                    });
                    afterEach(function(){
                        stub.restore();
                        stubCount = 0;
                    });
                    it('executes callback upon iframe ready', function(done){
                        fixtures.load('some-fixture.html', function(){
                            expect(fixtures.window().$).to.exist;
                            done();
                        });
                    });
                    it('does not load the callback as a template', function(){
                        fixtures.load('some-fixture.html', 'blah.html', function(){});
                        expect(stubCount).to.equal(2)
                    });
                });
            });
            describe("cache", function() {
                describe("read after cache", function() {
                    it("should go from cache", function() {
                        fixtures.cache(fixtureUrl, anotherFixtureUrl);
                        fixtures.read(fixtureUrl, anotherFixtureUrl);
                        expect(server.requests.length).to.equal(2);
                    });

                    it("should return correct HTMLs", function() {
                        fixtures.cache(fixtureUrl, anotherFixtureUrl);
                        var html = fixtures.read(fixtureUrl, anotherFixtureUrl);
                        expect(html).to.equal(ajaxData + ajaxData);
                    });
                });

                it("should not cache the same fixture twice", function() {
                    fixtures.cache(fixtureUrl, fixtureUrl);
                    expect(server.requests.length).to.equal(1);
                });
            });

            describe("set", function() {
                it("should insert HTML into container", function() {
                    fixtures.set(html);
                    expect(fixtures.body().toLowerCase()).to.equal(html);
                });

                describe("when fixture container does not exist", function() {
                    it("should automatically create fixtures container and append it to DOM", function() {
                        fixtures.set(html);
                        expect(document.getElementById(fixtures.containerId)).to.not.be.null;
                    });
                });

                describe("when fixture container exists", function() {
                    beforeEach(function() {
                        appendFixturesContainerToDom();
                    });

                    it("should append it with new content", function() {
                        fixtures.set(html);
                        expect(fixtures.body().toLowerCase()).to.equal('old content' + html);
                    });
                });
            });
            describe('sandbox', function(){
                it('should insert the sandbox into the container', function(){
                    fixtures.sandbox({id: 'foo'});
                    expect(fixtures.body()).to.equal('<div id="foo"></div>');
                });
                it('accepts booleans, numbers, and string', function(){
                    fixtures.sandbox({class: 'blah', selected: true, "data-blah": 3});
                    var fixturesBody = fixtures.window().document.body;
                    expect(fixturesBody.childNodes.length).to.equal(1);
                    var appendedDiv = fixturesBody.childNodes[0];

                    expect(appendedDiv.getAttribute('class')).to.equal('blah');
                    expect(appendedDiv.getAttribute('selected')).to.equal('true');
                    expect(appendedDiv.getAttribute('data-blah')).to.equal('3');
                });
            });

            describe("cleanUp", function() {
                it("should remove fixtures container from DOM", function() {
                    appendFixturesContainerToDom();
                    fixtures.cleanUp();
                    expect(document.getElementById(fixtures.containerId)).to.be.null;
                });
                it('should succeed even if cleanup is called without loading', function(){
                    fixtures.cleanUp();
                });
            });
        });
    };
});
