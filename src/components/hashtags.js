import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput
} from 'react-native';
import { LinearGradient, BlurView } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import { connect } from 'react-redux';
import { uploadRecording, showHashtags } from '../actions/index'
import { FONT, DEVICE } from '../constants/style';
import { withApollo } from 'react-apollo';




class Hashtags extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hashtags: [],
      writingHash: "",
    }
  }

  cancelProgress = () => {
    this.props.dispatch(showHashtags({ show: false }));
  }

  uploadRecording = async () => {

    const { writingHash } = this.state;
    if (writingHash == '' || writingHash == undefined || writingHash == null) {
      return;
    }
    let temp = writingHash.split('#');
    temp.splice(0, 1);
    let tags_temp = [];
    temp.map(item => {
      tags_temp.push(item.split(" ")[0].replace(/[^a-zA-Z]/g, ''))
    })

    this.props.dispatch(uploadRecording({
      hashtags: tags_temp,
      auth: this.props.auth,
      file: this.props.hashtags.file,
      title: writingHash,
      client: this.props.client
    }))
    this.setState({ writingHash: '' })
  }


  render() {
    return (
      (!this.props.hashtags || !this.props.hashtags.show) ? null :
        <BlurView tint="dark" intensity={80} style={styles.container}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <LinearGradient colors={['red', '#ED3A17']} style={{
              marginBottom: 20,
              borderRadius: 25,
              height: 50,
              width: DEVICE.WIDTH - 40,
              alignSelf: 'center',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexDirection: 'row'
            }}
            >
              <TextInput
                autoCapitalize="none"
                style={{
                  marginLeft: 3,
                  height: 45,
                  backgroundColor: "white",
                  width: DEVICE.WIDTH - 100,
                  borderTopLeftRadius: 25,
                  borderTopRightRadius: 5,
                  borderBottomRightRadius: 5,
                  borderBottomLeftRadius: 25,
                  paddingHorizontal: 20,
                  fontFamily: FONT.MEDIUM
                }}
                placeholder={'Title #tag1 #tag2'}
                onChangeText={writingHash => this.setState({ writingHash })}
                value={this.state.writingHash}
              />

              <TouchableOpacity onPress={() => this.cancelProgress()} style={{ position: 'absolute', right: 10, width: 45, height: 45, justifyContent: 'center', alignItems: 'center', opacity: 1.0 }}>
                <Ionicons name={'ios-close-circle-outline'} size={30} color={'white'} />
              </TouchableOpacity>
            </LinearGradient>

            <TouchableOpacity onPress={() => this.uploadRecording()}>
              <LinearGradient
                colors={['red', '#ED3A17']}
                style={{ borderRadius: 25, paddingHorizontal: 20, paddingVertical: 10, marginRight: 5 }}
              >
                <Text style={{ color: "white", fontSize: 18, fontFamily: FONT.MEDIUM }}>Save hashtags</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </BlurView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: 'rgba(0,0,0,0.9)',
    height: DEVICE.HEIGHT,
    width: DEVICE.WIDTH
  }
});
const mapStateToProps = state => ({
  auth: state.auth,
  hashtags: state.recorder.hashtags
})

export default withApollo(connect(mapStateToProps)(Hashtags))