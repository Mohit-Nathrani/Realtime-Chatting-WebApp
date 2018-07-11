import React, { Component } from 'react';
import {Redirect} from 'react-router-dom'
import RoomDesign from './RoomDesign'
import './style.css'

import io from 'socket.io-client';
const socketUrl = 'http://192.168.43.154:4000';
const socket = io(socketUrl);
	

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
  			socket.emit('set:me:online',{token:token});
  			socket.on('refresh',(data)=>{
		    	this.get();
		    });
		}
  	}
	  
	get(){
		const token = localStorage.getItem('token');
	    if(token){
	      this.setState({login:true,token:token}, ()=> {
	        socket.emit('get:Rooms',{token:this.state.token},(data)=>{
	        	this.setState({name:data.req_by,rooms:data.rooms,req_by_id:data.req_by_id},()=>{
	        		socket.emit('joining:room',{room_id:this.state.req_by_id});
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
		window.location.href = "/room/"+id;
	}

	handleCompose(){
    	window.location.href = "/newroom";
	}

	leavingRoom() {
		socket.emit('leaving:room',{room_id:this.state.req_by_id});
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
		    <div className="w3-display">
		    <div className="w3-display-topmiddle w3-row w3-round-large">
		    <div className=" top-curve colorme w3-top w3-padding w3-col s12 m9 l6 w3-mobile">
		            <p>
		            <div className="w3-col s4">Chat-App</div>
		            <button className="tabs w3-col s3 l2 w3-margin-left" onClick={this.handleLogOut}>Logout</button>
		            <button className="tabs w3-col s4 l3 w3-margin-right" onClick={this.handleCompose}>Compose</button>
		            </p>
		    </div>
		    <br/><br/>
		    <div className=" bottom-curve colorme  w3-col s12 m9 l6 w3-mobile">
		        <div className="people-list room" id="people-list">
		          {this.state.show
		            ?(
			            (!this.state.empty)
			            ?(
			            	<ul className="">
				            {
				            	this.state.rooms.map(room =>
				                <li key={room._id} className="clearfix"  onClick={(e)=> this.handleClick(e,room._id)}>
				                  <RoomDesign notif_condition={(room.not_readed_by===this.state.req_by_id) && (room.not_readed_msg.length>0)} unseen={room.not_readed_msg.length} avatar="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_01.jpg" from={(room.user1_name!==this.state.name)?(room.user1_name):(room.user2_name)} lastmsg={room.lastmsg} line="offline" />
				                </li>)
				            }    
				            </ul>
				        )
				       	:(	
				           	<div className="search">Inbox Empty</div>
				        )
		            )
		            :(
		            	<div className="search">Loading...</div>
		            )
		          }
		        </div>
		    </div>
		    </div>
		    </div>
		    )
		    :(
		    <Redirect to="/auth"/>
		    )
		);
	}
}
