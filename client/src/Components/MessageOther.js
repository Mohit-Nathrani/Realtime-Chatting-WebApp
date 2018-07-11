import React, { Component } from 'react';

export default class MessageOther extends Component {
  /*shouldComponentUpdate(nextProps, nextState) { 
    return false;
  }*/

  render() {
		return (
			<li className="clearfix">
                <div className="message-data float-left">
                  <span className="message-data-time" ></span>
                </div>
                <div className="message other-message float-left">
                  {this.props.msg_body}
                </div>
            </li>
		);
	}
}
