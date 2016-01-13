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
var redMagnitude = 0.5;
var greenMagnitude = 0.5;
var blueMagnitude = 0.5;

var ALG_ALPHABLENDED = 0;
var ALG_HARDSORT = 1;
var ALG_RGBBLENDED = 2;
var ALG_REDSWAP = 3;
var ALG_GREENSWAP = 4;
var ALG_BLUESWAP = 5;
var COMP_BRIGHTNESS = 0;
var COMP_HUE = 1;
var COMP_SATURATION = 2;
var COMP_COLOR = 3;

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
	updateRGB();
	updateAlgorithm(ALG_ALPHABLENDED);
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

function updateRGB(){
	redMagnitude = parseFloat(document.getElementById("redSlider").value);
	document.getElementById("redReadout").innerHTML = redMagnitude;

	greenMagnitude = parseFloat(document.getElementById("greenSlider").value);
	document.getElementById("greenReadout").innerHTML = greenMagnitude;

	blueMagnitude = parseFloat(document.getElementById("blueSlider").value);
	document.getElementById("blueReadout").innerHTML = blueMagnitude;
}

function updateAlgorithm(v){
	//algorithm = document.querySelector('input[name="comparator"]:checked').value;
	//algorithm = parseInt(algorithm);
	algorithm = v;

	switch(algorithm){
		case ALG_ALPHABLENDED:
			showElement("threshold");
			showElement("magnitude");
			showElement("verticalIncrement");
			showElement("horizontalIncrement");
			hideElement("redMagnitude");
			hideElement("blueMagnitude");
			hideElement("greenMagnitude");
			break;
		case ALG_HARDSORT:
		case ALG_REDSWAP:
		case ALG_GREENSWAP:
		case ALG_BLUESWAP:
			showElement("threshold");
			hideElement("magnitude");
			showElement("verticalIncrement");
			showElement("horizontalIncrement");
			hideElement("redMagnitude");
			hideElement("blueMagnitude");
			hideElement("greenMagnitude");
			break;
		case ALG_RGBBLENDED:
			showElement("threshold");
			hideElement("magnitude");
			showElement("verticalIncrement");
			showElement("horizontalIncrement");
			showElement("redMagnitude");
			showElement("blueMagnitude");
			showElement("greenMagnitude");
			break;
		case ALG_RGBBLENDED:
			showElement("threshold");
			hideElement("magnitude");
			showElement("verticalIncrement");
			showElement("horizontalIncrement");
			showElement("redMagnitude");
			showElement("blueMagnitude");
			showElement("greenMagnitude");
			break;


		default:
			break;

	}
	//alert(algorithm);
}

function showElement(element){
	var el = document.getElementById(element);
	el.style.display = "inline-block";
	setTimeout(function() {el.style.maxHeight = 50;}, 10);
	setTimeout(function() {el.style.opacity = 1}, 500);
}

function hideElement(element){
	var el = document.getElementById(element);
	el.style.opacity = 0;
	el.style.maxHeight = 0;
	setTimeout(function() {el.style.display = "none"}, 1000);
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
		case ALG_RGBBLENDED:
			iterateRGBBlended();
			break;
		case ALG_REDSWAP:
			iterateRedChannelSort();
			break;
		case ALG_GREENSWAP:
			iterateGreenChannelSort();
			break;
		case ALG_BLUESWAP:
			iterateBlueChannelSort();
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

function iterateRGBBlended(){
	var curPix;
	var nexPix;
	for(var x = 0; x < width; x++){
		for(var y = 0; y < height; y++){
			curPix = getPixel(x, y);
			nexPix = getPixel(x + horizontalIncrement, y + verticalIncrement);
			//compare using compare() function
			if(compare(curPix) > compare(nexPix) + threshold){
				//blend pixels and set
				var blendedValue = blendRGB(curPix, nexPix, redMagnitude, greenMagnitude, blueMagnitude);
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

function iterateRedChannelSort(){
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
				setRed(x + horizontalIncrement, y + verticalIncrement, curPix, getRed(nexPix));
				setRed(x, y, nexPix, getRed(curPix));
			}

		}
		
	}

}

function iterateGreenChannelSort(){
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
				setGreen(x + horizontalIncrement, y + verticalIncrement, curPix, getGreen(nexPix));
				setGreen(x, y, nexPix, getGreen(curPix));
			}

		}
		
	}

}

function iterateBlueChannelSort(){
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
				setBlue(x + horizontalIncrement, y + verticalIncrement, curPix, getBlue(nexPix));
				setBlue(x, y, nexPix, getBlue(curPix));
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

function blendRGB(v1, v2, rWeight, gWeight, bWeight){
	var output = [0,0,0,255];
	var rgba1 = convert32to8(v1);
	var rgba2 = convert32to8(v2);
	output[0] = rgba1[0] * rWeight + rgba2[0] * (1 - rWeight);
	output[1] = rgba1[1] * gWeight + rgba2[1] * (1 - gWeight);
	output[2] = rgba1[2] * bWeight + rgba2[2] * (1 - bWeight);
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

function getRed(rgba){
	var red = rgba >>> 0 & 0xFF;
	return red;
}

function getGreen(rgba){
	var green = rgba >>> 8 & 0xFF;
	return green;
}

function getBlue(rgba){
	var blue = rgba >>> 16 & 0xFF;
	return blue;
}

function setRed(x, y, rgba, red){
	rgba = convert32to8(rgba);
	rgba[0] = red;
	rgba = convert8to32(rgba);
	data[y * width + x] = rgba;
}

function setGreen(x, y, rgba, green){
	rgba = convert32to8(rgba);
	rgba[1] = green;
	rgba = convert8to32(rgba);
	data[y * width + x] = rgba;
}

function setBlue(x, y, rgba, blue){
	rgba = convert32to8(rgba);
	rgba[2] = blue;
	rgba = convert8to32(rgba);
	data[y * width + x] = rgba;
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

function color(rgba){
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

	var hue = 0;

	if(max == red){
		hue = (green - blue) / (max - min);
	} else if (max == green){
		hue = 2.0 + (blue - red) / (max - min);
	} else{
		hue = 4.0 + (red - green) / (max - min);
	}

	return hue*saturation*750;
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
		case COMP_COLOR:
			return color(rgba);
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