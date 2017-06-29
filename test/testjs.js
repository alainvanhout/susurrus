loader
	.loadText("test/testtext.html")
	.perform(function(){
		return "foobar";
	}).as("my-alias");
