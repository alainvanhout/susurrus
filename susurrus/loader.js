var loader = function() {

	dom.using('link', 'script');

	var sources = [];

	function Source(sourceUrl) {
		this.url = sourceUrl;
		this.loaded = false;
		this.responses = [];
	}

	Source.prototype = {
		addResponse : function(response) {
			response.sources.push(this);
			this.responses.push(response);
		},
		setToLoaded : function() {
			this.loaded = true;
			this.run();
		},
		run : function() {
			if (this.loaded) {
				this.responses.forEach(function(response) {
					response.run();
				});
				this.responses = [];
			}
		}
	};

	function Response() {
		this.callbacks = [];
		this.sources = [];
	}

	Response.prototype = {
		run : function() {
			var allSourcesLoaded = this.sources.reduce(function(value, source) {
				return value && source.loaded;
			}, true);

			if (allSourcesLoaded) {
				this.callbacks.forEach(function(callback) {
					callback();
				});
				if (typeof this.primary === 'function'){
					this.result = this.primary();
				}
				return this.result;
			}
		},
		perform : function(fn) {
			var response = this;
			this.primary = function(){
				var result = null;
				if (fn !== null){
					result = fn();
				}
				if (response.alias){
					var source = findSource(response.alias);
					if (!source) {
						source = new Source(response.alias);
						sources.push(source);
					}
					source.result = result;
					source.setToLoaded();
				}
			};
			return {
				as : function(alias){
					response.alias = alias;
				}
			};
		},
		loadJS : function(sourceUrl) {
			return loadJS(sourceUrl, this);
		},
		loadCSS : function(sourceUrl) {
			return loadCSS(sourceUrl, this);
		},
		loadText : function(sourceUrl) {
			return loadText(sourceUrl, this);
		},
		loadTemplate : function(templateKey, sourceUrl) {
			return loadTemplate(templateKey, sourceUrl, this);
		},
		load : function(sourceUrl) {
			return loadAlias(sourceUrl, this);
		}
	};

	function findSource(sourceUrl) {
		var filtered = sources.filter(function(source) {
			return sourceUrl === source.url;
		});
		return filtered.length > 0 ? filtered[0] : null;
	}

	function textFor(sourceUrl) {
		var source = findSource(sourceUrl);
		if (source === null) {
			throw Error("Could not find source for url", sourceUrl);
		}
		return source.text;
	}

	function resultFor(sourceUrl) {
		var source = findSource(sourceUrl);
		if (source === null) {
			throw Error("Could not find source for url", sourceUrl);
		}
		return source.result || source.text;
	}


	function addLoadListener(element, source) {
		element.addEventListener('load', function() {
			setTimeout(function() {
				source.setToLoaded();
			});
		});
	}

	function load(sourceUrl, response, init, onSuccess) {
		if (sourceUrl == null) {
			throw Error("Source url should not be null");
		}

		if (!response) {
			response = new Response();
		}

		var source = findSource(sourceUrl);

		if (!source) {
			source = new Source(sourceUrl);
			sources.push(source);

			init(source, response);
		}

		if (onSuccess) {
			response.callbacks.push(function() {
				onSuccess(source);
			});
		}

		setTimeout(function() {
			source.run();
		});

		source.addResponse(response);
		return response;
	}

	function loadJS(sourceUrl, response) {
		return load(sourceUrl, response, function(source) {
			var e = dom.script({
				src : sourceUrl,
				async : "async",
				type : "application/javascript"
			});

			addLoadListener(e, source);
			document.head.appendChild(e);
		});
	};

	function loadAlias(sourceUrl, response) {
		return load(sourceUrl, response, function(){});
	};

	function loadCSS(sourceUrl, response) {
		return load(sourceUrl, response, function(source) {
			var e = dom.link({
				href : source.url,
				type : "text/css",
				rel : "stylesheet"
			});

			addLoadListener(e, source);
			document.head.appendChild(e);
		});
	}

	function xhr(source, onSuccess){
		var xhr = new XMLHttpRequest();
		xhr.open('GET', source.url);
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4) {
				source.text = xhr.responseText;
				if (onSuccess){
					onSuccess(source);
				}
			}
		};
		xhr.send();
	}

	function loadText(sourceUrl, response) {
		return load(sourceUrl, response, function(source) {
			setTimeout(function() {
				xhr(source, function(){
					source.setToLoaded();
				});
			});
		});
	}

	function loadTemplate(templateKey, sourceUrl, response) {
		return load(sourceUrl, response, function(source, response) {
			setTimeout(function() {
				xhr(source, function(source) {
					var template = templates.add(templateKey, source.text);
					if (template.sources.length > 0){
						template.sources.forEach(function(templateSource){
							// create mutual link, to ensure that response is only performed after additional source has been loaded
							// and that the additional source also nudges the response to re-evaluate its state (and possibly be ready to perform)
							response.sources.push(templateSource);
							templateSource.responses.push(response);
						});
					}
					// only set to loaded when the potential other source dependencies have been added
					source.setToLoaded();
				});
			});
		}, function(source){
			templates.add(templateKey, source.text);
		});
	}

	return {
		loadJS : loadJS,
		loadCSS : loadCSS,
		loadText : loadText,
		loadTemplate : loadTemplate,
		load : loadAlias,
		textFor : textFor,
		get : resultFor,
		sources : sources,
		findSource : findSource
	};
}();
