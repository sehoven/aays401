import React, {Component} from 'react';

class Canvas extends React.Component {

  constructor(props) {
    super(props);
    this.state={url:null}

    this.addText = this.addText.bind(this)

  }
  componentDidMount() {
    this.addText();
  }
  addText(){
    const canvas = this.refs.canvas
    const ctx = canvas.getContext("2d")
    const img = this.refs.image
    img.onload = () => {
      ctx.drawImage(img, 0, 0)
      ctx.font = "50px Courier"
      ctx.fillText(this.props.text, 10,550 )

    }
    var dataURL = canvas.toDataURL()
    this.setState({url:dataURL})
  }


  render() {
    return(
      <div className="CanvasContainer">
        <canvas className="Canvas" ref="canvas" width={640} height={640} />
        <img ref="image" src={this.props.imgsrc} className="hidden" />
      </div>

    )
  }
}
export default Canvas
