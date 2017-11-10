import React, { Component } from 'react';
import {Button } from 'react-bootstrap';
import FA from 'react-fontawesome'

import Dock from 'react-dock';

import './css/DockPanel.css'

export default class DockPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
			size: 0,
			position: props.position,
		};
		this.DEFAULT_SIZE = .4
	}

  render() {
		const main = this;
		const glyph = this.state.size === 0 ? this.props.glyph : 'remove'
		return (
      <div className={["DockPanel", this.props.className].join(' ')}>
				<Dock
          className="Dock"
					position={this.state.position}
					defaultSize={0}
          size={this.state.size}
          dimStyle={{display: 'none'}}
					isVisible={true}
          onSizeChange={this.handleSizeChange}>
        {({ position, isResizing }) =>
          <div className="Dock-content">
						<Button className="DockPanel-hide"  onClick={main.toggle}>
							<FA name={glyph}/>
						</Button>
						{this.props.children}
					</div>
          }
        </Dock>
      </div>
    );
  }

	toggle = () => {
		if (this.state.size === 0)
			this.handleSizeChange(this.DEFAULT_SIZE)
		else{
			this.DEFAULT_SIZE = this.state.size
			this.handleSizeChange(0)
		}

	}

  handleSizeChange = size => {
		size = Math.min(.9, size)
		if (size < .05)
			size = 0
		this.setState({ size: size });

		if (this.props.onSizeChange){
			setTimeout(this.props.onSizeChange, 500)
		}
	}
}
