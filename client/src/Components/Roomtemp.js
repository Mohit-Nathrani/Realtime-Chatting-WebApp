import React, { Component } from 'react';
import MessageMe from './MessageMe';
import MessageOther from './MessageOther';

import io from 'socket.io-client';
const socketUrl = 'http://192.168.43.154:4000';
const socket = io(socketUrl);

export default class Room extends Component {
	constructor(props){
    super(props);
    this.state = {
      room_id:this.props.match.params.id,
      token: null,
      messages:[],
      show:false,
      newmsg:'',
      otherUser:'',
      user_id:'',
      otherUser_id:'',
      isOtherUserTyping:false,
      lineStatus:''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleKeys = this.handleKeys.bind(this);
    this.leavingRoom = this.leavingRoom.bind(this);
    this.TypingStopped = this.TypingStopped.bind(this);
    this.TypingStarted = this.TypingStarted.bind(this);
  }


  componentWillMount() {
  	const token = localStorage.getItem('token');
    if(token){
      socket.emit('set:me:online',{token:token});
      this.timer = null;
      socket.emit('joining:room',{room_id:this.state.room_id}); //TODO:  only if user is room member
	    socket.emit('send:seen:status',{room_id:this.state.room_id,token:token}); //TODO: only if msg belongs to the user
      this.getRoomMessages();
      
      
      //Socket Listeners:
      socket.on('line:status',(data)=>{
        this.setState({lineStatus:data.type});
      })
      socket.on('get:seen:status',()=>{
        this.getRoomMessages();
      });
      
      socket.on('get:room:message',(data) => {
	      this.setState({messages:this.state.messages.concat(data.result)});
        socket.emit('send:seen:status',{room_id:this.state.room_id,token:token}); //TODO: only if msg belongs to the user  
	    });

      socket.on('typing:started:status',(data)=>{
        this.setState({isOtherUserTyping:true});
      });

      socket.on('typing:stopped:status',(data)=>{
        this.setState({isOtherUserTyping:false});
      })
	 }
  	else{
  		window.location.href = '/auth';
  	}
  }

  getRoomMessages(){
    socket.emit('get:room:messages',{room_id:this.state.room_id,token:localStorage.getItem('token')},(data)=>{ //TODO: only if user is room member
      if(data.success){
        var otherUser = data.details.user2_name;
        var otherUser_id = data.details.user2_id;
        if(data.req_by===data.details.user2_id){
           otherUser = data.details.user1_name;
           otherUser_id = data.details.user1_id;
        }
        this.setState({
          messages:data.details.msg,
          user_id:data.req_by,
          otherUser:otherUser,
          otherUser_id:otherUser_id,
          },()=> {
            //To get status(Online or Offline) of otheruser
            socket.emit('get:line:status',{id:this.state.otherUser_id},(data)=>{
              this.setState({lineStatus:data.lineStatus});
            })
            socket.emit('joining:room',{room_id:'line:status:'+this.state.otherUser_id}); 
            this.setState({show:true});
          });
      }
      else{
        window.location.href = '/auth';
      }
    });
  }

  componentDidMount() {
    if(this.state.show){
      this.scrollToBottom();
    }
    window.addEventListener('beforeunload', this.leavingRoom);
  }

  componentDidUpdate() {
    if(this.state.show){
      this.scrollToBottom();
    }
  }

  scrollToBottom = () => {
    this.el.scrollIntoView({ behavior: "smooth" });
  }


  handleChange(event) {
    this.setState({newmsg: event.target.value});
      clearTimeout(this.timer);
      this.TypingStarted();
      this.timer = setTimeout(this.TypingStopped,2500);
  }

  handleSubmit(event) {
    event.preventDefault();
    if(this.state.newmsg!==undefined && this.state.newmsg!==''){
      var data = {
        from:this.state.user_id,
        to:this.state.otherUser_id,
        room_id:this.state.room_id,
        newmsg:this.state.newmsg
      };
      socket.emit("send:room:message",data);
      //this.setState({messages:this.state.messages.concat(toadd)},()=>this.setState({newmsg:''}));
      this.setState({newmsg:''});
    }
  }

  TypingStarted(){
    socket.emit('typing:started',{room_id:this.state.room_id,token:this.state.token}); //TODO:  only if user is room member    
  }

  TypingStopped(){
    socket.emit('typing:stopped',{room_id:this.state.room_id,token:this.state.token})
  }

  handleKeys(event){
    if(event.key==='Enter' && event.ctrlKey){   
      this.TypingStopped();
      this.handleSubmit(event);
    }
  }

  leavingRoom() {
    socket.emit('leaving:room',{room_id:this.state.req_by_id});
  }


  componentWillUnmount() {
    this.componentCleanup();
    window.removeEventListener('beforeunload', this.leavingRoom);
  }

  render() {
		return (
      <div className="container clearfix">
        <div className="chat">
          <div className="chat-header clearfix">
            <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_01_green.jpg" alt="avatar" />
            
            <div className="chat-about">
              <div className="chat-with">{this.state.otherUser}</div>
              <div className="align-left">
              {
                (this.state.isOtherUserTyping)
                ?(<div className="green">Typing....</div>)
                :(this.state.lineStatus)
                  
              }
              </div>
            </div>
          </div>
          
          <div className="chat-history">
      {(this.state.show)
      ?(
            <ul>
              {
                this.state.messages.map(msg =>
                (msg.from===this.state.otherUser_id)
                ?(<MessageOther key={msg._id} msg_body={msg.msg} />)
                :(<MessageMe key={msg._id} msg_body={msg.msg} read={msg.read}/>)
                )
              }
                            
              <li>
                <i className="fa fa-circle online"></i>
                <i className="fa fa-circle offline"></i>
                <i className="fa fa-circle online"></i>
              </li>
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
          
          <form className="chat-message clearfix" onSubmit={this.handleSubmit}>
            <textarea type="text" name="message-to-send" onKeyPress={this.handleKeys} value={this.state.newmsg} onChange={this.handleChange} placeholder ={"Type your message"} rows="1"/>
            <button type="sumbit">(ctrl+Enter) Send</button>
          </form>
        </div>
      </div>
		);
	}
}
