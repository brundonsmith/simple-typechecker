function exists(val) {
  return typeof val !== 'undefined' && val !== null;
}

/*
  Takes a javascript object of data and another javascript object describing a
  data type, and prints out detailed console errors about what if any in the
  data object deviates from the defined structure.

  The full specification of the data structure spec is:
  - A string means the value's `typeof` is expected to match that
  - A null means the value is expected to be null
  - An object means the value is expected to match that object structure
    (recursive)
  - An array with 0 elements means the value is expected to be an array
    containing any contents
  - An array with 1 element means the value is expected to be an array whose
    elements match that spec (can be any of the above)
  - An array with 2 or more elements means the value is one of the provided
    types

  That last one is weird. It mixes metaphors a little bit, but it allows for
  complete representation without massively complicating the spec structure.
*/
function check(obj, type, objName = 'object') {
  var errorMessages = getErrorMessages(obj, type);
  errorMessages.forEach(message => console.assert(!exists(message), objName + message))
  return obj;
}

function getErrorMessages(val, type) {

  if(Array.isArray(type)) {
    if(type.length === 0) {
      if(!Array.isArray(val)) {
        return [ ' is not an array: ' + JSON.stringify(val) ]
      } else {
        return [ ]
      }
    } else if(type.length === 1) {
      // an array of one type
      if(!Array.isArray(val)) {
        return [ ' is not an array: ' + JSON.stringify(val) ]
      } else {
        return val.map((item, index) =>
          getErrorMessages(item, type[0])
            .map(err => `[${index}]` + err)
        ).reduce((all, list) => all.concat(list), [])
      }
    } else {
      // multiple possible types
      var errorMessageSets = type.map(possibleType => getErrorMessages(val, possibleType));

      if(errorMessageSets.some(set => set.length === 0)) {
        return [ ];
      } else {
        return [ errorMessageSets.reduce((all, set) => all.concat(set), []).join(' and') ]
      }
    }
  } else if(exists(type) && typeof type === 'object') {

    // object with its own structure
    if(!exists(val) || typeof val !== 'object') {
      return [ ' is not an object: ' + JSON.stringify(val) ];
    }

    return Object.keys(type).map(prop =>
      getErrorMessages(val[prop], type[prop])
        .map(err => '.' + prop + err)
    ).reduce((all, list) => all.concat(list), [])

  } else {
    // flat type
    if(!exists(type)) { // null or undefined
      if(exists(val)) {
        return [ ' is not null: ' + JSON.stringify(val) ]
      } else {
        return [ ];
      }
    } else if(typeof val !== type) { // number, string, boolean
      return [ ' is not a ' + type + ': ' + JSON.stringify(val) ]
    }
  }

  return [];
}

module.exports = check;
