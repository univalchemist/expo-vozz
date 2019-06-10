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
import { CHAT_USERS_QUERY, CHAT_LIST_USERS } from '../../utils/Apollo/Queries/user';
import { PRIMARYCOLOR } from '../../constants/style';
import Backend from '../../utils/Firebase/ChatUtil';

let SCREEN_WIDTH = Dimensions.get('window').width;
class Messages extends Component {
  constructor(props) {
    super(props);

    this.state = {
      text: "",
      refreshing: false,
      flag: false,
      chatList: this.props.chatList,
      chatListKeys: this.props.chatListKeys,
      chatListProfile: null
    };
    this.getChatListProfile(this.props.chatListKeys);
  }
  componentWillMount() {
  }
  componentDidMount() {
  }
  componentWillUnmount() {
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.chatListKeys !== this.props.chatListKeys) {

      this.setState({
        chatListKeys: nextProps.chatListKeys
      });
      this.getChatListProfile(nextProps.chatListKeys);
    }
  }
  getChatListProfile = async (chatListKeys) => {
    if (chatListKeys == null || chatListKeys.length == 0) return;
    let keys = [];
    chatListKeys.map(k => keys.push(k.key));
    console.log({ keys });
    try {
      let res = await this.props.client.query({ query: CHAT_LIST_USERS, fetchPolicy: 'network-only', variables: { ids: keys } });
      let lists = res.data.users;
      console.log({ lists });
      this.setState({
        chatListProfile: lists
      });
    } catch (e) {
      this.props.dispatch(updateProgressFlag(false));
      console.log({ getChatListProfile: e });
      errorAlert('Network error. Please make sure your network is connected.')
    }
  }
  userMessage = (userId) => {
    const { chatListKeys } = this.state;
    let filteredArray = chatListKeys.filter(item => item.key == userId);
    const last = filteredArray[0]['messages'][filteredArray[0].messages.length - 1]['message']['text'];
    const unRead = filteredArray[0].unRead;
    const createdAt = filteredArray[0]['messages'][filteredArray[0].messages.length - 1]['message']['createdAt'];
    return ({ last, unRead, createdAt });
  }
  _onRefresh = () => {
    this.setState({ refreshing: true });
    setTimeout(this.setState({ refreshing: false }), 30000)
  }
  onTapUser = (user) => {
    console.log("onTapUser", user);
    this.props.navigation.navigate('Chat', { user: user });
  }
  render() {
    const { flag, chatList, chatListProfile } = this.state;
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
              {chatListProfile != null && chatListProfile.map((item, index) => (
                <CardUserMessage key={index} user={item} message={this.userMessage(item._id)} onPress={this.onTapUser} />
              ))}

            </View>
          </ScrollView>
        </Content>
      </Container>
    )
  }
}
const mapStateToProps = (state) => ({
  auth: state.auth,
  chatList: state.messages.chatList,
  chatListKeys: state.messages.chatListKeys

});
export default withApollo(connect(mapStateToProps)(Messages));