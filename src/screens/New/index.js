import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Asset, Audio, FileSystem, Font, Permissions, LinearGradient } from 'expo';
import { Ionicons } from '@expo/vector-icons';

let SCREEN_WIDTH = Dimensions.get('window').width

class Icon {
  constructor(module, width, height) {
    this.module = module;
    this.width = width;
    this.height = height;
    Asset.fromModule(this.module).downloadAsync();
  }
}

// const ICON_RECORD_BUTTON = new Icon(require('../../assets/images/record_button.png'), 70, 119);
// const ICON_RECORDING = new Icon(require('../../assets/images/record_icon.png'), 20, 14);

// const ICON_PLAY_BUTTON = new Icon(require('../../assets/images/play_button.png'), 34, 51);
// const ICON_PAUSE_BUTTON = new Icon(require('../../assets/images/pause_button.png'), 34, 51);
// const ICON_STOP_BUTTON = new Icon(require('../../assets/images/stop_button.png'), 22, 22);

// const ICON_MUTED_BUTTON = new Icon(require('../../assets/images/muted_button.png'), 67, 58);
// const ICON_UNMUTED_BUTTON = new Icon(require('../../assets/images/unmuted_button.png'), 67, 58);

// const ICON_TRACK_1 = new Icon(require('../../assets/images/track_1.png'), 166, 5);
// const ICON_THUMB_1 = new Icon(require('../../assets/images/thumb_1.png'), 18, 19);
// const ICON_THUMB_2 = new Icon(require('../../assets/images/thumb_2.png'), 15, 19);

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');
const BACKGROUND_COLOR = '#fff';
const LIVE_COLOR = '#FF0000';
const DISABLED_OPACITY = 0.5;
const RATE_SCALE = 3.0;

export default class New extends React.Component {
  constructor(props) {
    super(props);
    this.recording = null;
    this.sound = null;
    this.isSeeking = false;
    this.shouldPlayAtEndOfSeek = false;
    this.state = {
      haveRecordingPermissions: false,
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
      grabaciones: []
    };
    this.recordingSettings = JSON.parse(JSON.stringify(Audio.RECORDING_OPTIONS_PRESET_LOW_QUALITY));
    // // UNCOMMENT THIS TO TEST maxFileSize:
    // this.recordingSettings.android['maxFileSize'] = 12000;
  }

  async componentDidMount() {
    this._askForPermissions();
    const { navigation } = this.props;
    const grabando = navigation.getParam('id', 'NO-ID');
    console.log(grabando)
    this._onRecordPressed()

    const grabaciones = await Expo.FileSystem.readDirectoryAsync( Expo.FileSystem.cacheDirectory  )
    await this.setState({ grabaciones })

  }

  _askForPermissions = async () => {
    const response = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    this.setState({
      haveRecordingPermissions: response.status === 'granted',
    });
  };

  _updateScreenForSoundStatus = status => {
    if (status.isLoaded) {
      this.setState({
        soundDuration: status.durationMillis,
        soundPosition: status.positionMillis,
        shouldPlay: status.shouldPlay,
        isPlaying: status.isPlaying,
        rate: status.rate,
        muted: status.isMuted,
        volume: status.volume,
        shouldCorrectPitch: status.shouldCorrectPitch,
        isPlaybackAllowed: true,
      });
    } else {
      this.setState({
        soundDuration: null,
        soundPosition: null,
        isPlaybackAllowed: false,
      });
      if (status.error) {
        console.log(`FATAL PLAYER ERROR: ${status.error}`);
      }
    }
  };

  _updateScreenForRecordingStatus = status => {
      console.log(status)
    if (status.canRecord) {
      this.setState({
        isRecording: status.isRecording,
        recordingDuration: status.durationMillis,
        
      });
      if (status.durationMillis > 10000 ){
          this.setState({
            isRecording: false,
            recordingDuration: status.durationMillis,
          })
        this._stopRecordingAndEnablePlayback()
        }
    } else if (status.isDoneRecording) {
      this.setState({
        isRecording: false,
        recordingDuration: status.durationMillis,
      });
      if (!this.state.isLoading) {
        this._stopRecordingAndEnablePlayback();
      }
    }
  };

  async _stopPlaybackAndBeginRecording() {
    this.setState({
      isLoading: true,
    });
    if (this.sound !== null) {
      await this.sound.unloadAsync();
      this.sound.setOnPlaybackStatusUpdate(null);
      this.sound = null;
    }
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false
    });
    if (this.recording !== null) {
      this.recording.setOnRecordingStatusUpdate(null);
      this.recording = null;
    }

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(this.recordingSettings);
    recording.setOnRecordingStatusUpdate(this._updateScreenForRecordingStatus);

    this.recording = recording;
    await this.recording.startAsync(); // Will call this._updateScreenForRecordingStatus to update the screen.
    this.setState({
      isLoading: false,
    });
  }

  async _stopRecordingAndEnablePlayback() {
    this.setState({
      isLoading: true,
    });
    try {
      await this.recording.stopAndUnloadAsync();
    } catch (error) {
      // Do nothing -- we are already unloaded.
    }
    const info = await FileSystem.getInfoAsync(this.recording.getURI());
    this.setState({info: info.uri})
    console.log(`FILE INFO: ${JSON.stringify(info)}`);
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      playsInSilentLockedModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false
    });
    const { sound, status } = await this.recording.createNewLoadedSoundAsync(
      {
        isLooping: true,
        isMuted: this.state.muted,
        volume: this.state.volume,
        rate: this.state.rate,
        shouldCorrectPitch: this.state.shouldCorrectPitch,
      },
      this._updateScreenForSoundStatus
    );
    this.sound = sound;
    this.setState({
      isLoading: false,
    });
  }

  _onRecordPressed = () => {
    if (this.state.isRecording) {
      this._stopRecordingAndEnablePlayback();
    } else {
      this._stopPlaybackAndBeginRecording();
    }
  };

  _onPlayPausePressed = () => {
    if (this.sound != null) {
      if (this.state.isPlaying) {
        this.sound.pauseAsync();
      } else {
        this.sound.playAsync();
      }
    }
  };

  _onStopPressed = () => {
    if (this.sound != null) {
      this.sound.stopAsync();
    }
  };

  _onMutePressed = () => {
    if (this.sound != null) {
      this.sound.setIsMutedAsync(!this.state.muted);
    }
  };

  _onVolumeSliderValueChange = value => {
    if (this.sound != null) {
      this.sound.setVolumeAsync(value);
    }
  };

  _trySetRate = async (rate, shouldCorrectPitch) => {
    if (this.sound != null) {
      try {
        await this.sound.setRateAsync(rate, shouldCorrectPitch);
      } catch (error) {
        // Rate changing could not be performed, possibly because the client's Android API is too old.
      }
    }
  };

  _onRateSliderSlidingComplete = async value => {
    this._trySetRate(value * RATE_SCALE, this.state.shouldCorrectPitch);
  };

  _onPitchCorrectionPressed = async value => {
    this._trySetRate(this.state.rate, !this.state.shouldCorrectPitch);
  };

  _onSeekSliderValueChange = value => {
    if (this.sound != null && !this.isSeeking) {
      this.isSeeking = true;
      this.shouldPlayAtEndOfSeek = this.state.shouldPlay;
      this.sound.pauseAsync();
    }
  };

  _onSeekSliderSlidingComplete = async value => {
    if (this.sound != null) {
      this.isSeeking = false;
      const seekPosition = value * this.state.soundDuration;
      if (this.shouldPlayAtEndOfSeek) {
        this.sound.playFromPositionAsync(seekPosition);
      } else {
        this.sound.setPositionAsync(seekPosition);
      }
    }
  };

  _getSeekSliderPosition() {
    if (
      this.sound != null &&
      this.state.soundPosition != null &&
      this.state.soundDuration != null
    ) {
      return this.state.soundPosition / this.state.soundDuration;
    }
    return 0;
  }

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

  _getPlaybackTimestamp() {
    if (
      this.sound != null &&
      this.state.soundPosition != null &&
      this.state.soundDuration != null
    ) {
      return `${this._getMMSSFromMillis(this.state.soundPosition)} / ${this._getMMSSFromMillis(
        this.state.soundDuration
      )}`;
    }
    return '';
  }

  _getRecordingTimestamp() {
    if (this.state.recordingDuration != null) {
      return `${this._getMMSSFromMillis(this.state.recordingDuration)}`;
    }
    return `${this._getMMSSFromMillis(0)}`;
  }

  descartarGrabacion = async () => {
    this._stopPlaybackAndBeginRecording()
}
finalizarGrabacion = async () => {
    this.setState({audiobueno:true})
    console.log(this.state.info)
}

subirGrabacion = async () => {
    const body = new FormData();
    //body.append("refId", this.props.user._id);
    //body.append("ref", "user" );
    //body.append("field", "picture");
    //body.append("source", "users-permissions");
    // const file = await Expo.FileSystem.getInfoAsync(this.state.uriGrabacion)
    const file = this.state.info
    const ext = file.split(".").slice(-1)[0]
    console.log(ext)
    body.append('files', { 
        uri: file, 
        name: "audio." + ext, 
        type: 'multipart/form-data' 
    });

    const request = await fetch("http://54.229.154.93:1337/upload", {
        method: "POST",
        // headers: {
        //     "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YjlkNjdjZGRlM2Y3ZDEzNDUxMTg1ODAiLCJpYXQiOjE1NDQ0NDAzMTgsImV4cCI6MTU0NzAzMjMxOH0.ane3VAF8dYNGVBSx04_fFZMtJRr2xRSOrhser1Eq7hU",
        //     "Content-Type": 'multipart/form-data'
        // },
        body
    })

    if( request.status >= 400 ){
        alert("Ocurrió un error durante la subida del audio")
    }
    else{
        alert("El audio se ha subido correctamente")
        this.setState({ status: "descartado", duracion: "00:00", puntero: 0, nuevaGrabacion: true })
    }
}


  render() {
    return !this.state.haveRecordingPermissions ? (
      <View style={styles.container}>
        <View />
        <Text style={[styles.noPermissionsText]}>
          You must enable audio recording permissions in order to use this app.
        </Text>
        <View />
      </View>
    ) : (
    <View style={{flex:1}}>
      <View style={{flex:1, alignItems:'center', justifyContent: 'center' }}>
        {/* <View style={[{  opacity: this.state.isLoading ? DISABLED_OPACITY : 1.0,}]}>
            <TouchableHighlight
              underlayColor={BACKGROUND_COLOR}
              style={styles.wrapper}
              onPress={this._onRecordPressed}
              disabled={this.state.isLoading}>
              <Image style={styles.image} source={ICON_RECORD_BUTTON.module} />
            </TouchableHighlight>
        </View> */}
        
        
        {/* <View
          style={[
            styles.halfScreenContainer,
            {
              opacity:
                !this.state.isPlaybackAllowed || this.state.isLoading ? DISABLED_OPACITY : 1.0,
            },
          ]}>
          <View />
          <View style={styles.playbackContainer}>
            <Slider
              style={styles.playbackSlider}
              trackImage={ICON_TRACK_1.module}
              thumbImage={ICON_THUMB_1.module}
              value={this._getSeekSliderPosition()}
              onValueChange={this._onSeekSliderValueChange}
              onSlidingComplete={this._onSeekSliderSlidingComplete}
              disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
            />
            <Text style={[styles.playbackTimestamp]}>
              {this._getPlaybackTimestamp()}
            </Text>
          </View>
          <View style={[styles.buttonsContainerBase, styles.buttonsContainerTopRow]}>
            <View style={styles.volumeContainer}>
              <TouchableHighlight
                underlayColor={BACKGROUND_COLOR}
                style={styles.wrapper}
                onPress={this._onMutePressed}
                disabled={!this.state.isPlaybackAllowed || this.state.isLoading}>
                <Image
                  style={styles.image}
                  source={this.state.muted ? ICON_MUTED_BUTTON.module : ICON_UNMUTED_BUTTON.module}
                />
              </TouchableHighlight>
              <Slider
                style={styles.volumeSlider}
                trackImage={ICON_TRACK_1.module}
                thumbImage={ICON_THUMB_2.module}
                value={1}
                onValueChange={this._onVolumeSliderValueChange}
                disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
              />
            </View>
            <View style={styles.playStopContainer}>
              <TouchableHighlight
                underlayColor={BACKGROUND_COLOR}
                style={styles.wrapper}
                onPress={this._onPlayPausePressed}
                disabled={!this.state.isPlaybackAllowed || this.state.isLoading}>
                <Image
                  style={styles.image}
                  source={this.state.isPlaying ? ICON_PAUSE_BUTTON.module : ICON_PLAY_BUTTON.module}
                />
              </TouchableHighlight>
              <TouchableHighlight
                underlayColor={BACKGROUND_COLOR}
                style={styles.wrapper}
                onPress={this._onStopPressed}
                disabled={!this.state.isPlaybackAllowed || this.state.isLoading}>
                <Image style={styles.image} source={ICON_STOP_BUTTON.module} />
              </TouchableHighlight>
            </View>
            <View />
          </View>
          <View style={[styles.buttonsContainerBase, styles.buttonsContainerBottomRow]}>
            <Text style={[styles.timestamp]}>Rate:</Text>
            <Slider
              style={styles.rateSlider}
              trackImage={ICON_TRACK_1.module}
              thumbImage={ICON_THUMB_1.module}
              value={this.state.rate / RATE_SCALE}
              onSlidingComplete={this._onRateSliderSlidingComplete}
              disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
            />
            <TouchableHighlight
              underlayColor={BACKGROUND_COLOR}
              style={styles.wrapper}
              onPress={this._onPitchCorrectionPressed}
              disabled={!this.state.isPlaybackAllowed || this.state.isLoading}>
              <Text>
                PC: {this.state.shouldCorrectPitch ? 'yes' : 'no'}
              </Text>
            </TouchableHighlight>
          </View>
          <View />
        </View> */}

            {/* <LottieView
                style={{width:300, height:300, backgroundColor:'white', alignSelf:'center'}}
                source={require('../../assets/animation/ripple.json')}
                autoPlay
                loop
            />  */}


            {/*
              <TouchableHighlight
                underlayColor={BACKGROUND_COLOR}
                style={styles.wrapper}
                onPress={this._onStopPressed}
                disabled={!this.state.isPlaybackAllowed || this.state.isLoading}>
                <Image style={styles.image} source={ICON_STOP_BUTTON.module} />
              </TouchableHighlight>
            </View> */}

            <LinearGradient colors={['red', '#ED3A17']} style={{marginBottom:20,borderRadius:25, height:50, width: this.state.isRecording ? 80 : SCREEN_WIDTH-40 , alignSelf: 'center', alignItems:'center',justifyContent:'center' , flexDirection:'row'}}>
                
                <TouchableOpacity 
                onPress={() => this.descartarGrabacion()} 
                style={{ opacity: this.state.isRecording ? 0.0 : 1.0, position: 'absolute', left:10, width:45, height:45, justifyContent:'center', alignItems:'center'}}>
                    <Ionicons name={'ios-trash'} size={30} color={'white'} />
                </TouchableOpacity>

                <TouchableOpacity style={{ opacity: this.state.isRecording ? 0.0 : 1.0, width:45, height:45, justifyContent:'center', alignItems:'center'}}>
                    <Ionicons name={'ios-rewind'} size={30} color={'white'} />
                </TouchableOpacity>
                { this.state.isRecording ? 
                <LinearGradient colors={['red', '#ED3A17']} style={{width:100, height:100, padding:10, borderRadius:50 }}>
                    <TouchableOpacity 
                        onPress={this._onRecordPressed}
                        disabled={this.state.isLoading} 
                        style={{backgroundColor:'#fff', width:80, height:80, borderRadius:40, alignItems: 'center', justifyContent:'center'}}>
                        <Ionicons name={ this.state.isRecording ? 'ios-square' : 'ios-microphone'} size={60} color={'#ED3A17'} />
                    </TouchableOpacity>
                </LinearGradient> 
                : 
                <LinearGradient colors={['red', '#ED3A17']} style={{width:100, height:100, padding:10, borderRadius:50 }}>
                    <TouchableOpacity 
                        onPress={this._onPlayPausePressed}
                        disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
                        style={{backgroundColor:'#fff', width:80, height:80, borderRadius:40, alignItems: 'center', justifyContent:'center'}}>
                        <Ionicons name={ this.state.isPlaying ? 'ios-pause' : 'ios-play'} size={60} color={'#ED3A17'} />
                    </TouchableOpacity>
                </LinearGradient>
                
                }
                <TouchableOpacity style={{ opacity: this.state.isRecording ? 0.0 : 1.0, width:45, height:45, justifyContent:'center', alignItems:'center'}}>
                    <Ionicons name={'ios-fastforward'} size={30} color={'white'} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.subirGrabacion()} style={{position: 'absolute', right:10,  width: this.state.isRecording ? 0 : 45, height: this.state.isRecording ? 0 : 45, justifyContent:'center', alignItems:'center', opacity: this.state.isRecording ? 0.0 : 1.0}}>
                    <Ionicons name={'ios-checkmark-circle-outline'} size={30} color={'white'} />
                </TouchableOpacity>
            </LinearGradient>

        <Text style={[{fontSize:40, marginTop:50}]}>
            {this._getRecordingTimestamp()}
        </Text>
        </View>


        {/* <ScrollView style={{flex:1}}>
        <View style={{ flexDirection: "row", justifyContent: "center", flexWrap: "wrap" }}>
            {this.state.grabaciones.map((a, i) => (
                <TouchableHighlight key={i} style={{ padding: 5 }} onPress={() => this.reproducirTest(a)}>
                    <View >
                        <Text>{ a }</Text>
                    </View>
                </TouchableHighlight>
            ))}
            </View>
        </ScrollView> */}

      </View>
    );
  }
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignSelf: 'stretch',
    backgroundColor: BACKGROUND_COLOR,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: BACKGROUND_COLOR,
    minHeight: DEVICE_HEIGHT,
    maxHeight: DEVICE_HEIGHT,
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
    minHeight: DEVICE_HEIGHT / 2.0,
    maxHeight: DEVICE_HEIGHT / 2.0,
  },
  recordingContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
    // minHeight: ICON_RECORD_BUTTON.height,
    // maxHeight: ICON_RECORD_BUTTON.height,
  },
  recordingDataContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    // minHeight: ICON_RECORD_BUTTON.height,
    // maxHeight: ICON_RECORD_BUTTON.height,
    // minWidth: ICON_RECORD_BUTTON.width * 3.0,
    // maxWidth: ICON_RECORD_BUTTON.width * 3.0,
  },
  recordingDataRowContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // minHeight: ICON_RECORDING.height,
    // maxHeight: ICON_RECORDING.height,
  },
  playbackContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
    // minHeight: ICON_THUMB_1.height * 2.0,
    // maxHeight: ICON_THUMB_1.height * 2.0,
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
    // maxHeight: ICON_MUTED_BUTTON.height,
    alignSelf: 'stretch',
    paddingRight: 20,
  },
  playStopContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // minWidth: (ICON_PLAY_BUTTON.width + ICON_STOP_BUTTON.width) * 3.0 / 2.0,
    // maxWidth: (ICON_PLAY_BUTTON.width + ICON_STOP_BUTTON.width) * 3.0 / 2.0,
  },
  volumeContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: DEVICE_WIDTH / 2.0,
    maxWidth: DEVICE_WIDTH / 2.0,
  },
  volumeSlider: {
    // width: DEVICE_WIDTH / 2.0 - ICON_MUTED_BUTTON.width,
  },
  buttonsContainerBottomRow: {
    // maxHeight: ICON_THUMB_1.height,
    alignSelf: 'stretch',
    paddingRight: 20,
    paddingLeft: 20,
  },
  rateSlider: {
    width: DEVICE_WIDTH / 2.0,
  },
});