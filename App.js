import React from 'react';
import { StyleSheet, YellowBox } from 'react-native';
import { Provider } from 'react-redux'
import { Font, AppLoading } from "expo";
import { ApolloProvider } from 'react-apollo'
import store from './src/store/index'
import ReduxApp from './ReduxApp'
import client from './src/utils/Apollo/setup';
import Backend from './src/utils/Firebase/ChatUtil'
import _ from 'lodash';
export default class YourApp extends React.Component {

  constructor(props) {
    YellowBox.ignoreWarnings(['Setting a timer']);
    const _console = { ...console };
    console.warn = message => {
      if (message.indexOf('Setting a timer') <= -1) {
        _console.warn(message);
      }
    };
    super(props);
    this.state = {
      loading: true
    }
  }
  async componentWillMount() {
    await Font.loadAsync({
      Roboto: require("native-base/Fonts/Roboto.ttf"),
      Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf"),
      futura_bold_font: require("./assets/fonts/Futura-Bold-font.ttf"),
      futura_book_font: require("./assets/fonts/Futura-Book-font.ttf"),
      futura_heavy_font: require("./assets/fonts/Futura-Heavy-font.ttf"),
      futura_light_font: require("./assets/fonts/Futura-Light-font.ttf"),
      futura_medium_font: require("./assets/fonts/futura-medium-bt.ttf"),
    });
    this.setState({ loading: false });
  }
  componentDidMount() {
    // Backend.loadUsers((users) => {
    //   console.log('=============================')
    //   console.log({ App_firebaseMessage: users });
    // });
  }
  componentWillUnmount() {
    // Backend.closeUSersConnection();
  }
  render() {
    if (this.state.loading) {
      return (
        <AppLoading />
      );
    }
    return (
      <ApolloProvider client={client}>
        <Provider store={store}>
          <ReduxApp />
        </Provider>
      </ApolloProvider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
