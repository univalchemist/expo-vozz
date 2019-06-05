import React, { Component } from 'react';
import {
  ActivityIndicator,
  AsyncStorage,
  View,
} from 'react-native';
import {
  SkypeIndicator,
} from 'react-native-indicators';
import { connect } from 'react-redux';
import { saveAuthdata, fetchLastMoments } from '../actions';
import { getProfile } from '../utils/API/userAction';
import { PRIMARYCOLOR } from '../constants/style';
import { withApollo } from 'react-apollo';
import { registerForPushNotificationsAsync } from '../constants/funcs';

class Login extends Component {
  constructor(props) {
    super(props);
    this.checkauth();
  }

  checkauth = async () => {
    try {
      const user = JSON.parse(await AsyncStorage.getItem('user'));
      const token = await AsyncStorage.getItem('jwt');

      const pushToken = await registerForPushNotificationsAsync();
      console.log({pushToken});
      if (user && token) {

        getProfile(user._id)
          .then((response1) => {
            let data1 = response1.data;
            let apolloClient = this.props.client;
            this.props.dispatch(saveAuthdata({ jwt: token, user: data1 }));
            this.props.dispatch(fetchLastMoments({ jwt: token, user: data1, apolloClient }));
            console.log({ user: data1 });
            AsyncStorage.setItem('user', JSON.stringify(data1));
            this.props.navigation.navigate({
              routeName: 'Home',
            })
          })
          .catch((error) => {
            console.log('>>>>>>>')
            let errorResponse = error.response.data;
            console.log('getProfile error', JSON.stringify(errorResponse));
            let errorCode = errorResponse.statusCode;
            let errorMessage = errorResponse.message;
            this.props.navigation.navigate('Login');
          })


      }
      else {
        this.props.navigation.navigate('Login');
      }
    }
    catch (error) {
      alert(error)
    }
  }

  render() {
    return (
      // <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      //   <ActivityIndicator size="large" />
      // </View>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <SkypeIndicator color={PRIMARYCOLOR.ORANGE} size={40} />
      </View>
    );
  }
}

export default withApollo(connect()(Login))