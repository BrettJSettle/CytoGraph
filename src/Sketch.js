
import React from 'react'
import reactCSS from 'reactcss'
import { SketchPicker } from 'react-color'

function parseColor(hex){
	var c;
	if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
		c= hex.substring(1).split('');
		if(c.length === 3){
			c= [c[0], c[0], c[1], c[1], c[2], c[2]];
		}
		c= '0x'+c.join('');
		return {r: (c>>16)&255, g: (c>>8)&255, b: c&255};
	}
	return {r: 0, g: 0, b: 0}
}

class Sketch extends React.Component {
	constructor(props){
		super(props)

		this.state = {
			displayColorPicker: false,
		}
	}

  handleClick = () => {
    this.setState({ displayColorPicker: !this.state.displayColorPicker })
  };

  handleClose = () => {
    this.setState({ displayColorPicker: false })
  };

  handleChange = (color) => {
    this.setState({ color: color.rgb })
		this.props.onChange(color.hex)
  };

  render() {
		const styles = reactCSS({
      'default': {
        color: {
          //width: '36px',
          //height: '14px',
					fontSize: '.8em',
					padding: '0px',
          borderRadius: '4px',
          background: 'white',
					textAlign:'center',
        },
        swatch: {
          padding: '5px',
          background: this.props.color,
          borderRadius: '1px',
          boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
          display: 'inline-block',
          cursor: 'pointer',
        },
        popover: {
          position: 'absolute',
          zIndex: '2',
					right:'0',
        },
        cover: {
          position: 'fixed',
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
        },
      },
    });

		const color = parseColor(this.props.color)
    return (
      <div>
        <div style={ styles.swatch } onClick={ this.handleClick }>
			<div style={ styles.color }>{this.props.color}</div>
        </div>
        { this.state.displayColorPicker ? <div style={ styles.popover }>
          <div style={ styles.cover } onClick={ this.handleClose }/>
          <SketchPicker color={ color } onChange={ this.handleChange } />
        </div> : null }

      </div>
    )
  }
}

export default Sketch
