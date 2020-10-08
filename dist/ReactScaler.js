import React, { createRef } from 'react';
import placeholder from './assets/placeholder.png';
import './style.scss';
export default class ReactScaler extends React.Component {
  constructor(props) {
    super(props);
    this.scaleImage = this.scaleImage.bind(this);
    this.redrawCanvas = this.redrawCanvas.bind(this);
    this.eraseCanvas = this.eraseCanvas.bind(this);
    this.canvasRef = /*#__PURE__*/createRef();
    this.scaleValueRef = /*#__PURE__*/createRef();
    this.rangeScaleRef = /*#__PURE__*/createRef();
    this.state = {
      canvasWidth: this.props.width ? this.props.width : window.innerWidth,
      canvasHeight: this.props.height ? this.props.height : window.innerHeight,
      imageSource: this.props.src ? this.props.src : placeholder,
      backgroundColor: this.props.backgroundColor ? this.props.backgroundColor : '#FFFFFF',
      scale: 1
    };
  }

  componentDidMount() {
    this.rangeScaleRef.current.value = 10;
    this.canvas = this.canvasRef.current;
    this.context = this.canvas.getContext('2d');
    this.image = new Image();
    this.image.src = this.state.imageSource; //Initially loads the given image.

    this.image.onload = () => {
      this.redrawCanvas(1);
    };
  }

  renderControls() {
    return /*#__PURE__*/React.createElement("div", {
      className: "react-scaler-controls"
    }, /*#__PURE__*/React.createElement("div", {
      class: "control-segment"
    }, /*#__PURE__*/React.createElement("span", null, "SCALE   "), /*#__PURE__*/React.createElement("input", {
      type: "number",
      ref: this.scaleValueRef,
      onChange: this.scaleImage
    })), /*#__PURE__*/React.createElement("div", {
      class: "control-segment"
    }, /*#__PURE__*/React.createElement("input", {
      type: "range",
      ref: this.rangeScaleRef,
      min: "1",
      max: "30",
      onChange: this.scaleImage
    })), /*#__PURE__*/React.createElement("div", {
      class: "control-segment"
    }, /*#__PURE__*/React.createElement("button", null, "Apply")));
  }

  renderCanvas() {
    return /*#__PURE__*/React.createElement("div", {
      className: "react-scaler"
    }, /*#__PURE__*/React.createElement("canvas", {
      ref: this.canvasRef,
      width: this.state.canvasWidth,
      height: this.state.canvasHeight
    }), this.renderControls());
  }

  render() {
    return this.renderCanvas();
  }

  scaleImage(event) {
    const scale = event.target.value / 10;
    this.scaleValueRef.current.value = scale;
    this.redrawCanvas(scale);
  }

  redrawCanvas(scale) {
    const ctx = this.canvas.getContext('2d');
    this.eraseCanvas(ctx);
    const imageWidth = this.image.width * scale;
    const imageHeight = this.image.height * scale;
    ctx.drawImage(this.image, (this.state.canvasWidth - imageWidth) / 2, (this.state.canvasHeight - imageHeight) / 2, imageWidth, imageHeight);
    this.renderResolution(ctx, imageWidth, imageHeight);
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
    ctx.rect(0, 0, 85, 24);
    ctx.fill();
    ctx.font = '12px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText(Math.floor(width) + ' X ' + Math.floor(height), 40, 16);
  }

}