import React,{Component} from 'react'
import {Redirect} from 'react-router-dom'
import './logins.css'

/*
  Login Component is basically a form for authentication of resistered user.
*/
class Login extends Component{
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      password: '',
      errmsg: '',
      token:null
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event){
    this.setState({errmsg:''});
    event.preventDefault();
    var data={
      "name": this.state.name,
      "password": this.state.password
    };
    fetch('/authenticate',{
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
              localStorage.setItem('token', result.token),
              this.setState({success:true,token:result.token})
           )
          :(
                this.setState({errmsg:result.errmsg})
           )
         )
      .catch(function(err){
        console.log(err);
    });
  }

  handleChange(event) {
    event.preventDefault();
   const target = event.target;
   const value =  target.value;
   const name = target.name;

   this.setState({
     [name]: value
   });
  }

  render(){
    return(
     (this.state.success)
      ?(<Redirect to="/"/>
      )
      :(
        <div>
          <form className="sign-in-htm" onSubmit={this.handleSubmit}>
            {this.state.success ?(<div>No error</div>) : (<div className="warning">{this.state.errmsg}</div>)}
            <div className="group">
              <label className="label">Name</label>
              <input name="name" value={this.state.name} onChange={this.handleChange} type="text" className="input"/>
            </div>
            <div className="group">
              <label className="label">Password</label>
              <input name="password" type="password"  value={this.state.password} onChange={this.handleChange} className="input" data-type="password"/>
             </div>
            <div className="group">
              <input type="submit" className="button" value="Sign In"/>
            </div>
          </form>
        </div>
      )
    );
  }
}


/*
  Signup Component is basically a form to register the new user.
*/
class Signup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      password: '',
      success: false,
      errors:[],
      iserror:false
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event){
    event.preventDefault();
    this.setState({iserror:false});
    var data={
      "name":this.state.name,
      "password": this.state.password
    };
    fetch('/signup',{
      method:"POST",
      headers: {
        'Accept':'application/json',
        'Content-Type':'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(result =>
      (result.success)
        ? (
            this.setState({success:true}),
            alert("You are registed.Now you can Signin..")
         )
        :(
              this.setState({errors:result.errors,iserror:true})
         )
       )
     .catch(function(err){
       console.log(err);
    });
  }

  handleChange(event) {
   const target = event.target;
   const value = target.value;
   const name = target.name;

   this.setState({
     [name]: value
   });
  }


  render(){
    return(
      (this.state.success)
      ?(<Redirect to="/"/>
      )
      :(
        <div>
          <form onSubmit={this.handleSubmit} className="sign-up-htm">
              <ul>
                <div className="w3-round-small w3-red">
                  {this.state.iserror && this.state.errors}
                </div>
              </ul>
            <div className="group">
              <label className="label">Name</label>
              <input name="name" type="text" value={this.state.name} onChange={this.handleChange} className="input"/>
            </div>
            <div className="group">
              <label className="label">Password</label>
              <input name="password" type="password" value={this.state.password} onChange={this.handleChange} className="input" data-type="password"/>
            </div>
            <div className="group">
              <input type="submit" className="button" value="Sign Up"/>
            </div>
          </form>
        </div>
      )
    );
  }
}

/*
  HomePage Component contains Login and Signup Components.
  User can select anyone from them.
*/
class HomePage extends Component{
  render(){
    return(
      <div className="login-wrap w3-col l4 s12">
      	<div className="login-html">
      		<input id="tab-1" type="radio" name="tab" className="sign-in" defaultChecked={true}/><label htmlFor="tab-1" className="tab">Sign In</label>
      		<input id="tab-2" type="radio" name="tab" className="sign-up"/><label htmlFor="tab-2" className="tab">Sign Up</label>
      		<div className="login-form">
            <Login/>
            <Signup/>
      		</div>
      	</div>
      </div>
    );
  }
}

export default HomePage
