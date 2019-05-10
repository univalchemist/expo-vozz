import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Asset, LinearGradient, BlurView } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import { connect } from 'react-redux';
import { showPlayer } from '../actions/index'
import { DEVICE } from '../constants/style';
// import WaveForm from '../components/waveform';

class Icon {
  constructor(module, width, height) {
    this.module = module;
    this.width = width;
    this.height = height;
    Asset.fromModule(this.module).downloadAsync();
  }
}

const BACKGROUND_COLOR = '#fff';
const LIVE_COLOR = '#FF0000';

const mapStateToProps = state => ({
  auth: state.auth,
})

class Player extends React.Component {
  constructor(props) {
    super(props);
    this.isSeeking = false;
    this.shouldPlayAtEndOfSeek = false;
    this.state = {
      isLoading: false,
      isPlaybackAllowed: false,
      muted: false,
      soundPosition: null,
      soundDuration: null,
      recordingDuration: null,
      shouldPlay: false,
      isPlaying: false,
      isRecording: false,
      fontLoaded: false,
      shouldCorrectPitch: true,
      volume: 1.0,
      rate: 1.0,
      info:''
    };
    player = new Expo.Audio.Sound()
  }

  async componentDidMount() {

  }

  async componentDidUpdate(prevProps){
    if( prevProps.player !== this.props.player){
      if( ![null, undefined].includes(this.props.player.audio)){
        try {
          await player.unloadAsync();
          await player.loadAsync({ uri: this.props.player.audio });
          await player.playAsync();
          this.setState({ isPlaying: true })
        } catch (error) {
          console.log(error)
        }
      }
    }
  }

  _getRecordingTimestamp() {
    if (this.state.recordingDuration != null) {
      return `${this._getMMSSFromMillis(this.state.recordingDuration)}`;
    }
    return `${this._getMMSSFromMillis(0)}`;
  }

  _onRecordPressed = () => {
    if (this.state.isRecording) {
      this._stopRecordingAndEnablePlayback();
    } else {
      this._stopPlaybackAndBeginRecording();
    }
  };

  _onPlayPausePressed = () => {
    console.log()
    if (player != null) {
      if (this.state.isPlaying) {
        player.pauseAsync();
        this.setState({ isPlaying: false })
      } else {
        player.playAsync();
        this.setState({ isPlaying: true })
      }
    }
  };

  _getMMSSFromMillis(millis) {
    const totalSeconds = millis / 1000;
    const seconds = Math.floor(totalSeconds % 60);
    const minutes = Math.floor(totalSeconds / 60);

    const padWithZero = number => {
      const string = number.toString();
      if (number < 10) {
        return '0' + string;
      }
      return string;
    };
    return padWithZero(minutes) + ':' + padWithZero(seconds);
  }


  render() {
    return ( !this.props.player.show ? null :
      <BlurView tint="dark" intensity={80} style={styles.container}>
        <View style={{flex:1, alignItems:'center', justifyContent: 'center' }}>
          <LinearGradient colors={['red', '#ED3A17']} style={{marginBottom:20,borderRadius:25, height:50, width: this.state.isRecording ? 80 : DEVICE.WIDTH-40 , alignSelf: 'center', alignItems:'center',justifyContent:'center' , flexDirection:'row'}}>

            <TouchableOpacity 
              onPress={() => this.props.dispatch(showPlayer({ show: false, audio: null }))}
              style={{ opacity: 1.0, position: 'absolute', left:10, width:45, height:45, justifyContent:'center', alignItems:'center'}}>
                  <Ionicons name={'ios-close'} size={30} color={'white'} />
            </TouchableOpacity>

            <LinearGradient colors={['red', '#ED3A17']} style={{width:100, height:100, padding:10, borderRadius:50 }}>
              <TouchableOpacity 
                onPress={() => this._onPlayPausePressed()}
                //disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
                style={{backgroundColor:'#fff', width:80, height:80, borderRadius:40, alignItems: 'center', justifyContent:'center'}}>
                <Ionicons name={ this.state.isPlaying ? 'ios-pause' : 'ios-play'} size={60} color={'#ED3A17'} />
              </TouchableOpacity>
            </LinearGradient>

            <TouchableOpacity style={{position: 'absolute', right:10,  width: 45, height: 45, justifyContent:'center', alignItems:'center', opacity: 1.0}}>
              <Ionicons name={'ios-thumbs-up'} size={30} color={'white'} />
            </TouchableOpacity>
          </LinearGradient>

          <Text style={[{fontSize:40, color:'white', marginTop:50}]}>
              {this._getRecordingTimestamp()}
          </Text>
        </View>
      </BlurView>
    )
  }
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignSelf: 'stretch',
    backgroundColor: BACKGROUND_COLOR,
  },
  container: {
    position:'absolute',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: 'rgba(0,0,0,0.9)',
    height:DEVICE.HEIGHT,
    width: DEVICE.WIDTH
  },
  noPermissionsText: {
    textAlign: 'center',
  },
  wrapper: {},
  halfScreenContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
    minHeight: DEVICE.HEIGHT / 2.0,
    maxHeight: DEVICE.HEIGHT / 2.0,
  },
  recordingContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
    //minHeight: ICON_RECORD_BUTTON.height,
    //maxHeight: ICON_RECORD_BUTTON.height,
  },
  recordingDataContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    //minHeight: ICON_RECORD_BUTTON.height,
    //maxHeight: ICON_RECORD_BUTTON.height,
    //minWidth: ICON_RECORD_BUTTON.width * 3.0,
    //maxWidth: ICON_RECORD_BUTTON.width * 3.0,
  },
  recordingDataRowContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    //minHeight: ICON_RECORDING.height,
    //maxHeight: ICON_RECORDING.height,
  },
  playbackContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
    //minHeight: ICON_THUMB_1.height * 2.0,
    //maxHeight: ICON_THUMB_1.height * 2.0,
  },
  playbackSlider: {
    alignSelf: 'stretch',
  },
  liveText: {
    color: LIVE_COLOR,
  },
  recordingTimestamp: {
    paddingLeft: 20,
  },
  playbackTimestamp: {
    textAlign: 'right',
    alignSelf: 'stretch',
    paddingRight: 20,
  },
  image: {
    backgroundColor: BACKGROUND_COLOR,
  },
  textButton: {
    backgroundColor: BACKGROUND_COLOR,
    padding: 10,
  },
  buttonsContainerBase: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonsContainerTopRow: {
    //maxHeight: ICON_MUTED_BUTTON.height,
    alignSelf: 'stretch',
    paddingRight: 20,
  },
  playStopContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    //minWidth: (ICON_PLAY_BUTTON.width + ICON_STOP_BUTTON.width) * 3.0 / 2.0,
    //maxWidth: (ICON_PLAY_BUTTON.width + ICON_STOP_BUTTON.width) * 3.0 / 2.0,
  },
  volumeContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: DEVICE.WIDTH / 2.0,
    maxWidth: DEVICE.WIDTH / 2.0,
  },
  volumeSlider: {
    //width: DEVICE_WIDTH / 2.0 - ICON_MUTED_BUTTON.width,
  },
  buttonsContainerBottomRow: {
    //maxHeight: ICON_THUMB_1.height,
    alignSelf: 'stretch',
    paddingRight: 20,
    paddingLeft: 20,
  },
  rateSlider: {
    width: DEVICE.WIDTH / 2.0,
  },
});

export default connect(mapStateToProps)(Player)