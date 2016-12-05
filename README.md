# susurrus

A small, simple, magicless and buildstepless vanilla js framework for components that are to be loaded asynchronously (do note that it is still a work in progress).

It has 3 main components which are put in the global scope:
- [`loader`](#loader) : allows async loading of files and performing code that is dependent on those files
- [`dom`](#dom) : fascilitates creation of DOM elements and minimally expands the DOM interface of those elements  
- [`templates`](#templates) : provides a way to create instances based on a template, and to entrypoints declared in that template

## loader

The API of `loader` provides of the following methods, which are all chainable in any order
- loadJS(url) : ensures that the JavaScript file of that url will have been loaded
- loadCSS(url) : ensures that the CSS file of that url will have been loaded
- loadText(url) : ensures that the file of that url will have been loaded and that its content will be available as a string (see below)
- loadTemplate(templateKey, url) : ensures that the file of that url will have been loaded and that its content will be available as a template (see below)

The loading of these files will occur asynchronously, and as concurrently as the browser in question allows.

The above chaining also allows for the following method, which however does not allow further chaining
- perform(callback) : the code that will be performed after all the other 

Additionally, `loader` also provides the following utility method
- textFor(url): if the url has been loaded (via loadText or loadTemplate), this will return the response body as a string

The most straightforward way to use `loader` is
```javascript
loader
  .loadJS(someUrl)
  .loadCSS(someUrl)
  .perform(function(){
    // perform some business logic
  });
```

Another usecase would include an isolated call
```javascript
loader.loadCSS(someUrl);
```
which would ensure that loading of the css file in question will already have started (i.e. pre-loading to improve performance later on).

## dom

To able to create DOM elements, it's necessary to specify which element types should be provided.
```javascript
dom.using('div', 'p', 'a', 'img');
```

Once an element type has been declared for use (at least once), it will be available for creation
```javascript
var div = dom.div();
```
Any element will accept parameters in a number of variations
```javascript
// create a div and add a paragraph to it
dom.div(dom.p())

// create a paragraph and add some text to it
dom.p('some text')

// add attributes by supplying an object as a parameter
dom.img({ src : 'someUrl' })

// combine adding some text with setting an attribute
dom.a('some text', { href : 'someUrl' })

// add an array of elements, and several attributes
dom.div([dom.p('foo'), dom.p('bar'), dom.p('etc')],{'class':'foo', alt:'bar'});
// or in reverse order
dom.div({'class':'foo', alt:'bar'}, [dom.p('foo'), dom.p('bar'), dom.p('etc')]);

// supply a function as a second parameter, to modify the first one
dom.div('hello', function(text){ return text + ' world' });

// do the same, but with the first parameter being an array of strings
var ar = ["one", "two", "three"];
dom.div(ar, function(text){ return dom.p(text+'!')});
// or if you don't need the exclamation point
dom.div(ar, dom.p);

// do the same, but with the first being an array of objects
var ar = [{count:"one"}, {count:"two"}, {count:"three"}];
dom.div(ar, function(item){ return dom.p(item.count+'!') });
```

To the elements, it will add the following methods
- add(parameters) : accepts parameters in the same way as the creation methods of `dom` 
- empty() : will remove all the contents of the element
- update(parameters) : will perform an `empty` and then an `add` with the given parameters

Furthermore, each element will also be given the same creation methods that have been made available on `dom`
```javascript
var div = dom.div();
div.p('some text');
div.p('some other text');
```
The API of any existing DOM element can also be expanded
```javascript
var div = document.createElement('div');
dom(div);
dom.p('some text');

dom(document.getElementById('some-id')).update('some text');
```

## templates

TODO


