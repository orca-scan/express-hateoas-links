# express-hateoas-links

Overrides res.json allowing an array of HATEOAS links passed as the second parameter to be appended to the JSON response.

## Installation

```bash
$ npm install --save express-hateoas-links
```

## Quick usage example

```js
// send person object with HATEOAS links added
res.json(personObject, [
    { rel: "self", method: "GET", href: 'http://127.0.0.1' },
    { rel: "create", method: "POST", title: 'Create Person', href: 'http://127.0.0.1/person' }
]);
```

## Typical use case

The example below adds a self & create link to a JSON schema used to create a person. This allows the consuming application to understand what properties are required to create a Person and the destination URL to post to, removing the need for the application to hard code API links. 

```js
var express = require('express'),
    app = express(),
    hateoasLinker = require('express-hateoas-links');

// replace standard express res.json with the new version
app.use(hateoasLinker);

// standard express route
app.get('/', function(req, res){

    // create an example JSON Schema
    var personSchema = {
        "name": "Person",
        "description": "This JSON Schema defines the paramaters required to create a Person object",
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
    res.render(personSchema, [
        { rel: "self", method: "GET", href: 'http://127.0.0.1' },
        { rel: "create", method: "POST", title: 'Create Person', href: 'http://127.0.0.1/person' }
    ]);
});

// express route to process the person creation
app.post('/person', function(req, res){
    // do some stuff with the person data
});

```

## Output

```json
{
    "name": "Person",
    "description": "This JSON Schema defines the paramaters required to create a Person object",
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

## License

[ISC License](LICENSE) &copy; 2016 [John Doherty](http://www.johndoherty.info/)