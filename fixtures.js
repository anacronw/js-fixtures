"use strict";
(function(fixtures){
    if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
        // NodeJS
        module.exports = fixtures;
    } else if (typeof define === 'function' && define.amd){
        define(function(){
            return fixtures;
        });
    } else{
        var global = (false || eval)("this");
        global.fixtures = fixtures;
    }

}(new function(){
        var fixturesCache = {};
        var self = this;

        self.containerId = 'js-fixtures';
        self.path = 'spec/javascripts/fixtures';
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
        self.set = function(html){
            self.cleanUp();
            addToContainer(html);
        };
        self.appendSet = function(html){
            addToContainer(html);
        };
        self.preload = function(){
            self.read.apply(self, arguments);
        };
        self.load = function(){
            self.cleanUp();
            createContainer(self.read.apply(self, arguments));
        };
        self.appendLoad = function(){
            addToContainer(self.read.apply(self, arguments));
        };
        self.sandbox = function(attrs){
            self.cleanUp();
            var iframe = document.createElement('div');
            if (attrs !== undefined) {
                // TODO: add support for data attributes
                iframe.id = attrs.id || self.containerId;
                iframe.className = attrs['class'];
                self.containerId = iframe.id;
            } else {
                iframe.setAttribute("id", self.containerId);
            }
            iframe.style.display = "none";
            document.body.appendChild(iframe);
        };
        self.read = function(){
            var htmlChunks = [];

            var fixtureUrls = arguments;
            for (var urlCount = fixtureUrls.length, urlIndex = 0; urlIndex < urlCount; urlIndex++){
                htmlChunks.push(getFixtureHtml(fixtureUrls[urlIndex]));
            }
            return htmlChunks.join('');
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

            var iframe = document.createElement('iframe');
            iframe.setAttribute("id", self.containerId);
            iframe.style.display = "none";
            document.body.appendChild(iframe);
            var doc = iframe.contentWindow || iframe.contentDocument;
            doc = doc.document ? doc.document : doc;

            doc.open();
            doc.write(html);
            doc.close();
        };
        var addToContainer = function(html){
            var container = document.getElementById(self.containerId);
            if (!container){
                createContainer(html);
            } else{
                var iframeWindow = container.contentWindow || container.contentDocument;
                iframeWindow.document.body.innerHTML += html;
            }
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
            request.open("GET", url + "?" + new Date().getTime(), false);
            request.send(null);
            fixturesCache[relativeUrl] = request.responseText;
        };
        var makeFixtureUrl = function(relativeUrl){
            return self.path.match('/$') ? self.path + relativeUrl : self.path + '/' + relativeUrl;
        };
    }
));
