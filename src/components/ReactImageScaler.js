import React, { createRef } from 'react';
import './ReactImageScaler.scss';

const DEBUG_BACKGROUND_COLOR = '#00000099';
const DEBUG_FONT_COLOR = '#FFFFFF';
const DEBUG_FONT_SIZE = '14';
const DEBUG_POINT_COLOR = 'red';
const DEBUG_POINT_RADIUS = 2;

export default class ReactImageScaler extends React.Component {
  constructor(props) {
    super(props);

    this.scaleImage = this.scaleImage.bind(this);
    this.redrawCanvas = this.redrawCanvas.bind(this);
    this.eraseCanvas = this.eraseCanvas.bind(this);
    this.returnData = this.returnData.bind(this);
    this.cancelCrop = this.cancelCrop.bind(this);
    this.toggleMovementMode = this.toggleMovementMode.bind(this);
    this.setPosition = this.setPosition.bind(this);
    this.renderDebug = this.renderDebug.bind(this);
    this.renderTouchPoint = this.renderTouchPoint.bind(this);
    this.clearMovementMode = this.clearMovementMode.bind(this);
    this.checkForReset = this.checkForReset.bind(this);
    this.canvasRef = createRef();
    this.scaleValueRef = createRef();
    this.scaleValueDisplay = createRef();
    this.rangeScaleRef = createRef();
    this.sourceRef = createRef();

    this.state = {
      canvasWidth: this.props.width ? this.props.width : window.innerWidth,
      canvasHeight: this.props.height ? this.props.height : window.innerHeight,
      imageSource: this.props.src ? this.props.src : null,
      backgroundColor: this.props.backgroundColor ? this.props.backgroundColor : '#FFFFFF',
      moveSpeed: this.props.moveSpeed ? this.props.moveSpeed : 10
    }
  }

  componentDidMount() {
    if (this.props.src) {
      this.rangeScaleRef.current.value = 10;
      this.scaleValueRef.current.value = 1;
      this.canvas = this.canvasRef.current;
      this.sourceCanvas = this.sourceRef.current;
      this.context = this.canvas.getContext('2d');
      this.lastDown = {x: 0, y: 0};
      this.x = 0;
      this.y = 0;
      this.scale = 1;
      this.movement = false;
      this.image = new Image();
      this.image.src = this.state.imageSource;
  
      //Initially loads the given image.
      this.image.onload = () => {
        this.drawSourceCanvas(1);
        this.redrawCanvas(1);
      }
    }
  }

  drawSourceCanvas(scale) {
    const ctx = this.sourceCanvas.getContext('2d');
    const imageWidth = this.image.width * scale;
    const imageHeight = this.image.height * scale;
    this.sourceCanvas.width = imageWidth;
    this.sourceCanvas.height = imageHeight;
    //Clear out the source image data and draw the image with a new scale :)
    ctx.clearRect(0, 0, this.state.canvasWidth, this.state.canvasHeight);
    ctx.drawImage(this.image, 0, 0, imageWidth, imageHeight);
  }

  renderNoSource() {
    return(
      <div className='scaler-no-source'>
        <span>Image source not provided.</span>
      </div>
    );
  }

  renderDebug(ctx) {
    ctx.beginPath();
    ctx.fillStyle = DEBUG_BACKGROUND_COLOR;
    ctx.resetTransform();
    ctx.rect(0, 100, 175, 124);
    ctx.fill();
    ctx.font = DEBUG_FONT_SIZE + 'px Arial';
    ctx.fillStyle = DEBUG_FONT_COLOR;
    ctx.textAlign = 'left';
    ctx.fillText('DEBUGGER', 5, 116);
    ctx.fillText('INIT DOWN: {x: '+this.lastDown.x+', y: '+this.lastDown.y+'} ', 5, 130);
    this.renderTouchPoint(ctx);
  }

  renderTouchPoint(ctx) {
    ctx.beginPath();
    ctx.arc(this.lastDown.x, this.lastDown.y, DEBUG_POINT_RADIUS, 0, 2 * Math.PI, false);
    ctx.fillStyle = DEBUG_POINT_COLOR;
    ctx.fill();
  }

  renderControls() {
    return(
      <div className='react-scaler-controls'>
        <div className='control-segment'>
          <span>SCALE   </span>
          <input type='number' ref={this.scaleValueRef} onChange={this.scaleImage}  style={{display: 'none'}}/>
          <span className='scale-percent' ref={this.scaleValueDisplay}>%100</span>
        </div>
        <div className='control-segment'>
          <input type='range' ref={this.rangeScaleRef} step={this.props.scaleStep ? this.props.scaleStep : '0.5'} min='1' max={this.props.maxScale ? this.props.maxScale * 10 : 30} onChange={this.scaleImage}/>
        </div>
        <div className='control-segment'>
          {this.props.scaleSizes && this.renderScaleSizes()}
          <button onClick={this.cancelCrop}>
            {this.props.cancelLabel ? this.props.cancelLabel : 'Cancel'}
          </button>
          <button onClick={this.returnData}>
            {this.props.applyLabel ? this.props.applyLabel : 'Apply'}
          </button>
        </div>
      </div>
    )
  }

  renderCanvas() {
    return(
      <>
        <div className='react-scaler'>
          <canvas ref={this.canvasRef} onMouseDown={this.toggleMovementMode} onMouseUp={this.clearMovementMode} onMouseLeave={this.clearMovementMode} onMouseMove={this.setPosition} width={this.state.canvasWidth} height={this.state.canvasHeight}>

          </canvas>
          <canvas style={{display: 'none'}} ref={this.sourceRef} width={this.state.canvasWidth} height={this.state.canvasHeight}>

          </canvas>
          {this.renderControls()}
        </div>
      </>
    )
  }

  renderScaleSizes() {
    return(
      <div className='control-scale-sizes'>
        <button onClick={() => {
          this.redrawCanvas(0.5)
        }}>
            {this.props.buttonMessage ? this.props.buttonMessage : '0.5X'}
        </button>
        <button onClick={() => {
          this.redrawCanvas(1)
        }}>
            {this.props.buttonMessage ? this.props.buttonMessage : '1X'}
        </button>
        <button onClick={() => {
          this.redrawCanvas(2)
        }}>
            {this.props.buttonMessage ? this.props.buttonMessage : '2X'}
        </button>
      </div>
    );
  }

  renderGrid() {
    const ctx = this.canvas.getContext('2d');
    ctx.strokeStyle = this.props.gridColor ? this.props.gridColor : '#FFFFFF';

    ctx.lineWidth = .5;
    ctx.setLineDash([5]);
    ctx.beginPath();
    ctx.moveTo(this.canvas.width / 3,0);
    ctx.lineTo(this.canvas.width / 3,this.canvas.height);
    ctx.stroke();

    ctx.setLineDash([5]);
    ctx.beginPath();
    ctx.strokeStyle = this.props.gridColor ? this.props.gridColor : '#FFFFFF';
    ctx.moveTo((this.canvas.width / 3) * 2, 0);
    ctx.lineTo((this.canvas.width / 3) * 2, this.canvas.height);
    ctx.stroke();
  }

  render() {
    return this.state.imageSource ? this.renderCanvas() : this.renderNoSource();
  }

  scaleImage(event) {
    this.scale = event.target.value / 10;
    this.checkForReset();
    this.redrawCanvas(this.scale);
  }

  redrawCanvas(scale) {
    this.scale = scale;
    console.warn(scale);
    this.rangeScaleRef.current.value = scale;
    this.scaleValueRef.current.value = scale;
    this.scaleValueDisplay.current.innerText = ' % ' + Math.floor(scale * 100);
    this.drawSourceCanvas(scale);
    const ctx = this.canvas.getContext('2d');
    this.eraseCanvas(ctx);

    const imageWidth = this.image.width * scale;
    const imageHeight = this.image.height * scale;
    ctx.drawImage(this.image, ((this.state.canvasWidth - imageWidth) / 2) + this.x, 
    ((this.state.canvasHeight - imageHeight) / 2) + this.y, imageWidth, imageHeight);
    this.props.displayResolution && this.renderResolution(ctx, imageWidth, imageHeight);
    this.props.renderDebug && this.renderDebug(ctx);
    this.props.drawGrid && this.renderGrid();
  }

  eraseCanvas(ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.state.backgroundColor;
    ctx.resetTransform();
    ctx.rect(0, 0, this.state.canvasWidth, this.state.canvasHeight);
    ctx.fill();
  }

  renderResolution(ctx, width, height) {
    ctx.beginPath();
    ctx.fillStyle = DEBUG_BACKGROUND_COLOR;
    ctx.resetTransform();
    ctx.rect(0, 0, 90,24);
    ctx.fill();
    ctx.font = DEBUG_FONT_SIZE + 'px Arial';
    ctx.fillStyle = DEBUG_FONT_COLOR;
    ctx.textAlign = 'center';
    ctx.fillText(Math.floor(width) + ' X ' + Math.floor(height), 45, 16);
  }

  returnData() {
    if(this.props.onScaleApply && typeof this.props.onScaleApply == 'function') {
      this.props.onScaleApply(this.processImageData());
    }
    return null;
  }

  cancelCrop() {
    if(this.props.onCancel && typeof this.props.onCancel == 'function') {
      this.props.onCancel();
    }
    return null;
  }

  toggleMovementMode(event) {
    //Determine if the image is smaller than the frame whether
    //that be the width or the height, if so disable moving;
    const width = this.image.width * this.scale > this.state.canvasWidth;
    const height = this.image.height * this.scale > this.state.canvasHeight;

    if (width || height) {
      this.movement = true;
      document.body.style.cursor = 'move';
      const bounding = event.target.getBoundingClientRect();
      this.lastDown = {x: event.clientX - bounding.left, y: event.clientY - bounding.top};
      this.redrawCanvas(this.scale);
    }
  }

  clearMovementMode() {
    document.body.style.cursor = 'default';
    this.movement = false;
    this.lastDown = {
      x: 0,
      y: 0
    };
    this.redrawCanvas(this.scale);
  }

  setPosition(event) {
    if (this.movement) {
      const bounding = event.target.getBoundingClientRect();
      const point = {
        x: event.clientX - bounding.left,
        y: event.clientY - bounding.top
      };

      if (point.x > this.lastDown.x) {
        this.x += Math.abs(this.lastDown.x - point.x);
      } else {
        this.x -= Math.abs(this.lastDown.x - point.x);
      }

      if (point.y > this.lastDown.y) {
        this.y += Math.abs(this.lastDown.y - point.y);
      } else {
        this.y -= Math.abs(this.lastDown.y - point.y);
      }

      this.lastDown = point;
      this.redrawCanvas(this.scale);
    }
  }

  //Checks the size of the scaled image, if the height or width are lower than that of the canvas's 
  //then set the position of the image to 0,0
  checkForReset() {
    const width = this.image.width * this.scale < this.state.canvasWidth;
    const height = this.image.height * this.scale < this.state.canvasHeight;

    if(width || height) {
      this.x = 0;
      this.y = 0;
    }
  }

  //Based on the size of the canvas and the image, we want to determine if we should crop down the image when
  //we process it.
  determineCrop(source, scale) {

    // Get the scale of the current image.
    const imageWidth = (this.image.width * scale) + this.x;
    const imageHeight = (this.image.height * scale) + this.y;

    const shouldCropWidth = imageWidth < this.canvas.width;
    const shouldCropHeight = imageHeight < this.canvas.height;
    //Crop the scaled image.
    const data = source.getImageData(shouldCropWidth ? ((this.sourceCanvas.width - imageWidth) / 2) + this.x : 0, shouldCropHeight ? ((this.sourceCanvas.height - imageHeight) / 2) + this.y : 0,  imageWidth, imageHeight);
    //Set the canvas to the cropped with and height if needed to be cropped
    shouldCropWidth && (this.sourceCanvas.width = imageWidth);
    shouldCropHeight && (this.sourceCanvas.height = imageHeight);

    return data;
  }

  async processImageData() {
    const scale = this.scaleValueRef.current.value;
    const ctx = this.canvas.getContext('2d');
    const sourceCtx = this.sourceCanvas.getContext('2d');
    const sourceData = sourceCtx.getImageData(0, 0, this.state.canvasWidth, this.state.canvasHeight);

    sourceCtx.putImageData(sourceData, 0, 0);
    const cropped = this.determineCrop(sourceCtx, scale);
    sourceCtx.putImageData(cropped, 0, 0);
    const url = await this.sourceCanvas.toDataURL();
    // Reset the canvas to the enter size so we can grab the image
    this.sourceCanvas.width = this.state.canvasWidth;
    this.sourceCanvas.height = this.state.canvasHeight;

    return url;
  }
}