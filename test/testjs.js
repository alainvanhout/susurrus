loader
	.loadText("test/testtext.html")
	.perform("my-alias", function(){
		return "foobar";
	});
