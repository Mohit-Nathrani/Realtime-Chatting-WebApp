import React, { Component } from 'react';

export default class RoomDesign extends Component {
	render() {
		return (
			<div className="row">	
				<img src={this.props.avatar} alt="avatar" />
				<div className="column about">
		        	<div className="name">{this.props.from}</div>
	            	<div className="status">
	          			{this.props.lastmsg}
	        		</div>
	          	</div>
	          	{(this.props.notif_condition)
	          	 ?(<div className="column search badge float-right">{this.props.unseen}</div>)
	          	 :(<div> </div>)
	          	}
			</div>
		);
	}
}
