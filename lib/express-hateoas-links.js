'use strict';

module.exports = function(req, res, next) {

    // save a pointer to the original res.json() so we can replace it if we don't have a links param
    var originalJson = res.json;

    // override default express res.json method to intercept links and excludeRels param
    res.json = function(object, links, exclude) {

        // check if client/server requested HATEOAS links to be disabled
        var disableHateoas = res.disableHATEOAS || (req.query.hateoas === 'false');

        // copy the object so adding/removing .links does not change the caller's object
        var jsonObject = copyTopLevel(object);

        // remove .links if disableHateoas is true
        if (disableHateoas && jsonObject && jsonObject.links) {
            delete jsonObject.links;
        }

        // set the json function back to its original value (we need to do this so the app instance is correct)
        res.json = originalJson;

        if (!Array.isArray(links) || links.length <= 0 || disableHateoas) {

            // no links provided, therefore process this as normal
            return res.json(jsonObject);
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
            return res.json(jsonObject);
        }
    };

    next();
};

/**
 * Copies the top level of the object, as we only ever add or remove the top level .links property.
 * A deep clone (JSON.parse(JSON.stringify())) is avoided because it is slow and memory heavy on large responses.
 * Anything that is not a plain object or array (e.g. a Date, class instance or object with toJSON) is still JSON cloned,
 * so it is sent exactly as before
 * @param {any} object - value passed to res.json
 * @returns {any} copy of the object that is safe to modify
 */
function copyTopLevel(object) {

    if (Array.isArray(object)) {
        return object.slice();
    }

    if (!object || typeof object !== 'object') {
        return object;
    }

    var prototype = Object.getPrototypeOf(object);
    var isPlainObject = (prototype === Object.prototype || prototype === null) && typeof object.toJSON !== 'function';

    // spread (unlike Object.assign) keeps a "__proto__" key as a normal property
    return isPlainObject ? { ...object } : JSON.parse(JSON.stringify(object));
}