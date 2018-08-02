// dependencied
var express = require('express')
const path = require('path');
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const socket = require('socket.io')
const User = require('./models/user')
const Room = require('./models/room')
const Message = require('./models/message')


var app = express();
app.set('superSecret', process.env.bcrypt_KEY);

//connect to database
mongoose.connect(process.env.DATABASE_URL,{ useNewUrlParser: true })
  .then(() => console.log('connection successful'))
  .catch((err) => console.error(err));
mongoose.Promise = global.Promise;

//middleware body-parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'client/build')));

//basic-get
app.get('/check',function(req,res){
	//console.log('accessing homepage');
	res.send({success:true});
});
 

/*
Route responsible for registering a new user
Possibilities:
	1. Handle already taken
	2. Success
*/
app.post('/signup', function(req, res,next) {
  var name = req.body.name;
  var password = req.body.password;

  if(name===undefined || password===undefined || name==='' || password ===''){
    res.send({success:false,errors:'empty fields are not allowed'});
  }
  else{
  	User.findOne({name:name})
  	.then(user=>{
  		if(user){
  			res.send({success:false,errors:'Sorry! Name already taken.'});
  		}
  		else{
  			var newUser = new User({
		    	name : name,
		    	password : password
		    });
		    User.createUser(newUser,function(err,user){
		        if(err){
		        	res.send({success:false,errors:err});
		        }
		        else{
		        	res.send({success:true});
		        }
		    });
  		}
  	});
  	}
});


/*
Route resposible for authenticating a user
and providing him a token to maintain session
Possibilities:
	1. User not found in database.
	2. Wrong Password.
	3. Succeess
*/
app.post('/authenticate', function(req, res,next) {
  // find the user
  User.findOne({name: req.body.name}, function(err, user) {
    if (err) throw err;

    if (!user) {
      res.json({ success: false, errmsg: 'Authentication failed. User not found.' });
    } else if (user) {
      // check if password matches
      User.comparePassword(req.body.password,user.password,function(err,isMatch){
        if(err) throw err;
        if(isMatch){
          var token = jwt.sign(user.toJSON(), app.get('superSecret'));
          // return the information including token as JSON
          res.json({ success:true, token:token });
        }
        else{
          res.json({ success: false, errmsg: 'Authentication failed. Wrong password.' });
        }
    });
    }
  });
});


/*
Route responsible for creating a room between two users.
Possibilities:
	1. No User Found.
	2. can't create room with yourself
	3. Success
*/
app.post('/create_room', function(req, res,next) {
  	var name = req.body.to;
  	var token = req.body.token;
  	var date = new Date;
  	if(token===undefined || token===''){
   		res.send({success:false,error:'Please Log-in first'});
  	}
  	else{
  		jwt.verify(token, app.get('superSecret'), function(err, decoded) {
    		if (err) {
       			res.send({success: false,error:'Please Log-in Properly'});
      		}
      		else {
	      		User.findOne({name:name})
			  	.then((user)=> {
			  		if(user._id==decoded._id){
			  			res.send({success:false,error:'Sorry, You can not send message to yourself.'});
			  		}
			  		else{
				  		Room.create({user1:user._id,user2:decoded._id,user1_name:user.name,user2_name:decoded.name,last_change:date})
				  		.then(room => {
				  			User.update({ '_id':{ $in: [user._id,decoded._id]}}, {$push: {room_id:room._id}},{"multi":true})
				  			.then(user=>res.send({success:true,id:room.id}))
				  			.catch(err=>res.send({success:false,error:err}));
				  		})
				  		.catch(err=> res.send({success:false,error:'Sorry! invalid try'}))
				  	}
			  	})
			  	.catch((err)=> res.send({success:false,error:'Sorry! No Such User Found'}))
    		}
   		});
   	}			
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});


var port = process.env.PORT || 4000;
var server = app.listen(port,function(){
	console.log('server listening....')
});


//socket setup
var io = socket(server);

io.on('connection',function(socket){
	const _id = socket.id;
	//console.log('CONNECTING: '+_id);
	
	/*
		Called when a client will connect
		so, updating his status as online
	*/
	socket.on('set:me:online',function(data){
		jwt.verify(data.token, app.get('superSecret'), function(err, decoded) {
	    	if (err) {
	       		result({success: false});
	       		//console('ERROR: token error')
	      	}
	      	else {
	      		User.findByIdAndUpdate(decoded._id,{is_online:true})
	      		.then(user=>{
	      			socket.userid=user._id;
		      		socket.broadcast.to('line:status:'+socket.userid).emit('line:status',{type:'Online'});
	      		}).catch();
	    	}
	    });		
	});


	
	//Called when client wants to know status of another client  
	socket.on('get:line:status',function(data,result){
		//console.log('LINE_STATUS: sending lineStatus of '+data.id);
		User.findById(data.id)
		.then(user=> {
			if(user.is_online)
				result({lineStatus:'Online'})
			else
				result({lineStatus:'Offline'})
		})
		.catch();
	});

	//Responsible for providing all the rooms of a client
	socket.on('get:Rooms',function(data,result){
		//console.log('ROOMS :'+_id+ ' accessing its rooms');
		
		jwt.verify(data.token, app.get('superSecret'), function(err, decoded) {
	    	if (err) {
	       		result({success: false});
	       		//console('ERROR: token error')
	      	}
	      	else {
	      		User.findById(decoded._id)
	      		.then(user=> Room.find({_id:{ $in: user.room_id }}).sort({last_change:-1}))
	      		.then(rooms=>{
	      			result({req_by_id:decoded._id,req_by:decoded.name,rooms:rooms})
	      		})
	      		.catch(err=>result([]));
	    	}
	    });
	});


	socket.on('joining:room',function(data){
		//console.log('JOINING: '+_id +' joining room '+data.room_id);
		socket.join(data.room_id);
	});

	socket.on('leaving:room',function(data){
		//console.log('LEAVING: '+_id +' leaving room '+data.room_id);
		socket.leave(data.room_id);
	});

	//Responsible for sending all messages of a particular room
	//will also verify whether user has access of room requested 
	socket.on('get:room:messages',function(data,result){
		//console.log('ROOM: '+_id+' is accesssing messages of room: '+ data.room_id);
		
		//verify token
		jwt.verify(data.token, app.get('superSecret'), function(err, decoded) {
	    	if (err) {
	       		result({success: false});
	      	}
	      	else {
	        	// if token is correct
	        	Room.findById(data.room_id)
				.then((room)=>{
						if(room.user1==decoded._id || room.user2==decoded._id){
						var details = {
							user1_id:room.user1,
							user2_id:room.user2,
							user1_name:room.user1_name,
							user2_name:room.user2_name,
							msg:[]
						};
						Message.find({_id:{ $in: room.messages }})
						.then(msgs=>{
							details.msg=msgs;
							result({success:true,details:details,req_by:decoded._id});
						})
						.catch(err=>result({success:false,error:err}))
					}
					else{
						result({success:false,error:'you can not access this resource'});
					}
				})
				.catch((err)=> result({success:false,error:err}));
	    	}
	    });	
	});

	//Called when a client enters a room and hence confirming that
	//now no message is remaing unseen for him 
	socket.on('send:seen:all:status',function(data){
		jwt.verify(data.token, app.get('superSecret'), function(err, decoded) {
	    	if (err) {
	       		//result({success: false});
	      	}
	    	else{
	        	Room.findById(data.room_id)
				.then((room)=>{
					Message.update(
						{_id:{ $in: room.not_readed_msg},to:decoded._id},
						{ read: true },
						{ multi: true },
						(err, upd)=> {
		     			   	if (err) throw err;
					        if(upd.nModified>0){
					        	socket.broadcast.to(data.room_id).emit('get:seen:all:status');
					        	console.log('emited: '+upd.nModified);
					        	Room.update({_id:data.room_id},{ $set: { not_readed_msg: [] }}).then().catch();
					        }
					});
				})
				.catch(err=>console.log('ERROR: update error'));
			}
		});
	});

	/*
		called whenever client gets broadcasted message
		and since there can be only two users in a room
		we can conclude that both users are present in room
		so we can safely assume not_readed_msg for this room as empty array 
	*/
	socket.on('send:seen:one:status',function(data){
		jwt.verify(data.token, app.get('superSecret'), function(err, decoded) {
	    	if (err) {
	       		//result({success: false});
	      	}
	    	else{
				Message.update(
					{_id:data.msgid},
					{ read: true },
					(err, upd)=> {
	     			   	if (err) console.log(err);
			        	socket.broadcast.to(data.room_id).emit('get:seen:one:status');
					});
				Room.update({_id:data.room_id},{ $set: { not_readed_msg: [] }}).then().catch();
			}
		});
	});

	/*
		broadcasting the typing:start status to other user if he is present in the room
	*/
	socket.on('typing:started',function(data){
		//TODO: verify is user allowed to broadcast in this room 
		socket.broadcast.to(data.room_id).emit('typing:started:status',{data:'TODO: id of sender'});

	});
	/*
		broadcasting the typing:stop status to other user if he is present in the room
	*/
	socket.on('typing:stopped',function(data){
		socket.broadcast.to(data.room_id).emit('typing:stopped:status',{data:'TODO: id of sender'});
	});



	/*
		simply because client already having his sent message
		server will only send this message to other user(broadcasting)
	*/
	socket.on('send:room:message',function(data){
		//console.log('NEW_MESSAGE: '+ _id+ 'sending msg('+data.newmsg+') to room->'+data.room_id);
		Message.create({'from':data.from,'to':data.to,'msg':data.newmsg,last_change:Date.now})
		.then((result)=>{
			socket.broadcast.to(data.room_id).emit('get:room:message', {result:result});
			Room.findByIdAndUpdate(data.room_id,{$push: {not_readed_msg: result._id,messages: result._id}}).then().catch();
			Room.findByIdAndUpdate(data.room_id,{last_change:new Date,lastmsg:data.newmsg.substring(0,12),not_readed_by:result.to}).then().catch();
			io.in(data.to).emit('refresh',{data:'ok'});
		})
		.catch();

	});

	//to set user as offline
	socket.on('disconnect',()=>{
		//console.log('DISCONNECTING: '+_id);
  		socket.broadcast.to('line:status:'+socket.userid).emit('line:status',{type:'Offline'});
  		User.findByIdAndUpdate(socket.userid,{is_online:false})
	    .then().catch();
	});
});
