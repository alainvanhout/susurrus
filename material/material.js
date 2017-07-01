
dom.using('button');

var Material = {};

Material.button = function() {
	var button = dom.button.apply(dom.button, arguments);
	button.add({class: "mdl-button mdl-js-button mdl-button--fab"});
	return button;
};

Material.buttonColored = function() {
	var button = Material.button.apply(dom.button, arguments);
	button.add({$class: "mdl-button--colored"});
	return button;
};


(function() {

	load("iconButton", "material/icon-button.html", "material--icon-button");
	load("chipWithIcon", "material/chip-with-icon.html", "material--chip-with-icon");
	load("card", "material/card.html", "material--card");
	
	function load(name, templateUrl, alias){
		loader
			.loadTemplate(templateUrl)
			.perform(function() {
				Material[name] = function(input) {
					return templates.get(templateUrl, input);
				};
			}).as(alias);
	}
})();
