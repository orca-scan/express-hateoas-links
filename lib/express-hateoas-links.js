'use strict';

module.exports = function(req, res, next) {

    // save a pointer to the original res.json() so we can replace it if we don't have a links param
    var originalJson = res.json;

    // override default express res.json method to intercept links and excludeRels param
    res.json = function(object, links, exclude) {

        // check if client/server requested HATEOAS links to be disabled
        var disableHateoas = res.disableHATEOAS || (req.query.hateoas === 'false');

        // clone the object to avoid mutations
        var jsonObject = JSON.parse(JSON.stringify(object));

        // remove .links if disableHateoas is true
        if (disableHateoas && jsonObject.links) {
            delete jsonObject.links;
        }

        // set the json function back to its original value (we need to do this so the app instance is correct)
        res.json = originalJson;

        if (!Array.isArray(links) || links.length <= 0 || disableHateoas) {

            // no links provided, therefore process this as normal
            res.json(jsonObject);
        }
        else {

            // either add to existing links collection or add new collection
            jsonObject.links = (jsonObject.links) ? jsonObject.links.concat(links) : links;

            // if we have rels to exclude, remove them
            if (Array.isArray(exclude) && exclude.length > 0) {
                jsonObject.links = jsonObject.links.filter(function(item) {
                    return exclude.indexOf(item.rel) === -1;
                });
            }

            // send modified object to browser
            res.json(jsonObject);
        }
    }

    next();
};
