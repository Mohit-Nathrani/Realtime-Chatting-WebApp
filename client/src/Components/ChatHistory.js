import React, { Component } from 'react';
import MessageMe from './MessageMe';
import MessageOther from './MessageOther';

export default class ChatHistory extends Component {
	componentDidMount() {
	    if(this.props.show){
	      this.scrollToBottom();
	    }
	}

	componentDidUpdate() {
		if(this.props.show){
	      this.scrollToBottom();
	    }
	}

	scrollToBottom = () => {
    	this.el.scrollIntoView({ behavior: "smooth" });
  	}

	render() {
		return (
			<div className="chat-history">
	          {(this.props.show)
	          ?(
	            <ul>
	              {
	                this.props.messages.map(msg =>
	                (msg.from===this.props.otherUser_id)
	                ?(<MessageOther key={msg._id} msg_body={msg.msg} />)
	                :(<MessageMe key={msg._id} msg_body={msg.msg} read={msg.read}/>)
	                )
	              }
	                            
	              <div ref={(el) => { this.el = el; }}>
	              </div>
	            </ul>
	          )
	          :(
	            <p>
	            Loading..
	            </p>
	          )}    
          	</div>
		);
	}
}
