// envelope animation
var firstRun = true;
window.onload = function(){
  var tl = new TimelineLite({delay: 1}),
    firstBg = document.querySelectorAll('.text__first-bg'),
    secBg = document.querySelectorAll('.text__second-bg'),
    word  = document.querySelectorAll('.text__word');
	
	function animate() {
	if(firstRun){firstRun = false;}
	else{
		tl
		.to(word, 0.1, {opacity:0}, "-=0.1")  
	}
	tl
	.to(firstBg, 0.2, {scaleX:1})
	.to(secBg, 0.2, {scaleX:1})
	.to(word, 0.1, {opacity:1}, "-=0.1")  
	.to(firstBg, 0.2, {scaleX:0})
	.to(secBg, 0.2, {scaleX:0});

	setTimeout(animate,6000);
	}
	animate();
}