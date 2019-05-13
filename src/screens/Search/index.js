import React, { Component } from 'react';
import { StatusBar, Dimensions } from 'react-native';
import { Container, Content, Tab, Tabs, ScrollableTab } from 'native-base';
import Spinner from 'react-native-loading-spinner-overlay';
// import { SearchBar } from 'react-native-elements';
import { connect } from 'react-redux';
import { updateProgressFlag } from '../../actions/index'

import { styles } from './style';
import { Background } from '../../components/background';
import { FONT } from '../../constants/style';
import { SearchBarCustom } from '../../components/searchBar';

import Creators from './Creators';
import { Experiences } from './Experiences';
import { Routes } from './Routes';
import { withApollo } from 'react-apollo';
import { USERS_QUERY, USERS_SEARCH_QUERY } from '../../utils/Apollo/Queries/user';
import { ROUTES_QUERY, ROUTES_SEARCH_QUERY } from '../../utils/Apollo/Queries/route';
import { EXPERIENCES_QUERY, EXPERIENCES_SEARCH_QUERY } from '../../utils/Apollo/Queries/experience';
import { errorAlert } from '../../utils/API/errorHandle';

let SCREEN_WIDTH = Dimensions.get('window').width
class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: "",
      refreshing: false,
      recorder: false,
      search: '',
      users: [],
      routes: [],
      experiences: [],
      flag: false,

      typingTimeout: 0,
    };
  }

  componentDidMount() {
    this.searchCreator_Route_Experience();
  }
  searchCreator_Route_Experience = async () => {
    const { search } = this.state;
    this.props.dispatch(updateProgressFlag(true));
    try {
      let res_users = await this.props.client.query({ query: search == '' ? USERS_QUERY : USERS_SEARCH_QUERY, fetchPolicy: 'network-only', variables: { search: search } });
      let users = this.removeMe(res_users.data.users);
      let res_routes = await this.props.client.query({ query: search == '' ? ROUTES_QUERY : ROUTES_SEARCH_QUERY, fetchPolicy: 'network-only', variables: { search: search } });
      let routes = this.removeMyExperienceRoute(res_routes.data.routes);
      let res_experiences = await this.props.client.query({ query: search == '' ? EXPERIENCES_QUERY : EXPERIENCES_SEARCH_QUERY, fetchPolicy: 'network-only', variables: { search: search } });
      let experiences = this.removeMyExperienceRoute(res_experiences.data.experiences);
      this.props.dispatch(updateProgressFlag(false));
      this.setState({
        users,
        routes,
        experiences
      });

    } catch (e) {
      this.props.dispatch(updateProgressFlag(false));
      console.log({ searchCreator_Route_Experience: e });
      errorAlert('Network error. Please make sure your network is connected.')
    }
  }
  removeMe = (array) => {
    let id = this.props.auth.user._id;
    let filteredArray = array.filter(item => item._id !== id)
    return filteredArray;
  }
  removeMyExperienceRoute = (array) => {
    let id = this.props.auth.user._id;
    let filteredArray = array.filter(item => item.user._id !== id)
    return filteredArray;
  }

  updateSearch = (search) => {
    if (this.state.typingTimeout) {
      clearTimeout(this.state.typingTimeout);
    }

    this.setState({
      typing: false,
      search,
      typingTimeout: setTimeout(() => {
        this.searchCreator_Route_Experience()
      }, 2000)
    });
  };
  _onTextClear = () => {

  }
  formatData = (data, numColumn) => {
    const numberOfFullRows = Math.floor(data.length / numColumn);
    let numberOfElementsLastRow = data.length - (numberOfFullRows * numColumn);
    while (numberOfElementsLastRow != numColumn && numberOfElementsLastRow != 0) {
      data.push({ empty: true });
      numberOfElementsLastRow = numberOfElementsLastRow + 1;
    }
    return data;
  }
  render() {
    const { flag, users, search, routes, experiences } = this.state;
    return (
      <Container style={{ paddingTop: StatusBar.currentHeight }}>
        <Background height={100} end={'transparent'} />
        <Spinner
          visible={flag}
          textContent={""}
        />
        <SearchBarCustom
          round={true}
          value={search}
          // searchIcon={{ size: 50, color: 'white' }}
          // clearIcon={{ size: 50, color: 'white' }}
          onChangeText={this.updateSearch}
          onClear={this._onTextClear}
          placeholder='Search' />
        <Content contentContainerStyle={styles.contentStyle}>
          <Tabs tabBarBackgroundColor={'transparent'} renderTabBar={() => <ScrollableTab style={{ borderWidth: 0 }} />}>
            <Tab heading="Creators" activeTabStyle={{ backgroundColor: "transparent" }} tabStyle={{ backgroundColor: 'transparent' }} textStyle={{ fontFamily: FONT.MEDIUM, color: 'grey' }} activeTextStyle={{ fontFamily: FONT.MEDIUM, color: '#111111' }}>
              <Creators users={this.formatData(users, 2)} navigation={this.props.navigation} />
            </Tab>
            <Tab heading="Routes" activeTabStyle={{ backgroundColor: "transparent" }} tabStyle={{ backgroundColor: 'transparent' }} textStyle={{ fontFamily: FONT.MEDIUM, color: 'grey' }} activeTextStyle={{ fontFamily: FONT.MEDIUM, color: '#111111' }}>
              <Routes routes={routes} navigation={this.props.navigation} />
            </Tab>
            <Tab heading="Experiences" activeTabStyle={{ backgroundColor: "transparent" }} tabStyle={{ backgroundColor: 'transparent' }} textStyle={{ fontFamily: FONT.MEDIUM, color: 'grey' }} activeTextStyle={{ fontFamily: FONT.MEDIUM, color: '#111111' }}>
              <Experiences experiences={experiences} navigation={this.props.navigation} />
            </Tab>
          </Tabs>
        </Content>
      </Container>
    )
  }
}
const mapStateToProps = (state) => ({
  auth: state.auth
});
export default withApollo(connect(mapStateToProps)(Search));