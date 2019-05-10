import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import {
  LayoutAnimation,
  StyleSheet,
  Text,
  View,
  WebView,
} from 'react-native';

const array200 = Array(200).fill(0); // Array of length 200 filled with 0s

class WaveForm extends Component {
  state = {
    frequencyData: Array(200).fill(0),
  };
  
  frameId = null
  componentDidMount(){
      console.log(this.props.source)
  }

  onData = (frenquencyData) => {
    if (this.frameId) {
       cancelAnimationFrame(this.frameId);
    }
    this.frameId  = requestAnimationFrame(() => {
       LayoutAnimation.configureNext(LayoutAnimation.Presets.linear); // or LayoutAnimation.linear()
       this.setState({ frequencyData })
    })
  }

  render() {
    return (
      <View>
        {this.state.frequencyData.length > 0 &&
          <View style={styles.waveFormContainer}>
            {array200.map((height, index) =>
              <View
                key={index}
                style={[
                  styles.bar,
                  {
                    width: 1,
                    height: this.state.frequencyData[index] / 4,
                    backgroundColor: 'white',
                    marginLeft: 1,
                  },
                ]}
              />,
            )}
          </View>}
          <Analyser onData={this.onData} />
      </View>
    );
  }
}


class Analyser extends React.PureComponent {
 

render () {
 return (
  <WebView
          source={{
            html: `<audio id="audioElement" src="${this.props.source}" />`,
          }}
          injectedJavaScript={`
// Initialize variables
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var audioElement = document.getElementById('audioElement');
var audioSrc = audioCtx.createMediaElementSource(audioElement);
var analyser = audioCtx.createAnalyser();
// Bind our analyser to the media element source.
audioSrc.connect(analyser);
audioSrc.connect(audioCtx.destination);
// This array will hold all the analyser's data
var frequencyData = new Uint8Array(200);
// Continuously loop and update chart with frequency data.
function renderChart() {
  requestAnimationFrame(renderChart);
  // Copy frequency data to frequencyData array.
  analyser.getByteFrequencyData(frequencyData);
  // Send message to React Native
  window.postMessage(frequencyData);
}
// Run the loop
renderChart();
audioElement.play();
          `}
          onMessage={event => {
            this.props.onData(JSON.parse(`[${event.nativeEvent.data}]`))
          }}
          style={styles.webView}
        />
)

}

}

WaveForm.propTypes = {};

export default WaveForm;

const styles = StyleSheet.create({
  waveFormContainer: {
    width: 320,
    height: 100,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  webView: {
    width: 0,
    height: 0,
  },
});