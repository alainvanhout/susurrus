console.log('Lorum ipsum js file was loaded');

loader
	.load("my-alias")
	.perform(function(){
		var result = loader.get("my-alias");
		console.log("inside my alias performer", result);
	});
