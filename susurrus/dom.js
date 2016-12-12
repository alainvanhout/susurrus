var dom = function() {
	var factories = [];
	var factoryMap = {};

	function any(x, fn) {
		if (Array.isArray(x)) {
			return x.map(fn);
		} else {
			return fn(x);
		}
	};

	var util = {
		bundleArguments : function(parent, params) {
			var input = {};
			if (parent != dom) {
				input.parent = parent;
			}
			if (params) {
				[].slice.call(params).forEach(function(param) {
					if ( typeof param === 'object' && param.tagName) {
						input.children = param;
					} else if (!input.children && (Array.isArray(param) || typeof param !== 'object' )) {
						input.children = param;
					} else if (!input.modifier && ( typeof param === 'string' || typeof param === 'function')) {
						input.modifier = param;
					} else if (!input.props && typeof param === 'object') {
						input.props = param;
					} else if ( typeof param !== 'undefined') {
						console.error("failed to interpret param: " + param);
					}
				});
			}
			return input;
		},
		add : function(input) {
			var parent = input.parent;
			var children = input.children;
			var modifier = input.modifier;
			var props = input.props;
			if (modifier) {
				children = this.modify(children, modifier);
			}
			if (props) {
				var keys = Object.keys(props);
				keys.forEach(function(key) {
					if (key === '$class'){
						if (parent.classList){
							parent.classList.add(props[key]);
						} else {
							parent.className += ' ' + props[key];
						}
					} else {
						parent.setAttribute(key, props[key]);
					}
				});
			}
			if (children != null || modifier) {
				any(children, function(child) {
					if (child && child.tagName) {
						child = dom(child);
					}
					util.append(parent, child);
				});
				children.and = parent;
			}
			return children;
		},
		append : function(parent, child){
			if (typeof child === 'object' && child.tagName){
				parent.appendChild(child);
			} else if (typeof child === 'string' || typeof child === 'number') {
				parent.innerHTML += child;
			} else {
				throw Error('Unable to append child of type' + (typeof child));
			}
		},
		empty : function(input) {
			input.parent.innerHTML = null;
		},
		modify : function(items, modifier) {
			if ( typeof modifier === 'function') {
				return any(items, function(item) {
					return modifier(item);
				});
			}
			if ( typeof modifier === 'string') {
				return item[modifier];
			}
			console.error("Modifier is neither function nor string", modifier);
		}
	};

	var extensions = {
		add : function() {
			util.add(util.bundleArguments(this, arguments));
		},
		empty : function() {
			util.empty({
				parent : this
			});
		},
		update : function(element) {
			this.empty();
			this.add.apply(this, arguments);
		}
	};

	var factories = {
		// generic factory
		element : function(tagName) {
			addFactory(tagName);
			return factories[tagName];
		}
	};

	function addFactory(tagName) {
		// only add a factory the first time
		if (!factories[tagName]) {
			factories[tagName] = function() {
				var element = dom(document.createElement(tagName));
				util.add(util.bundleArguments(element, arguments));
				if (this != null && this.add) {
					this.add(element);
				}
				return element;
			};
			factoryKeys = Object.keys(factories);
		}
	};

	function basicExtend(element) {
		extensionKeys.forEach(function(key) {
			element[key] = extensions[key];
		});
	}

	function factoryExtend(element) {
		factoryKeys.forEach(function(key) {
			element[key] = factories[key];
		});
	}

	function extend(element) {
		if (!element.tagName){
		    console.warn("Element does not have a tagName: ", element);
		}
		basicExtend(element);
		factoryExtend(element);
		return element;
	}

	var extensionKeys = Object.keys(extensions);
	var factoryKeys = [];

	var dom = function(element) {
		return extend(element);
	};

	dom.using = function() {
		[].forEach.call(arguments, function(tagName) {
			addFactory(tagName);
		});
		factoryExtend(dom);
	};

	return dom;
}();
