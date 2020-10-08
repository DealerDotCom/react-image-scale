## Description
Simple HTML5 canvas based component used for scaling images.  Returns base64 encoded data of edited file.

## Props
* width - int - Width in pixels of the canvas. (Defaults to width of container)
* hegiht - int - Height in pixels of the. (Defaults to hieght of container)
* maxScale - int - Maxium size the image can be scaled up to.
* src - string - URL/Base64 source for the image being scaled.
* backgroundColor - string - Color of the canvas background visible when the image is scaled down.
* onScaleApply - method - Method that is run once clicking the apply button, base64 encoded value of the canvas content returned as parameter
* displayResolution - bool - Show the scaled resolution in pixels at top right.