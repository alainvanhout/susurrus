dom.using('button', 'i');

var Material = {};

(function() {

	function toArray(list) {
		return [].slice.apply(list);
	}
	
	function extend(buttonFn, args, $class) {
		var button = buttonFn.apply(this, toArray(args));
		button.add({$class: $class});
		return button;
	}
	
	function addMethod(button, methodName, $class) {
		button[methodName] = function(){
			button.add({$class: $class});
			button.add(toArray(arguments));
			return button;
		};
	}

	Material.button = function() {
		var button = extend(dom.button, arguments, "mdl-button mdl-js-button");
		
		addMethod(button, "fab", "mdl-button--fab");
		addMethod(button, "miniFab", "mdl-button--fab mdl-button--mini-fab");
		addMethod(button, "colored", "mdl-button--colored");
		addMethod(button, "ripple", "mdl-js-ripple-effect");
		addMethod(button, "raised", "mdl-button--raised");
		
		button.icon = function(iconName) {
			var icon = button.i({$class: "material-icons"});
			icon.add(iconName);
			return button;
		};
		
		return button;
	};

	load("iconButton", "material/icon-button.html", "material--icon-button");
	load("chipWithIcon", "material/chip-with-icon.html", "material--chip-with-icon");
	load("card", "material/card.html", "material--card");
	load("dialog", "material/dialog.html", "material--dialog", function(dialog){
		dialog.style.zIndex = 10000;
	});
	
	function load(name, templateUrl, alias, fn){
		loader
			.loadTemplate(templateUrl)
			.perform(function() {
				Material[name] = function(input) {
					var result = templates.get(templateUrl, input);
					if (fn){
						fn(result);
					}
					return result;
				};
			}).as(alias);
	}
})();
