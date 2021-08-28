# express-hateoas-links

[![Build Status](https://travis-ci.org/orca-scan/express-hateoas-links.svg?branch=master)](https://travis-ci.org/orca-scan/express-hateoas-links) [![npm](https://img.shields.io/npm/dt/express-hateoas-links.svg)](https://www.npmjs.com/package/express-hateoas-links)

Extends express `res.json` to simplify building HATEOAS enabled REST API's by appending links to JSON responses.

## Installation

```bash
npm install --save express-hateoas-links
```

## Usage

```js
// send person object with HATEOAS links added
res.json(personObject, [
    { rel: "self", method: "GET", href: 'http://127.0.0.1' },
    { rel: "create", method: "POST", title: 'Create Person', href: 'http://127.0.0.1/person' }
]);
```

Optionally exclude/remove links based on rel value:

```js
res.json(personObject, [
    { rel: "self", method: "GET", href: 'http://127.0.0.1' },
    { rel: "create", method: "POST", title: 'Create Person', href: 'http://127.0.0.1/person' }
], [ 'create' ]); // <- removes `create` link
```

## Typical use case

The example below adds a self & create link to a JSON schema used to create a person. This allows the consuming application to understand what properties are required to create a Person and the destination URL to post to, removing the need for the application to hard code API links. 

```js
var express = require('express');
var app = express();
var hateoasLinker = require('express-hateoas-links');

// replace standard express res.json with the new version
app.use(hateoasLinker);

// standard express route
app.get('/', function(req, res){

    // create an example JSON Schema
    var personSchema = {
        "name": "Person",
        "description": "This JSON Schema defines the parameters required to create a Person object",
        "properties": {
            "name": {
                "title": "Name",
                "description": "Please enter your full name",
                "type": "string",
                "maxLength": 30,
                "minLength": 1,
                "required": true
            },
            "jobTitle": {
                "title": "Job Title",
                "type": "string"
            },
            "telephone": {
                "title": "Telephone Number",
                "description": "Please enter telephone number including country code",
                "type": "string",
                "required": true
            }
        }
    };

    // call res.json as normal but pass second param as array of links
    res.json(personSchema, [
        { rel: "self", method: "GET", href: 'http://127.0.0.1' },
        { rel: "create", method: "POST", title: 'Create Person', href: 'http://127.0.0.1/person' }
    ]);
});

// express route to process the person creation
app.post('/person', function(req, res){
    // do some stuff with the person data
});
```

You can set `req.disableHATEOAS = false` within a controller or pass `?hateoas=false` to disable HATEOAS links.

### Output

```json
{
    "name": "Person",
    "description": "This JSON Schema defines the parameters required to create a Person object",
    "properties": {
        "name": {
            "title": "Name",
            "description": "Please enter your full name",
            "type": "string",
            "maxLength": 30,
            "minLength": 1,
            "required": true
        },
        "jobTitle": {
            "title": "Job Title",
            "type": "string"
        },
        "telephone": {
            "title": "Telephone Number",
            "description": "Please enter telephone number including country code",
            "type": "string",
            "required": true
        }
    },
    "links":[
        {
            "rel": "self",
            "method": "GET",
            "href": "http://127.0.0.1"
        },
        {
            "rel": "create",
            "method": "POST",
            "title": "Create Person",
            "href": "http://127.0.0.1/person"
        }
    ]
}
```

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request

## Tests

You can run the unit tests by changing directory into the express-hateoas-links director within your node_modules folder, and run the following commands:

```bash
npm install   // install modules dev dependencies
npm test      // run unit tests
```

## Star the repo

Please star the repo if you find this useful as it helps us priorities which open source issues to tackle first.

## History

For change-log, check [releases](https://github.com/orca-scan/express-hateoas-links/releases).

## License

Licensed under [MIT License](LICENSE) &copy; Orca Scan, the [Barcode Scanner app](https://orcascan.com).
