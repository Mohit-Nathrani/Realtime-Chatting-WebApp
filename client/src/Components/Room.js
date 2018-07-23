import React, { Component } from 'react';
import ChatHistory from './ChatHistory';

export default class Room extends Component {
  constructor(props){
    super(props);
    this.state = {
      room_id:new URL(window.location.href).searchParams.get("id"),
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
      this.props.socket.emit('set:me:online',{token:token});
      this.timer = null;
      this.props.socket.emit('joining:room',{room_id:this.state.room_id}); //TODO:  only if user is room member
      this.props.socket.emit('send:seen:all:status',{room_id:this.state.room_id,token:token}); //TODO: only if msg belongs to the user
      this.getRoomMessages();
      
      
      //Socket Listeners:
      this.props.socket.on('line:status',(data)=>{
        this.setState({lineStatus:data.type});
      });

      this.props.socket.on('get:seen:all:status',()=>{
        this.getRoomMessages();
      });
      

      this.props.socket.on('get:room:message',(data) => {
        this.setState({messages:this.state.messages.concat(data.result)});
        this.props.socket.emit('send:seen:one:status',{room_id:this.state.room_id,token:token,msgid:data.result._id}); //TODO: only if msg belongs to the user  
      });

      this.props.socket.on('get:seen:one:status',() => {
        this.setState(prevState => {
          const messages = [...prevState.messages];
          messages[messages.length-1].read = true;
          return {messages: messages};
        });
      });

      this.props.socket.on('typing:started:status',(data)=>{
        this.setState({isOtherUserTyping:true});
      });

      this.props.socket.on('typing:stopped:status',(data)=>{
        this.setState({isOtherUserTyping:false});
      })
   }
    else{
      window.location.href = '/auth';
    }
  }

  getRoomMessages(){
    this.props.socket.emit('get:room:messages',{room_id:this.state.room_id,token:localStorage.getItem('token')},(data)=>{ //TODO: only if user is room member
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
            this.props.socket.emit('get:line:status',{id:this.state.otherUser_id},(data)=>{
              this.setState({lineStatus:data.lineStatus});
            })
            this.props.socket.emit('joining:room',{room_id:'line:status:'+this.state.otherUser_id}); 
            this.setState({show:true});
          });
      }
      else{
        window.location.href = '/auth';
      }
    });
  }

  componentDidMount() {
    window.addEventListener('beforeunload', this.leavingRoom);
  }

  handleChange(event) {
    if(event.target.value.length<46){
      this.setState({newmsg: event.target.value});
    }
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
      var forMe = {
        from:this.state.user_id,
        to:this.state.otherUser_id,
        msg:this.state.newmsg,
        read:false,
        _id:new Date()
      };
      this.props.socket.emit("send:room:message",data);
      this.setState({messages:this.state.messages.concat(forMe)},()=>this.setState({newmsg:''}));
    }
  }

  TypingStarted(){
    this.props.socket.emit('typing:started',{room_id:this.state.room_id,token:this.state.token}); //TODO:  only if user is room member    
  }

  TypingStopped(){
    this.props.socket.emit('typing:stopped',{room_id:this.state.room_id,token:this.state.token})
  }

  handleKeys(event){
    if(event.key==='Enter' && event.ctrlKey){   
      this.TypingStopped();
      this.handleSubmit(event);
    }
  }

  leavingRoom() {
    this.props.socket.emit('leaving:room',{room_id:this.state.req_by_id});
  }


  componentWillUnmount() {
    this.componentCleanup();
    window.removeEventListener('beforeunload', this.leavingRoom);
  }

  render() {
    return (
      <div>
        <div className="w3-col l3">
          <div className="colorback">ewfe</div>
        </div>
        <div className="w3-col l6"> 
        <div className="w3-col l1">
          <div className="colorback">wvv</div>
        </div>
        <div className="w3-col l10 color2">
        <div className="holder">
          <div className="chat"> 
            <div className="chat-header clearfix w3-top w3-col l5 color2">
              <img src="https://i.imgur.com/luIlHki.png" alt="avatar" /> 
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
            <div className="content">
            <ChatHistory show={this.state.show} messages={this.state.messages} otherUser_id={this.state.otherUser_id}/>
            </div>
            <form className="form-pad chat-message footer w3-col l5 color2" onSubmit={this.handleSubmit}>
              <textarea type="text" name="message-to-send" onKeyPress={this.handleKeys} value={this.state.newmsg} onChange={this.handleChange} placeholder ={"Type your message"} rows="1"/>
              <button type="sumbit">(ctrl+Enter) Send</button>
            </form>
          </div>
        </div>
        </div>
        </div>
      </div>
    );
  }
}
