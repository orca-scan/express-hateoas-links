var express = require('express');
var request = require('supertest');
var hateoasLinker = require('../lib/express-hateoas-links.js');
var app = null;

describe('express-hateoas-links', function () {

    beforeEach(function(){
        
        // create an express app
        app = express();

        // hook up breadcrumb middleware
        app.use(hateoasLinker);
    });

    it('should append HATEOAS links to json response', function(done){

        var testJson = {
            "name": "Orca Scan",
            "description": "Barcode scanner app",
            "website": "https://orcascan.com"
        };

        // create route to add links
        app.get('/', function (req, res) {

            res.json(testJson, [
                { rel: "self", method: "GET", href: 'http://127.0.0.1' }
            ]);
        });

        // execute request and test response
        request(app).get('/')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .end(function(err, res){
                
                // check we have a response
                expect(res.body).toBeDefined();
                
                // validate object integrity 
                expect(res.body.name).toEqual(testJson.name);
                expect(res.body.role).toEqual(testJson.role);
                expect(res.body.website).toEqual(testJson.website);
                
                // verify we have the HATEOAS links collection
                expect(res.body.links).toBeDefined();
                expect(res.body.links[0].rel).toEqual('self');
                expect(res.body.links[0].href).toEqual('http://127.0.0.1');
                
                // mark test as complete
                done(err);
            });
    });
    
    it('should append HATEOAS links to existing .links collection', function(done){

        var testJson = {
            "name": "Orca Scan",
            "description": "Barcode scanner app",
            "website": "https://orcascan.com",
            "links": [
                { rel: "update", method: "POST", href: 'http://127.0.0.1' }
            ]
        };

        // create route to add links
        app.get('/', function (req, res) {

            res.json(testJson, [
                { rel: "self", method: "GET", href: 'http://127.0.0.1' }
            ]);
        });

        // execute request and test response
        request(app).get('/')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .end(function(err, res){
                
                // check we have a response
                expect(res.body).toBeDefined();
                
                // validate object integrity 
                expect(res.body.name).toEqual(testJson.name);
                expect(res.body.role).toEqual(testJson.role);
                expect(res.body.website).toEqual(testJson.website);
                
                expect(res.body.links).toBeDefined();
                expect(res.body.links.length).toEqual(2);
                
                // check first link exists
                expect(res.body.links[0].rel).toEqual('update');
                expect(res.body.links[0].method).toEqual('POST');
                expect(res.body.links[0].href).toEqual('http://127.0.0.1');
                
                // check second link exists
                expect(res.body.links[1].rel).toEqual('self');
                expect(res.body.links[1].method).toEqual('GET');
                expect(res.body.links[1].href).toEqual('http://127.0.0.1');
                
                // mark test as complete
                done(err);
            });
    });
    
    it('should not append HATEOAS links property', function(done){

        var testJson = {
            "name": "Orca Scan",
            "description": "Barcode scanner app",
            "website": "https://orcascan.com"
        };

        // create route to add links
        app.get('/', function (req, res) {

            res.json(testJson);
        });

        // execute request and test response
        request(app).get('/')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .end(function(err, res){
                
                // check we have a response
                expect(res.body).toBeDefined();
                
                // validate object integrity 
                expect(res.body.name).toEqual(testJson.name);
                expect(res.body.role).toEqual(testJson.role);
                expect(res.body.website).toEqual(testJson.website);
                
                // check a links property was not added
                expect(res.body.links).not.toBeDefined();
                
                // mark test as complete
                done(err);
            });
    });

    it('should not append HATEOAS links if res.disableHATEOAS=false', function(done){

        var testJson = {
            "name": "Orca Scan",
            "description": "Barcode scanner app",
            "website": "https://orcascan.com"
        };

        // create route to add links
        app.get('/', function (req, res) {
            res.disableHATEOAS = true;
            res.json(testJson, [
                { rel: "update", method: "POST", href: 'http://127.0.0.1' }
            ]);
        });

        // execute request and test response
        request(app).get('/')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .end(function(err, res){
                
                // check we have a response
                expect(res.body).toBeDefined();
                
                // validate object integrity 
                expect(res.body.name).toEqual(testJson.name);
                expect(res.body.role).toEqual(testJson.role);
                expect(res.body.website).toEqual(testJson.website);
                
                // check a links property was not added
                expect(res.body.links).not.toBeDefined();
                
                // mark test as complete
                done(err);
            });
    });

    it('should handle undefined json payload without links', function(done){

        // create route that returns undefined payload
        app.get('/', function (req, res) {
            res.json(undefined);
        });

        // execute request and verify middleware does not throw
        request(app).get('/')
            .end(function(err, res){

                expect(res.statusCode).not.toEqual(500);
                done(err);
            });
    });

    it('should return express response object from res.json', function(done) {

        app.get('/', function (req, res) {

            var returned = res.json({ name: "Orca Scan"}, [
                { rel: "self", method: "GET", href: 'http://127.0.0.1' }
            ]);

            expect(returned).toEqual(res);
            expect(typeof returned.end).toEqual('function');
        });

        request(app).get('/')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .end(done);
    });

    it('should not append HATEOAS links if ?hateoas=false', function(done) {

        var testJson = {
            "name": "Orca Scan",
            "description": "Barcode scanner app",
            "website": "https://orcascan.com"
        };

        // create route to add links
        app.get('/', function (req, res) {
            res.json(testJson, [
                { rel: "update", method: "POST", href: 'http://127.0.0.1' }
            ]);
        });

        // execute request and test response
        request(app).get('/?hateoas=false')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .end(function(err, res){
                
                // check we have a response
                expect(res.body).toBeDefined();
                
                // validate object integrity 
                expect(res.body.name).toEqual(testJson.name);
                expect(res.body.role).toEqual(testJson.role);
                expect(res.body.website).toEqual(testJson.website);
                
                // check a links property was not added
                expect(res.body.links).not.toBeDefined();
                
                // mark test as complete
                done(err);
            });
    });
    
    it('should exclude HATEOAS links', function(done) {

        var testJson = {
            "name": "Orca Scan",
            "description": "Barcode scanner app",
            "website": "https://orcascan.com",
            "links": [
                { rel: "create", method: "POST", href: 'http://127.0.0.1' },
                { rel: "update", method: "PUT", href: 'http://127.0.0.1' }
            ]
        };

        // create route to add links
        app.get('/', function (req, res) {

            res.json(testJson, [
                { rel: "self", method: "GET", href: 'http://127.0.0.1' }
            ],
            [
                'create'
            ]);
        });

        // execute request and test response
        request(app).get('/')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .end(function(err, res){
                
                // check we have a response
                expect(res.body).toBeDefined();
                
                // validate object integrity 
                expect(res.body.name).toEqual(testJson.name);
                expect(res.body.role).toEqual(testJson.role);
                expect(res.body.website).toEqual(testJson.website);
                
                expect(res.body.links).toBeDefined();
                expect(res.body.links.length).toEqual(2);
                expect(res.body.links[0].rel).toEqual('update');
                expect(res.body.links[0].method).toEqual('PUT');
                expect(res.body.links[0].href).toEqual('http://127.0.0.1');
                expect(res.body.links[1].rel).toEqual('self');
                expect(res.body.links[1].method).toEqual('GET');
                expect(res.body.links[1].href).toEqual('http://127.0.0.1');

                // mark test as complete
                done(err);
            });
    });

    it('should not modify the original object when adding links', function(done) {

        var existingLinks = [{ rel: "create", method: "POST", href: 'http://127.0.0.1' }];
        var testJson = { "name": "Orca Scan", "links": existingLinks };

        app.get('/', function (req, res) {
            res.json(testJson, [
                { rel: "self", method: "GET", href: 'http://127.0.0.1' }
            ]);
        });

        request(app).get('/')
            .expect(200)
            .end(function(err, res){

                // response has both links
                expect(res.body.links.length).toEqual(2);

                // but the caller's object and its links array are untouched
                expect(testJson.links).toBe(existingLinks);
                expect(testJson.links.length).toEqual(1);
                done(err);
            });
    });

    it('should not modify the original object if ?hateoas=false', function(done) {

        var testJson = { "name": "Orca Scan", "links": [{ rel: "create", method: "POST", href: 'http://127.0.0.1' }] };

        app.get('/', function (req, res) {
            res.json(testJson);
        });

        request(app).get('/?hateoas=false')
            .expect(200)
            .end(function(err, res){

                // links removed from the response only
                expect(res.body.links).toBeUndefined();
                expect(testJson.links.length).toEqual(1);
                done(err);
            });
    });

    it('should send nested values unchanged', function(done) {

        var testJson = { "list": [{ "barcode": "123", "date": new Date('2026-01-01T00:00:00.000Z'), "missing": undefined }] };

        app.get('/', function (req, res) {
            res.json(testJson, [
                { rel: "self", method: "GET", href: 'http://127.0.0.1' }
            ]);
        });

        request(app).get('/')
            .expect(200)
            .end(function(err, res){

                // serialized exactly as JSON.stringify would (dates as ISO strings, undefined dropped)
                expect(res.body.list).toEqual([{ "barcode": "123", "date": "2026-01-01T00:00:00.000Z" }]);
                done(err);
            });
    });

    it('should send a Date payload the same as express', function(done) {

        app.get('/', function (req, res) {
            res.json(new Date('2026-01-01T00:00:00.000Z'));
        });

        request(app).get('/')
            .expect(200)
            .end(function(err, res){

                expect(res.text).toEqual('"2026-01-01T00:00:00.000Z"');
                done(err);
            });
    });

    it('should keep a "__proto__" key as data and not merge its links', function(done) {

        // JSON.parse (e.g. an echoed request body) creates "__proto__" as an own property
        var testJson = JSON.parse('{ "name": "Orca Scan", "__proto__": { "links": [{ "rel": "evil" }] } }');

        app.get('/', function (req, res) {
            res.json(testJson, [
                { rel: "self", method: "GET", href: 'http://127.0.0.1' }
            ]);
        });

        request(app).get('/')
            .expect(200)
            .end(function(err, res){

                expect(res.text).toEqual('{"name":"Orca Scan","__proto__":{"links":[{"rel":"evil"}]},"links":[{"rel":"self","method":"GET","href":"http://127.0.0.1"}]}');
                done(err);
            });
    });

    it('should remove links if ?hateoas=false when payload has a "__proto__" key', function(done) {

        var testJson = JSON.parse('{ "name": "Orca Scan", "__proto__": { "links": [{ "rel": "evil" }] } }');

        app.get('/', function (req, res) {
            res.json(testJson, [
                { rel: "self", method: "GET", href: 'http://127.0.0.1' }
            ]);
        });

        request(app).get('/?hateoas=false')
            .expect(200)
            .end(function(err, res){

                expect(res.text).toEqual('{"name":"Orca Scan","__proto__":{"links":[{"rel":"evil"}]}}');
                done(err);
            });
    });

    it('should append HATEOAS links to a plain object with its own toJSON', function(done) {

        var testJson = {
            name: 'Orca Scan',
            secret: 'hidden',
            toJSON: function() {
                return { name: this.name };
            }
        };

        app.get('/', function (req, res) {
            res.json(testJson, [
                { rel: "self", method: "GET", href: 'http://127.0.0.1' }
            ]);
        });

        request(app).get('/')
            .expect(200)
            .end(function(err, res){

                expect(res.body.name).toEqual('Orca Scan');
                expect(res.body.secret).toBeUndefined();
                expect(res.body.links.length).toEqual(1);
                expect(res.body.links[0].rel).toEqual('self');
                done(err);
            });
    });
});