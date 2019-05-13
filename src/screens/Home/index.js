import React, { Component } from 'react';
import { View, Alert, AsyncStorage, StatusBar, ImageBackground, RefreshControl, Animated, Dimensions, ScrollView, TouchableHighlight } from 'react-native';
import { Container, Content, Card } from 'native-base';
import Spinner from 'react-native-loading-spinner-overlay';
import SwitchButton from 'switch-button-react-native';

import Swiper from 'react-native-swiper';
import { connect } from 'react-redux';
import { withApollo } from 'react-apollo';
import { updateProgressFlag } from '../../actions/index'

import images from '../../../assets/'
import { styles } from './style';
import CardHome from '../../components/cardhome'
import CardExperience from '../../components/cardExperience'
import Category from '../../components/category'
import { LabelView } from '../../components/labelView';
import { TextView } from '../../components/textView';
import { Background } from '../../components/background';
import { PRIMARYCOLOR } from '../../constants/style';
import { SearchBarCustom } from '../../components/searchBar';
import { ALL_CATEGORY_QUERY } from '../../utils/Apollo/Queries/category';
import { errorAlert } from '../../utils/API/errorHandle';
import { TRENDS_QUERY } from '../../utils/Apollo/Queries/user';

const SCREEN_WIDTH = Dimensions.get('window').width

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: this.props.auth.user,
            text: "",
            refreshing: false,
            recorder: false,
            search: '',

            featured: [],
            tendencias: [
                { url: '', title: 'Yutatan top 10', subTitle: 'Favorite', likes: 23, comments: 30, records: 50 },
            ],
            trend_routes: [],
            trend_experiences: [],
            flag: false,
            activeSwitch: 1
        };
    }

    componentDidMount() {
        this.getFeatured();
        this.getTrends();
    }
    getFeatured = async () => {
        this.props.dispatch(updateProgressFlag(true));
        try {
            let res = await this.props.client.query({ query: ALL_CATEGORY_QUERY, fetchPolicy: 'network-only', variables: {} });
            let featured = res.data.categories;
            featured = featured.filter(item => { return item.featured == true })
            this.props.dispatch(updateProgressFlag(false));

            this.setState({
                featured: featured
            });
        } catch (e) {
            this.props.dispatch(updateProgressFlag(false));
            console.log({ getFeatured_error: e });
            errorAlert('Network error. Please make sure your network is connected.')
        }
    }
    getTrends = async () => {
        const { user } = this.state;
        if (user.followings == null || user.followings == undefined || user.followings.length == 0) {
            return;
        }
        let temp_routes = [];
        let temp_experiences = [];
        let async = await Promise.all(await user.followings.map(async f => {
            try {
                let res = await this.props.client.query({ query: TRENDS_QUERY, fetchPolicy: 'network-only', variables: { id: f._id } });
                let routes = res.data.user.routes;
                let experiences = res.data.user.experiences;
                temp_routes = [...temp_routes, ...routes];
                temp_experiences = [...temp_experiences, ...experiences];
            } catch (e) {
                console.log({ getTrends: e });
            }
        }));
        console.log({ async });
        console.log({ temp_routes });
        console.log({ temp_experiences });
        this.setState({
            trend_routes: temp_routes,
            trend_experiences: temp_experiences
        });
    }
    _onRefresh = () => {
        this.setState({ refreshing: true });
        setTimeout(this.setState({ refreshing: false }), 30000);
    }

    updateSearch = (search) => {
        console.log(search)
        this.setState({ search });
    };
    _onTextClear = () => {

    }
    getTags = (tags) => {
        return tags.map(t => t._id);
    }
    onChangeSwitchValue = (val) => {
        this.setState({ activeSwitch: val });
    }
    render() {
        const { flag, featured, search, activeSwitch, user, trend_experiences, trend_routes } = this.state;
        return (
            <Container style={{ paddingTop: StatusBar.currentHeight }}>
                <Background height={200} end={'transparent'} />
                <Spinner
                    visible={flag}
                    textContent={""}
                />
                {/* <SearchBarCustom
                    round={true}
                    value={search}
                    onChangeText={this.updateSearch}
                    onClear={this._onTextClear}
                    placeholder='Busca tu experiencia...' /> */}
                <Content contentContainerStyle={styles.contentStyle}>

                    <ScrollView
                        scrollEventThrottle={16}
                        showsVerticalScrollIndicator={false}
                        onScroll={Animated.event(
                            [
                                { nativeEvent: { contentOffset: { y: this.scrollY } } }
                            ]
                        )}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this._onRefresh}
                            />
                        } style={{ flex: 1 }}>
                        {featured.length > 0 &&
                            <View style={{ height: 250, marginTop: 10, width: SCREEN_WIDTH - 50 }}>

                                <Swiper
                                    activeDotColor={PRIMARYCOLOR.PURPLE}
                                >
                                    {featured.map((item, index) => (
                                        <TouchableHighlight underlayColor="#ffffff00" key={index} style={styles.slide} onPress={() => this.props.navigation.navigate('ViewCategory', { tags: this.getTags(item.tags), title: item.title })}>
                                            <Card style={styles.cardContainer} borderRadius={10}>
                                                <ImageBackground source={item.picture ? ({ uri: item.picture.url }) : (images.sample1)} style={{ flex: 1, height: '100%', width: '100%', borderRadius: 10 }} imageStyle={{ borderRadius: 10 }}>
                                                    <View style={styles.labelView}>
                                                        <LabelView style={styles.labelStyle} value={item.description} />
                                                    </View>
                                                </ImageBackground>
                                            </Card>
                                        </TouchableHighlight>
                                    ))}

                                </Swiper>


                            </View>
                        }
                        {user.categories != null && user.categories != undefined && user.categories.length > 0 &&
                            <View style={{ marginTop: 0, marginBottom: 10, width: SCREEN_WIDTH - 50 }}>
                                <View>
                                    <View>
                                        <TextView style={styles.CategoryTitleStyle} value={'Categorías'} />
                                    </View>

                                </View>
                                <ScrollView showsHorizontalScrollIndicator={false} horizontal={true} style={{ marginTop: 10, paddingHorizontal: 0 }}>
                                    {user.categories.map((item, index) => (
                                        <Category key={index} item={item} fontStyle={styles.fontStyle} tags={item.tags} navigation={this.props.navigation}/>
                                    ))}
                                </ScrollView>
                            </View>
                        }

                        <View style={{ marginTop: 20, width: SCREEN_WIDTH - 50 }}>
                            <View style={{
                                flex: 1,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}>
                                <View>
                                    <TextView style={styles.CategoryTitleStyle} value={'Trends'} />
                                </View>
                                <View>
                                    <SwitchButton
                                        onValueChange={(val) => this.onChangeSwitchValue(val)}
                                        text1='Routes'
                                        text2='Experiences'
                                        switchWidth={200}
                                        switchHeight={44}
                                        switchdirection='ltr'
                                        switchBorderRadius={100}
                                        switchSpeedChange={1000}
                                        switchBorderColor='#fff'
                                        switchBackgroundColor='#fff'
                                        btnBorderColor={PRIMARYCOLOR.ORANGE}
                                        btnBackgroundColor={PRIMARYCOLOR.ORANGE}
                                        fontColor='#b1b1b1'
                                        activeFontColor='#fff'
                                    />
                                </View>
                            </View>
                            {activeSwitch == 1 ?
                                <View style={{ flex: 1, paddingTop: 20 }}>
                                    {trend_routes.length > 0 ?
                                        trend_routes.map(r => (
                                            <CardHome key={r._id} item={r} navigation={this.props.navigation} />
                                        ))
                                        :
                                        <View style={{ padding: 30, alignItems: 'center' }}>
                                            <TextView style={{ fontSize: 20, color: 'grey' }} value={'No trends routes'} />
                                        </View>
                                    }
                                </View>
                                :
                                <View style={{ flex: 1, paddingTop: 20 }}>
                                    {trend_experiences.length > 0 ?
                                        trend_experiences.map(e => (
                                            <CardExperience key={e._id} item={e} navigation={this.props.navigation} />
                                        ))
                                        :
                                        <View style={{ padding: 30, alignItems: 'center' }}>
                                            <TextView style={{ fontSize: 20, color: 'grey' }} value={'No trends expreiences'} />
                                        </View>
                                    }
                                </View>
                            }
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
export default withApollo(connect(mapStateToProps)(Home))