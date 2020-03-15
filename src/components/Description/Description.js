import React, { Component } from 'react';
import './Description.css';

class Description extends Component {
    render() {
        return (
            <div className="content-box">
                {this.props.children}
            </div>
        )
    }
}

export default Description;