(function(fixtures){
  if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
      // NodeJS
    module.exports = fixtures;
  } else if (typeof define === 'function' && define.amd){
    define(function(){
        return fixtures;
    });
  } else{
    var global = (false || eval)('this');
    global.fixtures = fixtures;
  }

}(new function(){
  "use strict";
  var fixturesCache = {};
  var self = this;

  self.containerId = 'js-fixtures';
  self.path = 'test/javascripts/fixtures';
  self.window = function(){
    var iframe = document.getElementById(self.containerId);
    if (!iframe) return null;

    return iframe.contentWindow || iframe.contentDocument;
  };
  self.body = function(){
    if (!self.window()) return null;

    var content = self.window().document.body.innerHTML;
    return content;
  };
  self.load = function(html){
    var cb = typeof arguments[arguments.length - 1] === 'function' ? arguments[arguments.length -1] : null;
    addToContainer(self.read.apply(self, arguments), cb);
  };
  self.set = function(html){
    addToContainer(html);
  };
  self.cache = function(){
    self.read.apply(self, arguments);
  };
  self.sandbox = function(obj){
    addToContainer(objToHTML(obj));
  };
  self.read = function(){
    var htmlChunks = '';

    Array.prototype.slice.call(arguments, 0).forEach(function(argument){
      if (typeof argument === 'string') htmlChunks += getFixtureHtml(argument);
    });
    return htmlChunks;
  };
  self.clearCache = function(){
    fixturesCache = {};
  };
  self.cleanUp = function(){
    var iframe = document.getElementById(self.containerId);
    if(!iframe) return null;

    iframe.parentNode.removeChild(iframe);
  };
  var createContainer  = function(html){
    var cb = typeof arguments[arguments.length - 1] === 'function' ? arguments[arguments.length -1] : null;
    var iframe = document.createElement('iframe');
    iframe.setAttribute('id', self.containerId);
    iframe.style.opacity = 0;
    iframe.style.filter = 'alpha(0)';

    document.body.appendChild(iframe);
    var doc = iframe.contentWindow || iframe.contentDocument;
    doc = doc.document ? doc.document : doc;

    if (cb){
        var iframeReady = setInterval(function(){
            if (doc.readyState === 'complete'){
                clearInterval(iframeReady);
                cb();
            }
        }, 0);
    }

    doc.open();
    doc.defaultView.onerror = captureErrors;
      doc.write(html);
      doc.close();
    };
    var addToContainer = function(html, cb){
      var container = document.getElementById(self.containerId);
      if (!container) createContainer.apply(self, arguments);
      else self.window().document.body.innerHTML += html;
    };
    var captureErrors = function(){
      if (window.onerror){
        // Rewrite the message prefix to indicate that the error
        // occurred in the fixture.
        arguments[0] = arguments[0].replace(/^[^:]*/, "Uncaught fixture error");
        window.onerror.apply(window, arguments);
      }
      return true;
    };
    var getFixtureHtml = function(url){
      if (typeof fixturesCache[url] === 'undefined'){
          loadFixtureIntoCache(url);
      }
      return fixturesCache[url];
    };
    var loadFixtureIntoCache = function(relativeUrl){
      var url = makeFixtureUrl(relativeUrl);
      var request = new XMLHttpRequest();
      request.open('GET', url + '?' + new Date().getTime(), false);
      request.send(null);
      fixturesCache[relativeUrl] = request.responseText;
    };
    var makeFixtureUrl = function(relativeUrl){
        return self.path.match('/$') ? self.path + relativeUrl : self.path + '/' + relativeUrl;
    };
    var objToHTML = function(obj){
      var divElem = document.createElement('div');
      for (var key in obj){
        if (key === 'class'){ // IE < 9 compatibility
          divElem.className = obj[key];
          continue;
        }
        divElem.setAttribute(key, obj[key]);
      }
      return divElem.outerHTML;
    };
  }
));
