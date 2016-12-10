console.log('Lorum ipsum js file was loaded');

loader
	.load("my-alias")
	.perform(function(){
		var result = loader.resultFor("my-alias");
		console.log("inside my alias performer", result);
	});
