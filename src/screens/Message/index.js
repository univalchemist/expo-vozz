import React, { Component } from 'react';
import { View, StatusBar, RefreshControl, Dimensions, ScrollView } from 'react-native';
import { Container, Content } from 'native-base';
import Spinner from 'react-native-loading-spinner-overlay';
import CardUserMessage from '../../components/cardUserMessage'
import { connect } from 'react-redux';
import { styles } from './style';
import { TextView } from '../../components/textView';
import { Background } from '../../components/background';

let SCREEN_WIDTH = Dimensions.get('window').width;
class Messages extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: "",
      refreshing: false,
      recorder: false,
      search: '',
      users: [
        { url: '', name: 'Gui Xiao', last: 'This was great', unRead: true },
        { url: 'https://images.pexels.com/photos/1250643/pexels-photo-1250643.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260', name: 'LiGwang', last: 'Not today', unRead: false },
        { url: '', name: 'Roscal Meyun', last: 'This was great', unRead: true },
        { url: 'https://images.pexels.com/photos/1262357/pexels-photo-1262357.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260', name: 'Hong De Shuai', last: 'I am busy', unRead: true },
        { url: '', name: 'Menes', last: 'This was great', unRead: false },
      ],
      flag: false
    };
  }

  componentDidMount() {
    
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
  this.props.navigation.navigate('Chat', {user: item});
}
  render() {
    const { flag, users } = this.state;
    return (
      <Container style={{ paddingTop: StatusBar.currentHeight }}>
        <Background height={200} end={'transparent'} />
        <Spinner
          visible={flag}
          textContent={""}
        />
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

export default connect()(Messages)