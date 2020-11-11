import React, { createRef } from 'react';
import './ReactImageScaler.scss';

export default class ReactImageScaler extends React.Component {
  constructor(props) {
    super(props);

    this.scaleImage = this.scaleImage.bind(this);
    this.redrawCanvas = this.redrawCanvas.bind(this);
    this.eraseCanvas = this.eraseCanvas.bind(this);
    this.returnData = this.returnData.bind(this);
    this.cancelCrop = this.cancelCrop.bind(this);
    this.canvasRef = createRef();
    this.scaleValueRef = createRef();
    this.rangeScaleRef = createRef();
    this.sourceRef = createRef();

    this.state = {
      canvasWidth: this.props.width ? this.props.width : window.innerWidth,
      canvasHeight: this.props.height ? this.props.height : window.innerHeight,
      imageSource: this.props.src ? this.props.src : null,
      backgroundColor: this.props.backgroundColor ? this.props.backgroundColor : '#FFFFFF'
    }
  }

  componentDidMount() {
    if (this.props.src) {
      this.rangeScaleRef.current.value = 10;
      this.scaleValueRef.current.value = 1;
      this.canvas = this.canvasRef.current;
      this.sourceCanvas = this.sourceRef.current;
      this.context = this.canvas.getContext('2d');
    
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
    //Clear out the source image data and draw the image with a new scale :)
    ctx.clearRect(0, 0, this.state.canvasWidth, this.state.canvasHeight);
    ctx.drawImage(this.image, (this.state.canvasWidth - imageWidth) / 2, (this.state.canvasHeight - imageHeight) / 2, imageWidth, imageHeight);
  }

  renderNoSource() {
    return(
      <div className='scaler-no-source'>
        <span>Image source not provided.</span>
      </div>
    );
  }

  renderControls() {
    return(
      <div className='react-scaler-controls'>
        <div className='control-segment'>
          <span>SCALE   </span>
          <input type='number' ref={this.scaleValueRef} onChange={this.scaleImage}/>
        </div>
        <div className='control-segment'>
          <input type='range' ref={this.rangeScaleRef} step={this.props.scaleStep ? this.props.scaleStep : '0.5'} min='1' max={this.props.maxScale ? this.props.maxScale * 10 : 30} onChange={this.scaleImage}/>
        </div>
        <div className='control-segment'>
          {this.renderScaleSizes()}
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
          <canvas ref={this.canvasRef} width={this.state.canvasWidth} height={this.state.canvasHeight}>

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

    ctx.setLineDash([5]);
    ctx.beginPath();
    ctx.moveTo(this.canvas.width / 3,0);
    ctx.lineTo(this.canvas.width / 3,this.canvas.height);
    ctx.stroke();

    ctx.moveTo((this.canvas.width / 3) * 2, 0);
    ctx.lineTo((this.canvas.width / 3) * 2, this.canvas.height);
    ctx.stroke();

    ctx.moveTo(0, this.canvas.height / 3);
    ctx.lineTo(this.canvas.width, this.canvas.height / 3);
    ctx.stroke();

    ctx.moveTo(0, (this.canvas.height / 3) * 2);
    ctx.lineTo(this.canvas.width, (this.canvas.height / 3) * 2);
    ctx.stroke();
  }

  render() {
    return this.state.imageSource ? this.renderCanvas() : this.renderNoSource();
  }

  scaleImage(event) {
    const scale = event.target.value / 10;
    this.redrawCanvas(scale);
  }

  redrawCanvas(scale) {
    this.scaleValueRef.current.value = scale;
    this.drawSourceCanvas(scale);
    const ctx = this.canvas.getContext('2d');
    this.eraseCanvas(ctx);

    const imageWidth = this.image.width * scale;
    const imageHeight = this.image.height * scale;

    ctx.drawImage(this.image, (this.state.canvasWidth - imageWidth) / 2, (this.state.canvasHeight - imageHeight) / 2, imageWidth, imageHeight);
    this.renderResolution(ctx, imageWidth, imageHeight);
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
    ctx.fillStyle = '#00000099';
    ctx.resetTransform();
    ctx.rect(0, 0, 85,24);
    ctx.fill();
    ctx.font = '12px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText(Math.floor(width) + ' X ' + Math.floor(height), 40, 16);
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

  //Based on the size of the canvas and the image, we want to determine if we should crop down the image when
  //we process it.
  determineCrop(source, scale) {

    // Get the scale of the current image.
    const imageWidth = this.image.width * scale;
    const imageHeight = this.image.height * scale;

    const shouldCropWidth = imageWidth < this.canvas.width;
    const shouldCropHeight = imageHeight < this.canvas.height;
    //Crop the scaled image.
    const data = source.getImageData(shouldCropWidth ? (this.sourceCanvas.width - imageWidth) / 2 : 0, shouldCropHeight ? (this.sourceCanvas.height - imageHeight) / 2 : 0, shouldCropWidth ? imageWidth : this.canvas.width, shouldCropHeight ? imageHeight : this.canvas.height);
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