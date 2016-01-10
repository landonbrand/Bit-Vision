var c = document.getElementById("pixelSort");
var ctx = c.getContext("2d");
var src = "img/sortme.jpg";
var img;
var running = false;
var bitmapData;
var animation;

var width;
var height;

var ORIENTATION_VERTICAL = 0;
var ORIENTATION_HORIZONTAL = 1;
var orientation = ORIENTATION_VERTICAL;

var verticalIncrement = -1;
var horizontalIncrement = 0;

var ALG_ALPHABLENDED = 0;
var ALG_HARDSORT = 1;
var COMP_BRIGHTNESS = 0;
var COMP_HUE = 1;
var COMP_SATURATION = 2;

var threshold = 50;
var magnitude = 0.5;
var algorithm = ALG_ALPHABLENDED;
var comparator = COMP_BRIGHTNESS;

var counter;
var startTime;

var buf;
var buf8;
var data;

window.onload = init();

function init(){
	img = new Image();
	img.src = src;
	img.onload = imageReady;
	counter = 0;
	startTime = Date.now();
	updateThreshold();
	updateMagnitude();
	updateHorizontalIncrement();
	updateVerticalIncrement();
	initFileDrop($('html'));
}

function imageReady(){
	width = img.width;
	height = img.height;
	if(width > 1000){
		var scale = width/1000;
		width = 1000;
		height = height/scale;
	}

	//set canvas to size of image
	c.width = width;
	c.height = height;

	ctx.drawImage(img, 0, 0, width, height);
	bitmapData = ctx.getImageData(0, 0, width, height);

	//prepare ArrayBuffer and typed arrays
	buf = new ArrayBuffer(bitmapData.data.length);
	buf8 = new Uint8ClampedArray(buf);
	data = new Uint32Array(buf);
	buf8.set(bitmapData.data);

	start();
}

function reload(){
	counter = 0;
	startTime = Date.now();
	
	ctx.drawImage(img, 0, 0, width, height);
	bitmapData = ctx.getImageData(0, 0, width, height);

	//prepare ArrayBuffer and typed arrays
	buf = new ArrayBuffer(bitmapData.data.length);
	buf8 = new Uint8ClampedArray(buf);
	data = new Uint32Array(buf);
	buf8.set(bitmapData.data);
}

function save(){
	openInNewTab(c.toDataURL("image/png"))
}

	function updateThreshold(){
	//threshold = document.getElementById("thresholdSlider").value;
	threshold = parseInt(document.getElementById("thresholdSlider").value);
	document.getElementById("thresholdReadout").innerHTML = threshold;
}

function updateMagnitude(){
	magnitude = parseFloat(document.getElementById("magnitudeSlider").value);
	document.getElementById("magnitudeReadout").innerHTML = magnitude;
}

function updateHorizontalIncrement(){
	horizontalIncrement = parseInt(document.getElementById("horizontalSlider").value);
	document.getElementById("horizontalReadout").innerHTML = horizontalIncrement;
}

function updateVerticalIncrement(){
	verticalIncrement = parseInt(document.getElementById("verticalSlider").value);
	document.getElementById("verticalReadout").innerHTML = verticalIncrement;
}

function updateAlgorithm(v){
	//algorithm = document.querySelector('input[name="comparator"]:checked').value;
	//algorithm = parseInt(algorithm);
	algorithm = v;
	//alert(algorithm);
}

function updateComparator(v){
	//comparator = document.querySelector('input[name="comparator"]:checked').value;
	//comparator = parseInt(comparator);
	comparator = v;
}

function start(){
	iterate();

	//drawing functions
	bitmapData.data.set(buf8);
	ctx.putImageData(bitmapData, 0, 0);

	//counter functions for benchmark testing
	counter++;
	if(counter == 20){
		var curTime = Date.now();
		//alert(curTime - startTime);
	}

	//tell the program to run again next time it's convenient
	animation = window.requestAnimationFrame(start);
}

function iterate(){
	switch(algorithm){
		case ALG_ALPHABLENDED:
			iterateAlphaBlended();
			break;
		case ALG_HARDSORT:
			iterateHardSort();
			break;
		default:
			console.log("Error: no algorithm selected");
	}

}

function iterateAlphaBlended(){
	var curPix;
	var nexPix;
	for(var x = 0; x < width; x++){
		for(var y = 0; y < height; y++){
			curPix = getPixel(x, y);
			nexPix = getPixel(x + horizontalIncrement, y + verticalIncrement);
			//compare using compare() function
			if(compare(curPix) > compare(nexPix) + threshold){
				//blend pixels and set
				var blendedValue = blend(curPix, nexPix, magnitude);
				setPixel(x + horizontalIncrement, y + verticalIncrement, blendedValue);
				setPixel(x, y, blendedValue);
			}
		}
	}
}

function iterateHardSort(){
	var curPix;
	var nexPix;
	var startY = 0;
	var  startX = 0;
	var endY = height - verticalIncrement;
	var endX = width - horizontalIncrement;

	if(verticalIncrement < 0){
		startY = Math.abs(verticalIncrement);
	}

	if(horizontalIncrement < 0){
		startX = Math.abs(horizontalIncrement);
	}

	for(var y = 0; y < endY; y++){
		for(var x = 0; x < endX; x++){

			curPix = getPixel(x, y);
			nexPix = getPixel(x + horizontalIncrement, y + verticalIncrement);

			if(!nexPix){
				break;
			}

			if(compare(curPix) > compare(nexPix) + threshold){
				setPixel(x + horizontalIncrement, y + verticalIncrement, curPix);
				setPixel(x, y, nexPix);
			}

		}
		
	}

}

function blend(v1, v2, weight){
	var output = [0,0,0,255];
	var rgba1 = convert32to8(v1);
	var rgba2 = convert32to8(v2);
	for(var i = 0; i < 3; i++){
		output[i] = rgba1[i] * weight + rgba2[i] * (1 - weight);
	}
	return convert8to32(output);
}

function convert32to8(rgba){
	var red 	= 	rgba >>> 0	& 0xFF;
	var green 	= 	rgba >>> 8	& 0xFF;
	var blue 	= 	rgba >>> 16	& 0xFF;
	return [red, green, blue, 255];
}

function convert8to32(rgba){
	var output;
	output =
		(255		<<  24) |	//alpha
		(rgba[2] 	<<  16) |	//b
		(rgba[1] 	<< 8) |		//g
		(rgba[0]	<< 0);		//r
	return output;
}

function setPixel(x, y, rgba){
	data[y * width + x] = rgba;
}

function getPixel(x, y){
	return data[y * width + x];
}

function brightness(rgba){
	//gets brightness of pixel
	var red = 	rgba >>> 16	& 0xFF;
	var green = rgba >>> 8	& 0xFF;
	var blue = 	rgba 	 	& 0xFF;
	return (red + green + blue);
}

function hue(rgba){
	var red = 	rgba >>> 16	& 0xFF;
	var green = rgba >>> 8	& 0xFF;
	var blue = 	rgba 	 	& 0xFF;

	var min = Math.min(red, green, blue);
	var max = Math.max(red, green, blue);

	var hue = 0;

	if(max == red){
		hue = (green - blue) / (max - min);
	} else if (max == green){
		hue = 2.0 + (blue - red) / (max - min);
	} else{
		hue = 4.0 + (red - green) / (max - min);
	}

	return hue*100;
}

function saturation(rgba){
	var red = 	rgba >>> 16	& 0xFF;
	var green = rgba >>> 8	& 0xFF;
	var blue = 	rgba 	 	& 0xFF;

	var max = Math.max(red, green, blue);
	var min = Math.min(red, green, blue);

	var saturation = 0;

	if((min + max) / 2 < 0.5){
		saturation = (max - min) / (max + min);
	} else{
		saturation = (max - min) / (2.0 - max - min);
	}

	return saturation*750;
}

function compare(rgba){

	switch(comparator){
		case COMP_BRIGHTNESS:
			return brightness(rgba);
			break;
		case COMP_HUE:
			return hue(rgba);
			break;
		case COMP_SATURATION:
			return saturation(rgba);
			break;
		default:
			//alert("Error: no comparator selected");
			return;
	}
}

function grayscale(rgba){
	//returns grayscale version of color
	return [brightness(rgba)/3, brightness(rgba)/3, brightness(rgba)/3, 255];
}


//UI handlers
function printValue(sliderID, spanbox) {
    var x = document.getElementById(spanbox);
    var y = document.getElementById(sliderID);
    x.value = y.value;
}
function slideValue(sliderID, spanbox){
    var x = document.getElementById(spanbox);
    var y = document.getElementById(sliderID);
    y.value = parseInt(x.value);
}

//window.onload = function() { printValue('slide1', 'rangeValue1'); }

//keypress handler
document.onkeypress = function(evt) {
    evt = evt || window.event;
    var charCode = evt.keyCode || evt.which;
    var charStr = String.fromCharCode(charCode);

    //save image into a new tab
    if( charStr == 's'){
    	openInNewTab(c.toDataURL("image/png"));
    }

    //reload image, but keep the settings
    if( charStr == 'r'){
    	reload();
    }
};

function openInNewTab(url) {
  var win = window.open(url, '_blank');
  win.focus();
}

// Dropping occured
function fileDropped (e) {
e.originalEvent.stopPropagation();
	e.originalEvent.preventDefault();

var files = e.originalEvent.dataTransfer.files; // FileList object
if (!(files && files.length)) {
		return;
}

var reader = new FileReader();
reader.onload = function (e) {
		src = e.target.result;
		img.src = src;
		reload();
};
reader.readAsDataURL(files[0]);
}

// Prepare to allow droppings
function initFileDrop ($dropZone) {
$dropZone
  .bind('dragover', false)
  .bind('dragenter', false)
  .bind('drop', fileDropped);
}