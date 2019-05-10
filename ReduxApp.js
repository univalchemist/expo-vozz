import React from 'react';
import Spinner from 'react-native-loading-spinner-overlay';
import Recorder from './src/components/recorder';
import Hashtags from './src/components/hashtags';
import Player from './src/components/player';
import { connect } from 'react-redux';
import AppContainer from './src/router/router';

const mapStateToProps = state => {
    return {
        showRecorder: state.recorder.showRecorder,
        hashtags: state.recorder.hashtags,
        player: state.player,
        flag: state.progress.flag
    }
}

const ReduxApp = ({ showRecorder, hashtags, player, flag }) => {
    return [
        <AppContainer key={1} uriPrefix="/app" />,
        <Recorder key={2} show={showRecorder} />,
        <Hashtags key={3} hashtags={hashtags} />,
        <Player key={4} player={player} />,
        <Spinner
            key={5}
            visible={flag}
            textContent={""}
        />
    ]
}

export default connect(mapStateToProps)(ReduxApp)
