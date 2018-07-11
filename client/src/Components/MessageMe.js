import React, { Component } from 'react';
import './style.css'

export default class MessageMe extends Component {
  /*
  shouldComponentUpdate(nextProps, nextState) { 
    if (nextProps.read === this.props.read) return false;
    return true;
  }*/

	render() {
		return (
			<li className="clearfix">
                <div className="message-data float-right">
                  <span className="message-data-time">{  (this.props.read)
                    ?(<div className="checkmark">LL</div>)
                    :(<div className="checkmark">L</div>)
                  }</span>
                </div>
                <div className="message my-message float-right">
                  {this.props.msg_body}
                  
                </div>
              </li>
		);
	}
}
