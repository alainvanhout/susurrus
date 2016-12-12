var templates = function(){
	var manager = {};
	var registry = {};

	manager.add = function(key, input){
		if (typeof input === 'string') {
			return this.addAsText(key, input);
		}
		if (typeof input == 'object' && input.tagName) {
			return this.addAsFragment(key, input);
		}
		
		throw Error('Cannot process input of type ' + (typeof input));
	};

	manager.addAsText = function(key, text){
		var container = document.createElement('div');
		container.innerHTML = text;
		return this.addAsFragment(key, container);
	};
	
	manager.addAsFragment = function(key, fragmentNode){
		var tempRoots = fragmentNode.querySelectorAll('[temp-root]');
		if (tempRoots.length === 0){
			return this.addAsRoot(key, fragmentNode);
		} else if (tempRoots.length === 1) {
			var template = this.addAsRoot(key, tempRoots[0]);
			
			// load declared css dependencies
			var tempCss = fragmentNode.querySelectorAll('link[temp-source]');
			[].forEach.call(tempCss, function(link){
				var sourceUrl = link.getAttribute("temp-source");
				loader.loadCSS(sourceUrl);
				template.sources.push(loader.findSource(sourceUrl));
			});
			
			// load declared js dependencies
			var tempJs = fragmentNode.querySelectorAll('script[temp-source]');
			[].forEach.call(tempJs, function(script){
				var sourceUrl = script.getAttribute("temp-source");
				loader.loadJS(sourceUrl);
				template.sources.push(loader.findSource(sourceUrl));
			});
			
			return template;
		} else {
			throw Error('Cannot add fragmentNode with multiple template roots: ' + fragmentNode);
		}
	};
	
	manager.addAsRoot = function(key, root){
		registry[key] = {
			key : key,
			template : root,
			sources : []
		};
		return registry[key];
	};
	
	manager.get = function(key){
		if (!registry[key]){
			throw Error("Cannot find template for key " + key);
		}
		
		var instance = registry[key].template.cloneNode(true);
		instance.api = {};
		
		var tempRefs = instance.querySelectorAll('[temp-ref]');
		[].forEach.call(tempRefs, function(node){
			var refId = node.getAttribute('temp-ref');
			instance['_' + refId] = dom(node);
		});
		
		return dom(instance);
	};

	return manager;
}();