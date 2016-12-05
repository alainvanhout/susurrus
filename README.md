# susurrus

A small, simple, magicless and buildstepless vanilla js framework for components that are to be loaded asynchronously (do note that it still a work in progress).

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

TODO

## templates

TODO


