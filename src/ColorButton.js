
import React from 'react'
import reactCSS from 'reactcss'
import { SketchPicker } from 'react-color'

class ColorButton extends React.Component {

	constructor(props){
		super(props)
		let color = ((typeof(props.color) === "string") ? 
			props.color
			: "#000000"
		)
		
		let ps = Object.assign({}, props)
		delete ps.color

		this.state = {
    	displayColorPicker: false,
    	color: color,
			...ps
		}
	}

  handleClick = () => {
    this.setState({ displayColorPicker: !this.state.displayColorPicker })
  };

  handleClose = () => {
    this.setState({ displayColorPicker: false })
  };

  handleChange = (color) => {
		this.setState({ color: color.hex })
		this.state.onChange(color.hex)
  };
	
  render() {
		const styles = reactCSS({
      'default': {
        color: {
          width: '46px',
          height: '20px',
          borderRadius: '2px',
					background: this.state.color,
        },
        swatch: {
          padding: '5px',
					background: '#fff',
          borderRadius: '1px',
          boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
          display: 'inline-block',
          cursor: 'pointer',
        },
        popover: {
          position: 'absolute',
          zIndex: '2',
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
		
    return (
      <div className="ColorButton">
        <div style={ styles.swatch } onClick={ this.handleClick }>
          <div style={ styles.color }><p style={{'textAlign': 'center'}}>Color</p></div>
        </div>
        { this.state.displayColorPicker ? <div style={ styles.popover }>
          <div style={ styles.cover } onClick={ this.handleClose }/>
          <SketchPicker color={ this.state.color } onChange={ this.handleChange } 
					onChangeComplete={ this.handleChange }/>
        </div> : null }

      </div>
    )
  }
}

export default ColorButton
