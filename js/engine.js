

var requestAnimFrame = 
    window.requestAnimFrame || 
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function(callback, element) { setTimeout(callback, 1000/60); };

$(document).ready(init)

function init() {
    $('#viewport').css({'height':window.innerHeight+'px', 'width':window.innerWidth+'px'});
}