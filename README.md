## Description
Simple HTML5 canvas based component used for scaling images.  Returns base64 encoded data of edited file.

## Props
* __width__ - int - Width in pixels of the canvas. (Defaults to width of container)
* __hegiht__ - int - Height in pixels of the. (Defaults to hieght of container)
* __maxScale__ - int - Maxium size the image can be scaled up to.
* __src__ - string - URL/Base64 source for the image being scaled.
* __backgroundColor__ - string - Color of the canvas background visible when the image is scaled down.
* __onScaleApply__ - method - Method that is run once clicking the apply button, base64 encoded value of the canvas content returned as parameter
* __displayResolution__ - bool - Show the scaled resolution in pixels at top right.