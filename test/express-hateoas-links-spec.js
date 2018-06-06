var express = require('express'),
    request = require('supertest'),
    hateoasLinker = require('../lib/express-hateoas-links.js'),
    app = null;

describe('express-hateoas-links', function () {

    beforeEach(function(){
        
        // create an express app
        app = express();

        // hook up breadcrumb middleware
        app.use(hateoasLinker);
    });

    it('should append HATEOAS links to json response', function(done){

        var testJson = {
            "name": "John Doherty",
            "role": "Wantrepreneur",
            "website": "www.johndoherty.info"
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
            "name": "John Doherty",
            "role": "Wantrepreneur",
            "website": "www.johndoherty.info",
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
            "name": "John Doherty",
            "role": "Wantrepreneur",
            "website": "www.johndoherty.info"
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

    it('should not append HATEOAS links property if disableHATEOAS=false', function(done){

        var testJson = {
            "name": "John Doherty",
            "role": "Wantrepreneur",
            "website": "www.johndoherty.info"
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
});