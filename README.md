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

The loading of these files will occur asynchronously, and as concurrently as the browser in question allows. It is important to note that in the descriptions above, the term 'ensures' reflects the fact that `loader` will make sure that a given file is loaded at least once, and ideally no more than once (that is, based on any calls that are made to `loader` methods -- i.e. as far as it's under the control of `loader`).

The above chaining also allows for the following method, which itself however does not allow further chaining
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

The API of `templates` object consists of a number of methods which will accept html, either as text or a DOM node (see below), and will turn it into a template for which instances can be requested via `templates.get(templateKey)`. The template should have a single root node and can (but need not) contain elements with a `temp-ref` attribute, the values of which should be unique within each template.

```html
<div>
  <div class='some-css-class'>
	  <h2 temp-ref="title"></h2>
  </div>  
	<div class='divider'/>
  <div class='wrapper-css'>
    <div temp-ref="contents"></div>
</div>
```
The template instance that is returned will expose these temp-ref elements via fields that are prefixed by an underscore. Note that these DOM elements will have already been extended using `dom`.

```javascript
dom.using('p');

var section = templates.get('my-section');

section._title.update('my title');
section._contents.p('the contents of my section');
```

Adding templates can be done manually via the method below, but the easiest usage is via `loader.loadTemplate(templateKey, someUrl)`.

__addAsRoot(templateKey, rootNode)__

> This method takes a html node with possible children as treats it as the root of the template. When requesting an instance of the template, the root node is copied.

__addAsFragmentfunction(templateKey, fragmentNode)__

> When the fragmentNode contains a single element that has `temp-root`as an attribute, then that node will be seen as the template root and will be passed on to addAsRoot. When no such element exists, the fragmentNode is taken as the root node. When more than one node has `temp-root`as an attribute, an error is thrown.

__addAsText(templateKey, text)__

> This method will parse the text to html and pass it on to the the `addAsFragmentfunction` method.

__add(templateKey, value)__

> This method will pass the passed value on to the relevant method among the ones described above.

Using the `temp-root` approach, it's possible to create a template html file which itself is valid html, and which contains references to the necessary JavaScript and CSS files for it to be rendered correctly. When using `loader.loadTemplate(templateKey, someUrl)`, these will on-the-fly be added to the dependencies of the template-to-be-loaded, in such a way that the template will only be interpreted as as loaded once those dependencies are also done loading. To make the dependencies work both as part of the template and as part of the valid html file, the script and link elements also contain `temp-source` attributes besides their src and href attributes. 

In the example below, note that 'mock-only.js' does not have a `temp-source` attribute. This means it _will_ be performed as part of the template html file (which enables it to e.g. add mock values), but will not be loaded as a dependency of the template as used by `loader` and `templates`.

```html
<!doctype html>
<html lang="en">
	<head>
	  <meta charset="utf-8">
	  <title>template example</title>
	  <script src="mock-only.js" ></script>
	  <script src="example.js" temp-source="static/example/example.js"></script>
	  <link href="example.css" type="text/css" rel="stylesheet" temp-source="static/example/example.css" >
	</head>
	<body>
    <div temp-root>
      <div class='some-css-class'>
        <h2 temp-ref="title"></h2>
      </div>  
      <div class='divider'/>
      <div class='wrapper-css'>
        <div temp-ref="contents"></div>
      </div>
    </div>
	</body>
</html>
```
