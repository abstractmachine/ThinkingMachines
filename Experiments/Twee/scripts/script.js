var twee, twee_div;

function start() {

	startSound();
	document.getElementById("start").style.display = "none";

	twee = document.getElementById("twee_frame").contentWindow;
	twee_div = document.getElementById("twee_div");
	
	twee_div.style.display = "block";

	var frog = twee.getVariable('frog');

	console.log(frog);

}
