"use strict";
var fixtures = fixtures || new function(){
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
        return $('#' + self.containerId).contents().find('body').html();
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
        jQuery('#' + self.containerId).remove();
    };
    var createContainer  = function(html){

        var iframe = document.createElement('iframe');
        iframe.setAttribute("id", self.containerId);
        $('body').append(iframe);
        var doc = iframe.contentWindow || iframe.contentDocument;
        doc = doc.document ? doc.document : doc;

        doc.open();
        doc.write(html);
        doc.close();
    };
    var addToContainer = function(html){
        var container = jQuery('#' + self.containerId);
        if (!container.length){
            createContainer(html);
        }
        else{
            container.contents().find('body').append(html);
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
};
