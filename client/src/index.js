import React from 'react';
import ReactDOM from 'react-dom';
import Auth from './Components/Auth'
import Rooms from './Components/Rooms';
import Room from './Components/Room';
import NewRoom from './Components/NewRoom';
import { BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import registerServiceWorker from './registerServiceWorker';

import io from 'socket.io-client';
const socketUrl = window.location.hostname;
const socket = io(socketUrl);

ReactDOM.render(
	 <Router>
	    <Switch>
	      <Route exact path="/"><Rooms socket={socket}/></Route>
		  <Route path="/auth"><Auth socket={socket}/></Route>
		  <Route path="/room"><Room socket={socket}/></Route>
		  <Route path="/newroom"><NewRoom socket={socket}/></Route>
	    </Switch>
	</Router>,document.getElementById('root'));
registerServiceWorker();