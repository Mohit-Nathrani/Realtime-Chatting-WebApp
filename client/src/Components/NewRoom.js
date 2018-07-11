import React, { Component } from 'react';

export default class NewRoom extends Component {
	constructor(props) {
	    super(props);
	    this.state = {
	      to: '',
	      iserror: false,
	      token:null,
	      err:'',
	      isDisable:true
	    };
	    this.handleChange = this.handleChange.bind(this);
	    this.handleSubmit = this.handleSubmit.bind(this);
  	}

  	componentWillMount(){
  		var token=localStorage.getItem('token'); 
  		if(token){		
  			this.props.socket.emit('set:me:online',{token:token});
		}
		else{
			window.location.href = '/auth';			
		}
  	}

  	handleChange(event) {
  		this.setState({isDisable:event.target.value.length === 0});	
		this.setState({to: event.target.value});
	}

	handleSubmit(event){
	    event.preventDefault();
	    this.setState({isDisable:true});
	    var data={
	      "to": this.state.to,
	      "token": localStorage.getItem('token')
	    };
	    fetch('/create_room',{
	      method:"POST",
	      headers: {
	        'Accept':'application/json',
	        'Content-Type':'application/json'
	      },
	      body: JSON.stringify(data)
	    }).then(res => res.json())
	      .then(result =>
	        (result.success)
	          ? (
	              	window.location.href = "/room?id="+result.id
	           )
	          :(
	                this.setState({err:result.error,isDisable:false})
	           )
	         )
	      .catch((err)=>{
	        console.log(err);
	    	this.setState({isDisable:false,err:'Sorry! Network Problem'});
	    });
  	}

	render() {
		return (
		<div className="w3-row">
			<div className="w3-col l3">
		    	<div className="colorback">svsd</div>
		    </div> 
		    <div className="w3-col l6">
		    	<div className="w3-col l1">
			    	<div className="colorback">svsd</div>
		    	</div> 
		    	<div className="w3-col s12 l10 ">
	    			<div className="chat color2">
			          	<div className="chat-header clearfix">
			            	<div className="chat-about">
				              <div className="chat-with">Compose</div>
				            </div>
			            </div>
			            <form onSubmit={this.handleSubmit}>
							<input type="text" name="to" value={this.state.to} className="padding" onChange={this.handleChange} placeholder ={"Message To"}/>
			            	<button disabled={this.state.isDisable} className="button2" type="sumbit">(Enter) Start</button>
			          	</form>
			          	<div className="w3-padding">
							{this.state.err}
						</div>        				            	
			        </div>
			    </div>
			    <div className="w3-col l1">
			    	<div className="colorback">svsd</div>
		    	</div> 
			</div>	
		</div>

		);
	}
}
