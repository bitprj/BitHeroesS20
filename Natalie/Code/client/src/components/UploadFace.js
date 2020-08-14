import React from 'react';
import FaceImage from './FormFolder/FaceImage'
import EmotionDisplay from './FaceDetails/EmotionDisplay'
import SongPage from './SongFolder/SongPage'
import UserProfile from './FaceDetails/UserProfile'
import Cam from './FormFolder/Webcam'


class UploadFace extends React.Component {
  constructor(){
    super()
    
    this.state = {
      submitted: false,
      img: '',
      emotions: null,
      token: "",
      findSongs: false,
      loading: false,
      userInfo: [],
      showFormButton: false
    }

    this.submitForm = this.submitForm.bind(this)
  }

  componentDidMount(){
    const params = this.getHashParams();
    this.setState({token: params.access_token})
  
    fetch('https://api.spotify.com/v1/me',{
      method: 'GET',
      headers: { 'Authorization' : 'Bearer ' + params.access_token}
    }).then(resp => resp.json()).then(data => this.setState({userInfo: [data.display_name, data.id]}))
    //this.setState({userInfo: [resp.display_name, resp.id]})
  }

  getHashParams() {
    console.log('in hash params')
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while (e = r.exec(q)) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }

  handleCapture = (imgSrc) => {
    //console.log(imgSrc)
    this.setState({ 
      img: imgSrc ,
      showFormButton: true
    });
  }

  retake = () => {
    this.setState({
      submitted: false,
      showFormButton: false,
      img: null
    })
  }

  async submitForm(event){   
    this.setState({loading: true})
    event.stopPropagation();
    event.preventDefault();

    var payload = this.state.img;

    const resp = await fetch("https://songrecapp.azurewebsites.net/api/SongRecTrigger", {
      method: 'POST',
      body: payload
    })

    var data = await resp.json();
    
    if (data.result.length !== 0){
      var emotions = data.result[0].faceAttributes.emotion;  
      console.log(emotions)

      console.log('submitform')
      this.setState(() => {
        return{
          emotions: emotions,
          submitted: true,
          loading: false
        }
      }) 
    } else{
      this.setState(() => {
        return{
          loading: false
        }
      }) 
    }
  }

  render(){
    
    if(this.state.submitted){
      console.log('form submitted')
      return(
        <div className='page'>
          <div className="img-side">
            <div className='profile-container'>
              <UserProfile userInfo={this.state.userInfo}/>
              <FaceImage faceImg={this.state.img}/>
              <button className="green-btn" onClick={() => this.retake()}>Retake pic</button>
            </div>
            <EmotionDisplay emotions={this.state.emotions} />
            
          </div>
          <SongPage emotions={this.state.emotions} token={this.state.token} id={this.state.userInfo[1]}/>
        </div>
      )
    }
    else if (this.state.loading){
      return <h2>Plz wait...</h2>
    }
    
    return (
      <div>
        <UserProfile userInfo={this.state.userInfo}/>
        <Cam 
          submit={this.submitForm} 
          handleCapture={this.handleCapture}
          img={this.state.img}
          showButton={this.state.showFormButton}
          />
      </div>
    )
  }
}

export default UploadFace;
