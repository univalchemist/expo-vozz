import React from 'react';
import { StyleSheet, YellowBox } from 'react-native';
import { Provider } from 'react-redux'
import { Font, AppLoading, Notifications } from "expo";
import { ApolloProvider } from 'react-apollo'
import NotificationPopup from 'react-native-push-notification-popup';
import store from './src/store/index'
import ReduxApp from './ReduxApp'
import client from './src/utils/Apollo/setup';
import _ from 'lodash';
import images from './assets';
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
      loading: true,
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
    console.log("App didmount")
    this._notificationSubscription = Notifications.addListener(this._handleNotification);
  }
  componentWillUnmount() {
    console.log("App WillUnmount")
  }
  _handleNotification = (notification) => {
    console.log({ notification });
    if (notification.remote == true && notification.origin == 'received') {

      this.popup.show({
        onPress: function () { console.log('Pressed') },
        appIconSource: images.appIcon,
        appTitle: 'Vozz',
        timeText: 'Now',
        title: notification.data.title,
        body: notification.data.body
      });

    }

  };
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
          <NotificationPopup ref={ref => this.popup = ref} />
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
