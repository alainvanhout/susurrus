loader
	.loadJS("test/testjs.js")
	.loadCSS("test/testcss.css")
	.loadText("test/testtext.html")
	.loadTemplate("testing", "test/testtext.html")
	.perform(function(){
		dom.using('p', 'img');
		
		var section = templates.get("testing");
		section._title.update("my title");
		section._contents.img({src : "test/spinner.gif"});
		document.body.appendChild(section);
		
		// enabling the following line would already start loading the css, as a matter of non-blocking pre-loading 
		// loader.loadCSS("test/lorem/loremipsum.css");
		
		setTimeout(function(){
			loader
				// enabling the following line avoid having to read the css dependency from the html dependency
				//.loadTemplate("lorem", "test/lorem/loremipsum.css")
				.loadTemplate("lorem", "test/lorem/loremipsum.html")
				.perform(function(){
					section._contents.update(templates.get("lorem"));
				});
		}, 100);
	});

