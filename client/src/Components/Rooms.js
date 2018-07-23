import React, { Component } from 'react';
import {Redirect} from 'react-router-dom'
import RoomDesign from './RoomDesign'
import './style.css'

export default class Rooms extends Component {
	constructor(props){
	    super(props);
	    this.state = {
	      login:false,
	      show: false,
	      name: '',
	      rooms:[],
	      otherUser: null,
	      empty:true,
	      req_by_id:''
	    };
	    this.leavingRoom = this.leavingRoom.bind(this);
	    this.handleLogOut = this.handleLogOut.bind(this);
	}
	  

  	componentWillMount(){
  		var token=localStorage.getItem('token'); 
  		if(localStorage.getItem('token')){		
  			this.get()
  			this.props.socket.emit('set:me:online',{token:token});
  			this.props.socket.on('refresh',(data)=>{
		    	this.get();
		    });
		}
  	}
	  
	get(){
		const token = localStorage.getItem('token');
	    if(token){
	      this.setState({login:true,token:token}, ()=> {
	        this.props.socket.emit('get:Rooms',{token:this.state.token},(data)=>{
	        	this.setState({name:data.req_by,rooms:data.rooms,req_by_id:data.req_by_id},()=>{
	        		this.props.socket.emit('joining:room',{room_id:this.state.req_by_id});
	        		if(this.state.rooms.length>0){
	        		this.setState({empty:false});
	        	}
	        	this.setState({show:true})
	        	});
	        });
	      });
	    }
	}

	handleClick(event,id){
		window.location.href = "/room?id="+id;
	}

	handleCompose(){
    	window.location.href = "/newroom";
	}

	leavingRoom() {
		this.props.socket.emit('leaving:room',{room_id:this.state.req_by_id});
    }

	componentDidMount(){
      window.addEventListener('beforeunload', this.leavingRoom);
    }

    handleLogOut(){
		localStorage.removeItem('token');
    	this.setState({token:'',login:false});
    	window.location.href = "/auth";		
    }

    componentWillUnmount() {
        this.leavingRoom();
        window.removeEventListener('beforeunload', this.leavingRoom);
    }

	
	render() {
		return (
			(this.state.login)
		    ?(
		    <div className="w3-row">
		    <div className="w3-col l3">
		    	<div className="colorback">space</div>
		    </div> 
		    <div className="w3-col l6">
		    	<div className="w3-col l1">
			    	<div className="colorback">space</div>
		    	</div> 
			    <div className="w3-col l10">
			    	<div className="w3-top">
				    	<div className="line colorme w3-col l5 w3-padding">
					            <div className="w3-col l7 m6 s3">
					            	<div className="w3-button w3-block">Chat-App</div>
					            </div>
					            <div className="w3-col l5 m6 s9">
						        	<button className="w3-right w3-margin-left w3-margin-right" onClick={this.handleLogOut}>Logout</button>
						            <button className="w3-right" onClick={this.handleCompose}>Compose</button>
					            </div>
					    </div>
					</div>
				    <div className=" colorme w3-col">
				        <br/><br/>

				        <div className="people-list" id="people-list">
				          {this.state.show
				            ?(
					            (!this.state.empty)
					            ?(
					            	<ul className="w3-padding-large">
						            {
						            	this.state.rooms.map(room =>
						                <li key={room._id} className="clearfix line"  onClick={(e)=> this.handleClick(e,room._id)}>
						                  <RoomDesign notif_condition={(room.not_readed_by===this.state.req_by_id) && (room.not_readed_msg.length>0)} unseen={room.not_readed_msg.length} avatar="https://i.imgur.com/luIlHki.png" from={(room.user1_name!==this.state.name)?(room.user1_name):(room.user2_name)} lastmsg={room.lastmsg} line="offline" />
						                </li>)
						            }    
						            </ul>
						        )
						       	:(	
						           	<div className="w3-button w3-block">Inbox Empty</div>
						        )
				            )
				            :(
				            	<div className="w3-button w3-block">Loading...</div>
				            )
				          }
				        </div>
				    </div>
				</div>
				<div className="w3-col l1">
			    	<div className="colorback">svsd</div>
		    	</div>
			</div>
			<div className="w3-col l6">
		    </div> 
		    </div>
		    )
		    :(
		    <Redirect to="/auth"/>
		    )
		);
	}
}
