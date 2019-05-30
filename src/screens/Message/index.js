import React, { Component } from 'react';
import { View, StatusBar, RefreshControl, Dimensions, ScrollView } from 'react-native';
import { Container, Content } from 'native-base';
import {
  SkypeIndicator,
} from 'react-native-indicators';
import CardUserMessage from '../../components/cardUserMessage'
import { connect } from 'react-redux';
import { styles } from './style';
import { TextView } from '../../components/textView';
import { Background } from '../../components/background';
import { withApollo } from 'react-apollo';
import { errorAlert } from '../../utils/API/errorHandle';
import { CHAT_USERS_QUERY } from '../../utils/Apollo/Queries/user';
import { strikethrough } from 'ansi-colors';
import { PRIMARYCOLOR } from '../../constants/style';

let SCREEN_WIDTH = Dimensions.get('window').width;
class Messages extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: "",
      refreshing: false,
      recorder: false,
      search: '',
      users: [],
      flag: false
    };
  }
  componentWillMount() {
    this.getChatList();

  }
  componentDidMount() {
  }
  getChatList = async () => {
    this.setState({ flag: true });
    try {
      let res = await this.props.client.query({ query: CHAT_USERS_QUERY, fetchPolicy: 'network-only' });
      let users = this.removeMe(res.data.users);
      console.log({ users });
      this.setState({ users, flag: false });
    } catch (e) {
      this.setState({ flag: false });
      console.log({ getChatList: e });
      errorAlert('Network error. Please make sure your network is connected.')
    }
  }
  removeMe = (array) => {
    let id = this.props.auth.user._id;
    let filteredArray = array.filter(item => item._id !== id)
    return filteredArray;
  }
  _onRefresh = () => {
    this.setState({ refreshing: true });
    setTimeout(this.setState({ refreshing: false }), 30000)
  }

  updateSearch = (search) => {
    console.log(search)
    this.setState({ search });
  };
  _onTextClear = () => {

  }
  onTapUser = (item) => {
    console.log("onTapUser", item);
    this.props.navigation.navigate('Chat', { user: item });
  }
  render() {
    const { flag, users } = this.state;
    return (
      <Container style={{ paddingTop: StatusBar.currentHeight }}>
        <Background height={200} end={'transparent'} />
        {flag &&
          <View style={styles.progressBar}>
            <SkypeIndicator color={PRIMARYCOLOR.ORANGE} size={40} />
          </View>
        }
        <Content contentContainerStyle={styles.contentStyle}>
          <View style={{ width: SCREEN_WIDTH }}>
            <TextView style={styles.messageTitleStyle} value={'Private Messages'} />
          </View>
          <ScrollView
            scrollEventThrottle={16}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this._onRefresh}
              />
            } style={{ flex: 1 }}>
            <View style={{ width: SCREEN_WIDTH, marginTop: 10, paddingHorizontal: 10 }}>
              {users.map((item, index) => (
                <CardUserMessage key={index} item={item} onPress={this.onTapUser} />
              ))}

            </View>
          </ScrollView>
        </Content>
      </Container>
    )
  }
}
const mapStateToProps = (state) => ({
  auth: state.auth
});
export default withApollo(connect(mapStateToProps)(Messages));