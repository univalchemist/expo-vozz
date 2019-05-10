import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Asset, Audio, FileSystem, Permissions, LinearGradient, BlurView } from 'expo';
import { AsyncStorage } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { connect } from 'react-redux';
import { showRecorder, showHashtags } from '../actions/index'
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
const RATE_SCALE = 3.0;
const recordingOption = {
  android: {
    extension: '.m4a',
    outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
    audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
  },
  ios: {
    extension: '.m4a',
    outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
    audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MIN,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
})

class Recorder extends React.Component {
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
      grabaciones: [],
      info: '',
    };
    this.recordingSettings = JSON.parse(JSON.stringify(recordingOption));
  }

  async componentDidMount() {
    this._askForPermissions();
    const grabaciones = await Expo.FileSystem.readDirectoryAsync(Expo.FileSystem.cacheDirectory)
    const user = JSON.parse(await AsyncStorage.getItem("usrLoginInfo"))
    await this.setState({ grabaciones, user })
  }

  componentDidUpdate(prevProps) {
    //console.log({ type: "componentDidUpdate", props: this.props })
    if (prevProps.show !== this.props.show && this.props.show === true) {
      this._onRecordPressed()
    }
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
    //console.log(status)
    if (status.canRecord) {
      this.setState({
        isRecording: status.isRecording,
        recordingDuration: status.durationMillis,

      });
      if (status.durationMillis > 10000) {
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

  async _discartRecording() {
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
    //this.props.handler()
    this.props.dispatch(showRecorder(false))
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
    this.setState({ info: info.uri })
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
    // console.log(this.state.info)
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
    this.setState({ audiobueno: true })
    //console.log(this.state.info)
  }

  uploadRecord = async () => {
    console.log(this.props.auth)
    const file = this.state.info;
    this.props.dispatch(showRecorder(false))
    this.props.dispatch(showHashtags({ show: true, file: file }))
  }

  render() {
    const { title } = this.state;
    return !this.state.haveRecordingPermissions ? (
      <View style={styles.container}>
        <View />
        <Text style={[styles.noPermissionsText]}>
          You must enable audio recording permissions in order to use this app.
          </Text>
        <View />
      </View>
    ) : (!this.props.show ? null :
      <BlurView tint="dark" intensity={80} style={styles.container}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <View
            style={{
              backgroundColor: 'red',
              borderRadius: 25,
              height: 50,
              width: this.state.isRecording ? 80 : DEVICE.WIDTH - 40,
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row'
            }}>
            <TouchableOpacity
              onPress={() => this._discartRecording()}
              // onPress={() => this.props.handler()} 
              style={{
                opacity: this.state.isRecording ? 0.0 : 1.0,
                position: 'absolute',
                left: 10,
                width: 45,
                height: 45,
                justifyContent: 'center',
                alignItems: 'center'
              }}>
              <Ionicons name={'ios-trash'} size={30} color={'white'} />
            </TouchableOpacity>

            {this.state.isRecording ?
              <LinearGradient
                colors={['red', '#ED3A17']}
                style={{
                  width: 100,
                  height: 100,
                  padding: 10,
                  borderRadius: 50
                }}>
                <TouchableOpacity
                  onPress={this._onRecordPressed}
                  disabled={this.state.isLoading}
                  style={{ backgroundColor: '#fff', width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name={this.state.isRecording ? 'ios-square' : 'ios-microphone'} size={60} color={'#ED3A17'} />
                </TouchableOpacity>
              </LinearGradient>
              :
              <View
                style={{
                  backgroundColor: 'red',
                  position: 'absolute',
                  width: 100,
                  height: 100,
                  padding: 10,
                  borderRadius: 50
                }}>
                <TouchableOpacity
                  onPress={this._onPlayPausePressed}
                  disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
                  style={{ backgroundColor: '#fff', width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name={this.state.isPlaying ? 'ios-pause' : 'ios-play'} size={60} color={'#ED3A17'} />
                </TouchableOpacity>
              </View>
            }
            <TouchableOpacity onPress={() => this.uploadRecord()} style={{ position: 'absolute', right: 10, width: this.state.isRecording ? 0 : 45, height: this.state.isRecording ? 0 : 45, justifyContent: 'center', alignItems: 'center', opacity: this.state.isRecording ? 0.0 : 1.0 }}>
              <Ionicons name={'ios-checkmark-circle-outline'} size={30} color={'white'} />
            </TouchableOpacity>
          </View>

          <Text style={[{ fontSize: 40, color: 'white', marginTop: 50 }]}>
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
    position: 'absolute',
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    height: DEVICE.HEIGHT,
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
    minWidth: DEVICE / 2.0,
    maxWidth: DEVICE.WIDTH / 2.0,
  },
  volumeSlider: {
    //width: DEVICE.WIDTH / 2.0 - ICON_MUTED_BUTTON.width,
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

export default connect(mapStateToProps)(Recorder)