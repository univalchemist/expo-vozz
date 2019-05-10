import React, { Component } from 'react';
import { StatusBar } from 'react-native';
import { Container, Content, Tab, Tabs, ScrollableTab } from 'native-base';
import Spinner from 'react-native-loading-spinner-overlay';
import { connect } from 'react-redux';
import { updateProgressFlag } from '../../actions/index'

import { styles } from './style';
import { Background } from '../../components/background';
import { FONT } from '../../constants/style';

import { Experiences } from './Experiences';
import { Routes } from './Routes';
import { withApollo } from 'react-apollo';
import { SEARCH_CATEGORY_QUERY } from '../../utils/Apollo/Queries/tag';
import { HeaderContainer } from '../../components/header';

class ViewCategory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: "",
      refreshing: false,
      recorder: false,
      routes: [],
      experiences: [],
      flag: false,
      tags: this.props.navigation.getParam('tags')
    };
  }

  componentDidMount() {
    this.searchCreator_Route_Experience();
  }
  searchCreator_Route_Experience = async () => {
    const { tags } = this.state;
    if (tags == null || tags == undefined) {
      return;
    }
    this.props.dispatch(updateProgressFlag(true));
    let temp_routes = [];
    let temp_experiences = [];
    let async = await Promise.all(await tags.map(async t => {
      try {
        let res = await this.props.client.query({ query: SEARCH_CATEGORY_QUERY, fetchPolicy: 'network-only', variables: { id: t } });
        let routes = res.data.tag.routes;
        let experiences = res.data.tag.experiences;
        temp_routes = [...temp_routes, ...routes];
        temp_experiences = [...temp_experiences, ...experiences];
      } catch (e) {
        console.log({ searchCreator_Route_Experience: e });
      }
    }));
    this.props.dispatch(updateProgressFlag(false));
    console.log({ async });
    console.log({ temp_routes });
    console.log({ temp_experiences });
    this.setState({
      routes: this.removeMyExperienceRoute(temp_routes),
      experiences: this.removeMyExperienceRoute(temp_experiences)
    });
  }
  removeMyExperienceRoute = (array) => {
    let id = this.props.auth.user._id;
    let filteredArray = array.filter(item => item.user._id !== id)
    return filteredArray;
  }
  render() {
    const { flag, routes, experiences } = this.state;
    const title = this.props.navigation.getParam('title');
    return (
      <Container style={{ paddingTop: StatusBar.currentHeight }}>
        <Background height={100} end={'transparent'} />
        <Spinner
          visible={flag}
          textContent={""}
        />
        <HeaderContainer title={title} navigation={this.props.navigation} goBack={true} />
        <Content contentContainerStyle={styles.contentStyle}>
          <Tabs tabBarBackgroundColor={'transparent'} renderTabBar={() => <ScrollableTab style={{ borderWidth: 0 }} />}>
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
export default withApollo(connect(mapStateToProps)(ViewCategory));