dom.using('p', 'img', 'small', 'div');

loader
	.using("material--icon-button")
	.using("material--chip-with-icon")
	.using("material--card")
	.perform(function(){

		function Spinner(){
			return dom.img({src : "img/spinner.gif"});
		}

		function Waiter(element){
			return dom.div(Spinner());
		}
		
		function Performer(input) {
			var container = dom.div(input.subject);
			var spinner = input.spinner || Spinner();
			
			input.subject.add({
				$click : function() {
					container.update(spinner);
					input.action && input.action.apply(container);
				}
			});
			
			container.reset = function(){
				container.update(input.subject);
			};
			
			return container;
		}
		
		function Placeholder(){
			var placeholder = Material.chipWithIcon({
				text : "foobar",
				icon : "mood"
			});
			var container = dom.div(placeholder);
			
			placeholder._button.add({ 
				$click : function() {
					placeholder._button.update(Spinner());
					setTimeout(function(){
						loader
							.loadTemplate("lorem", "lorem/loremipsum.html")
							.perform(function(){
								container.update(templates.get("lorem"));
							});
					}, 500);
				}
			});
				
			return container;
		}

		var contentButton = Performer({
			subject : Material.iconButton("share"),
			action : function(){
				var self = this;
				setTimeout(function(){
					alert("foo");
					self.reset();
				}, 650);
			}
		});
		
		var waiter = Waiter();
		
		setTimeout(function(){
			waiter.update("Waited for 2 seconds");
		}, 2000);
		
		document.body.appendChild(Material.card({
			title : ["Hello world", dom.small("foobar")],
			content : [Placeholder(), waiter],
			actions : contentButton
		}));
	});