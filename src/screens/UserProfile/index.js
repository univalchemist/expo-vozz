import React from 'react'
import { Text, View, Dimensions, ImageBackground, Animated, AsyncStorage, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Icon, Container } from 'native-base';
import { connect } from 'react-redux';
import Swiper from 'react-native-swiper';
import SlidingUpPanel from 'rn-sliding-up-panel'
import { LinearGradient } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import Menu, { MenuItem } from 'react-native-material-menu';
import {
    SkypeIndicator,
} from 'react-native-indicators';
import { TextView } from '../../components/textView';
import CardHome from '../../components/cardhome';
import CardExperience from '../../components/cardExperience';
import images from '../../../assets';
import { styles } from './style';
import { PRIMARYCOLOR, FONT, DEVICE } from '../../constants/style';
import { updateProgressFlag, updateUserdata } from '../../actions';
import { withApollo } from 'react-apollo';
import { USER_QUERY } from '../../utils/Apollo/Queries/user';
import { getCount } from '../../utils/number';
import { updateProfile } from '../../utils/API/userAction';
import { Background } from '../../components/background';
import MusicPlayer from '../../utils/Audio';
import { calDiffHours } from '../../utils/Date';
import { LAST_MOMENT_QUERY } from '../../utils/Apollo/Queries/moment';

const { height, width } = Dimensions.get('window');
const SLIDING_UP_PANEL_HEIGHT = Platform.select({
    // The issue doesn't affect iOS
    ios: DEVICE.HEIGHT,
    android: DEVICE.HEIGHT
})

class UserProfile extends React.Component {
    MusicPlayer = null;
    constructor(props) {
        super(props);
        this.state = {
            image: '',
            dragging: true,
            tabIndex: 0,
            user_id: this.props.navigation.getParam('user_id'),
            user: null,
            plays: 0,
            following: false,
            draggableRange: {
                top: SLIDING_UP_PANEL_HEIGHT,
                bottom: ((Dimensions.get('screen').height / Dimensions.get('screen').width) === (37 / 18)) ? 255 : 303
            },

            lasts: [],
            playing: false,
        };
        this.getUserInfo();
    }

    _draggedValue = new Animated.Value(0)

    async componentWillMount() {
        this.MusicPlayer = new MusicPlayer();
    }
    componentDidMount() {
        this.animatedMargin = this._draggedValue.interpolate({
            inputRange: [0, 300],
            outputRange: [this.startMargin, this.endMargin],
            extrapolate: 'clamp'
        });
        this.fetchLastMoments(this.state.user_id);
    }
    fetchLastMoments = async (id) => {
        try {
            let res = await this.props.client.query({ query: LAST_MOMENT_QUERY, fetchPolicy: 'network-only', variables: { id: id } });
            let lasts = res.data.moments;
            for (l of lasts) {
                let diff = calDiffHours(l.createdAt);
                l.play = false;
                l.diff = diff;
            }
            console.log({ lasts })
            this.setState({ lasts });
        } catch (e) {
            console.log({ errorR: e })
        }


    }
    onTapPlay = (play, index) => {
        console.log('PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP', play, index);
        let temp = [...this.state.lasts];
        for (t of temp) {
            t.play = false;
        }
        temp[index]['play'] = !play;
        this.setState({ lasts: temp });
        if (play) {
            this.stopPlay();
            return;
        }

        let uri = temp[index]['audio']['url'];
        console.log('---------------------------')
        console.log({ uri });
        this.startPlay(uri);

    }
    startPlay = (uri) => {
        const source = { uri: uri };
        this.MusicPlayer.startPlay(source, this.state.playing).then(() => {
            this.setState({
                playing: !this.state.playing
            })
        });
    };
    stopPlay = () => {
        this.MusicPlayer.stopPlay(this.state.playing).then(() => {
            this.setState({
                playing: !this.state.playing
            })
        });
    };
    getUserInfo = async () => {
        const { user_id } = this.state;
        console.log({ user_id });
        try {
            let res = await this.props.client.query({ query: USER_QUERY, fetchPolicy: 'network-only', variables: { id: user_id } });
            let user = res.data.user;
            let count = 0;
            user.routes.map(item => {
                item.plays.map(play => {
                    count = count + play.count;
                })

            })
            user.experiences.map(item => {
                item.plays.map(play => {
                    count = count + play.count;
                })

            });
            const following = this.contains(this.props.auth.user._id, user.followedBys)
            this.setState({
                user: user,
                plays: count,
                following
            });
        } catch (e) {
            console.log({ getUserInfo: e });
            errorAlert('Network error. Please make sure your network is connected.')
        }
    }
    contains = (value, arr) => {
        var i = arr.length;
        while (i--) {
            if (arr[i]._id === value) {
                return true;
            }
        }
        return false;
    }
    setMenuRef = ref => {
        this._menu = ref;
    };

    hideMenu = () => {
        this._menu.hide();
    };

    showMenu = () => {
        this._menu.show();
    };
    menuTapPrivateMessage = () => {
        this._menu.hide();
        console.log('menuTapPrivateMessage');
        this.props.navigation.navigate('Chat', { user: { url: 'https://images.pexels.com/photos/1250643/pexels-photo-1250643.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260', name: 'LiGwang', last: 'Not today', unRead: false } });
    };
    menuTapReport = () => {
        this._menu.hide();
        console.log('menuTapReport')
    }
    menuTapCopyUrl = () => {
        this._menu.hide();
        console.log('menuTapCopyUrl')
    }
    menuTapBlock = () => {
        this._menu.hide();
        console.log('menuTapBlock');
    }
    onTapFollow = () => {
        const { following, user } = this.state;
        console.log('onTapEditProfile:', following);
        let followings = this.props.auth.user.followings ? this.props.auth.user.followings.map(f => f._id) : [];
        console.log({ followings });
        if (following) {
            followings = followings.filter(f => f !== user._id)
        } else {
            followings.push(user._id);
        }
        this.props.dispatch(updateProgressFlag(true));
        updateProfile(this.props.auth.user._id, this.props.auth.jwt, { followings: followings })
            .then((response) => {
                this.props.dispatch(updateProgressFlag(false));
                console.log('updateTags response', JSON.stringify(response));
                this.props.dispatch(updateUserdata(response.data));
                AsyncStorage.setItem('user', JSON.stringify(response.data));
                this.getUserInfo();
            })
            .catch((error) => {
                this.props.dispatch(updateProgressFlag(false));
                let errorResponse = error.response.data;
                console.log('updateTags error', JSON.stringify(errorResponse));
                let errorCode = errorResponse.statusCode;
                let errorMessage = errorResponse.message;
                errorAlert(errorMessage);
            })
    }
    onTapRoutes = () => {
        console.log('onTapRoutes', height);
        this.setState({ tabIndex: 0 });
        this._panel.show()
    }
    onTapExperience = () => {
        console.log('onTapExperience');
        this.setState({ tabIndex: 1 });
        this._panel.show()
    }
    onTapRight = (positione) => {
        console.log('onTapRight', position);
    }
    onDragStart = (position) => {
        console.log('onDragStart', position);
    }
    onDragEnd = () => {
        console.log('onDragEnd', position);
    }
    onTapGoBack = () => {
        this.MusicPlayer.stopPlay(this.state.playing).then(() => {
            this.setState({
                playing: !this.state.playing
            })
        });
        this.props.navigation.goBack()
    }
    calDiffTime = (h) => {
        if (1 > h > 0) {
            let min = h * 60;
            return min + ' mins ago';
        } else if (h == 1) {
            return h + ' hour ago';
        } else {
            return h + ' hours ago';
        }
    }
    render() {
        const { dragging, following, tabIndex, user, plays, lasts } = this.state;
        const { top, bottom } = this.state.draggableRange
        const draggedValue = this._draggedValue.interpolate({
            inputRange: [bottom, top],
            outputRange: [1, 0],
            extrapolate: 'clamp'
        })
        this.startPanWith = width * 0.9
        this.endPanWith = width
        const animatedPanWith = this._draggedValue.interpolate({
            inputRange: [bottom, top],
            outputRange: [this.startPanWith, this.endPanWith],
            extrapolate: 'clamp'
        })
        const borderRadius = this._draggedValue.interpolate({
            inputRange: [bottom, top],
            outputRange: [20, 0],
            extrapolate: 'clamp'
        })
        const imageSize = this._draggedValue.interpolate({
            inputRange: [bottom, top],
            outputRange: [80, 40],
            extrapolate: 'clamp'
        })
        const imageRadius = this._draggedValue.interpolate({
            inputRange: [bottom, top],
            outputRange: [40, 20],
            extrapolate: 'clamp'
        })
        const headerName = this._draggedValue.interpolate({
            inputRange: [bottom, top],
            outputRange: [0, 50],
            extrapolate: 'clamp'
        })
        const buttonWidth = this._draggedValue.interpolate({
            inputRange: [bottom, top],
            outputRange: [width * 3 / 4 - 70, width * 1 / 4 - 10],
            extrapolate: 'clamp'
        })
        const buttonMarginRight = this._draggedValue.interpolate({
            inputRange: [bottom, top],
            outputRange: [50, 10],
            extrapolate: 'clamp'
        })
        const buttonMarginTop = this._draggedValue.interpolate({
            inputRange: [bottom, top],
            outputRange: [0, -40],
            extrapolate: 'clamp'
        })
        const descriptionSize = this._draggedValue.interpolate({
            inputRange: [bottom, top],
            outputRange: [80, 0],
            extrapolate: 'clamp'
        })
        const headerFontSize = this._draggedValue.interpolate({
            inputRange: [bottom, top],
            outputRange: [0, 20],
            extrapolate: 'clamp'
        })
        const transParentZindex = this._draggedValue.interpolate({
            inputRange: [bottom, top],
            outputRange: [100, -100],
            extrapolate: 'clamp'
        })
        const transform = [{ scale: draggedValue }];
        if (user == null || user == undefined) {
            return (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <SkypeIndicator color={PRIMARYCOLOR.ORANGE} size={40} />
                </View>
            )
        }
        return (
            // <SafeAreaView style={styles.parentContainer}>
            <Container>
                <Animated.View style={[{ top: -50, zIndex: transParentZindex }]} >
                    <Background start={'#2a2d33'} end={'transparent'} height={150} />
                </Animated.View>
                <Animated.View style={[styles.backIcon, { transform }]}>
                    <TouchableOpacity onPress={() => this.onTapGoBack()}>
                        <Icon name="chevron-left" type='Feather' style={{ color: 'white' }} />
                    </TouchableOpacity>
                </Animated.View>
                <Animated.View style={[styles.menuIcon, { transform }]}>
                    <TouchableOpacity onPress={this.showMenu}>
                        <Icon name="more-horizontal" type='Feather' style={{ color: 'white' }} />
                        <Menu
                            ref={this.setMenuRef}
                            button={<Text></Text>}
                        >
                            <MenuItem textStyle={{ fontFamily: FONT.MEDIUM }} onPress={this.menuTapPrivateMessage}>Private Message</MenuItem>
                            {/* <MenuItem textStyle={{ fontFamily: FONT.MEDIUM }} onPress={this.menuTapCopyUrl}>Copy Profile URL</MenuItem> */}
                            {/* <MenuItem textStyle={{ fontFamily: FONT.MEDIUM, color: 'red' }} onPress={this.menuTapReport}>Report</MenuItem> */}
                            {/* <MenuItem textStyle={{ fontFamily: FONT.MEDIUM, color: 'red' }} onPress={this.menuTapBlock}>Block</MenuItem> */}
                        </Menu>
                    </TouchableOpacity>
                </Animated.View>
                <ImageBackground style={styles.swiperStyle} resizeMode="cover" source={images.placeHolderMoment}>
                    {lasts == null || lasts.length == 0 ? null
                        :
                        <Swiper style={styles.swiperStyle} index={0} paginationStyle={{ bottom: ((Dimensions.get('screen').height / Dimensions.get('screen').width) === (37 / 18)) ? 265 : 313 }} activeDotColor={PRIMARYCOLOR.ORANGE} dotColor='#fff'>
                            {lasts.map((l, index) => (
                                <View key={index} style={{ width: '100%', height: '100%' }}>
                                    <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 40, width: '100%', height: '100%' - ((Dimensions.get('screen').height / Dimensions.get('screen').width) === (37 / 18)) ? 265 : 313 }}>
                                        <LinearGradient
                                            colors={['red', '#ED3A17']}
                                            style={{
                                                width: 80,
                                                height: 80,
                                                padding: 10,
                                                borderRadius: 40
                                            }}>
                                            <TouchableOpacity
                                                onPress={() => this.onTapPlay(l.play, index)}
                                                style={{
                                                    backgroundColor: '#fff',
                                                    width: 60,
                                                    height: 60,
                                                    borderRadius: 30,
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                <Ionicons name={l.play ? 'ios-pause' : 'ios-play'} size={50} color={'#ED3A17'} />
                                            </TouchableOpacity>
                                        </LinearGradient>
                                    </View>
                                    <View style={{ flex: 1, position: 'absolute', left: 10, bottom: ((Dimensions.get('screen').height / Dimensions.get('screen').width) === (37 / 18)) ? 265 : 313 }}>
                                        <Text style={{ color: 'white' }}>{this.calDiffTime(l.diff)}</Text>
                                    </View>
                                </View>
                            ))}
                        </Swiper>
                    }

                </ImageBackground>

                <LinearGradient
                    style={{ height: 100, marginTop: -100 }}
                    colors={['transparent', 'white']} />
                <SlidingUpPanel
                    showBackdrop={false}
                    ref={c => (this._panel = c)}
                    draggableRange={this.state.draggableRange}
                    animatedValue={this._draggedValue}
                    allowDragging={dragging}
                    friction={1}
                // onDragStart={this.onDragStart}
                // onDragEnd={this.onDragEnd}
                >
                    {dragHandler => (
                        <View style={styles.panel}>

                            <Animated.View style={[{ width: animatedPanWith }]}>
                                <Animated.View style={{ marginTop: 0, paddingHorizontal: 10, paddingTop: 20, backgroundColor: PRIMARYCOLOR.ORANGE, borderTopLeftRadius: borderRadius, borderTopRightRadius: borderRadius }}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Animated.View style={{ width: imageSize, height: imageSize, marginTop: 15 }} {...dragHandler}>
                                            <Animated.Image style={[styles.thumbNail, { width: imageSize, height: imageSize, borderRadius: imageRadius }]} source={user.profile_base64 ? ({ uri: `data:image/png;base64,${user.profile_base64}` }) : (images.default_avatar)}>

                                            </Animated.Image>
                                        </Animated.View>

                                        <View style={{ flex: 1 }}>
                                            <Animated.View style={[styles.infoViewStyle, { transform }]} {...dragHandler}>
                                                <View style={styles.followingStyle}>
                                                    <TextView style={{ color: 'white', fontSize: 16 }} value={getCount(user.followings)} />
                                                    <TextView style={{ color: 'white', fontSize: 12 }} value={'Following'} />
                                                </View>
                                                <View style={styles.followerStyle}>
                                                    <TextView style={{ color: 'white', fontSize: 16 }} value={getCount(user.followedBys)} />
                                                    <TextView style={{ color: 'white', fontSize: 12 }} value={'Followers'} />
                                                </View>
                                                <View style={styles.playerStyle}>
                                                    <TextView style={{ color: 'white', fontSize: 16 }} value={plays} />
                                                    <TextView style={{ color: 'white', fontSize: 12 }} value={'Plays'} />
                                                </View>
                                            </Animated.View>
                                            <View style={{
                                                flex: 1,
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                            }}>
                                                <Animated.View style={[{ marginTop: buttonMarginTop, width: headerName, marginLeft: 20, flex: 1 }]} {...dragHandler}>
                                                    <Animated.Text style={{ color: '#FFF', fontSize: headerFontSize, fontFamily: FONT.MEDIUM }}>{user.username}</Animated.Text>
                                                </Animated.View>
                                                <Animated.View style={[styles.followButton, { backgroundColor: following ? PRIMARYCOLOR.PURPLE : 'white', marginTop: buttonMarginTop, marginRight: buttonMarginRight, width: buttonWidth }]}>
                                                    <TouchableOpacity onPress={() => this.onTapFollow()}>
                                                        <TextView style={{ color: following ? '#fff' : '#FF4710' }} value={following ? 'Following' : 'Follow'} />
                                                    </TouchableOpacity>
                                                </Animated.View>
                                            </View>

                                        </View>
                                    </View>
                                    <Animated.View style={[styles.recordDescription, { height: descriptionSize }, { transform }]} {...dragHandler}>
                                        <TextView style={{ color: '#FFF', fontSize: 22 }} value={user.username} />
                                        <TextView style={{ color: '#fff' }} value={user.bio} />
                                    </Animated.View>
                                </Animated.View>
                            </Animated.View>
                            <View style={{
                                width: '100%',
                                height: 50,
                                marginBottom: 0,
                                backgroundColor: PRIMARYCOLOR.ORANGE,
                                alignItems: 'center'
                            }}>
                                <Animated.View style={{ width: animatedPanWith, height: '100%', backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                                    <View style={styles.bottomTabStyle}>
                                        <TouchableOpacity style={styles.RoutesStyle} onPress={() => this.onTapRoutes()}>
                                            <TextView style={{ color: (tabIndex == 0) ? PRIMARYCOLOR.ORANGE : 'grey', fontSize: 16 }} value={'Routes'} />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.experienceStyle} onPress={() => this.onTapExperience()}>
                                            <TextView style={{ color: (tabIndex == 1) ? PRIMARYCOLOR.ORANGE : 'grey', fontSize: 16 }} value={'Experience'} />
                                        </TouchableOpacity>
                                    </View>
                                </Animated.View>
                            </View>
                            <View style={styles.slidingContainer}>
                                {tabIndex == 0 ?

                                    <View style={{ justifyContent: 'center', alignItems: 'stretch', height: 300 }}>
                                        {getCount(user.routes) > 0 ?
                                            <ScrollView style={{ paddingHorizontal: 10 }}>
                                                {user.routes.map((item, index) => (
                                                    <CardHome key={index} item={item} navigation={this.props.navigation} />
                                                ))}

                                            </ScrollView>
                                            :
                                            <View style={{ padding: 30 }}>
                                                <TextView style={{ fontSize: 20, color: 'grey' }} value={'There is no route you have created.'} />
                                            </View>
                                        }

                                    </View>
                                    :
                                    <View style={{ justifyContent: 'center', alignItems: 'stretch', height: 300 }}>
                                        {getCount(user.experiences) > 0 ?
                                            <ScrollView style={{ paddingHorizontal: 10 }}>
                                                {user.experiences.map((item, index) => (
                                                    <CardExperience key={index} item={item} navigation={this.props.navigation} />
                                                ))}

                                            </ScrollView>
                                            :
                                            <View style={{ padding: 30 }}>
                                                <TextView style={{ fontSize: 20, color: 'grey' }} value={'There is no experience you have created.'} />
                                            </View>
                                        }
                                    </View>
                                }
                            </View>
                        </View>
                    )}


                </SlidingUpPanel>
            </Container>
        )
    }
}
const mapStateToProps = (state) => ({
    auth: state.auth
});
export default withApollo(connect(mapStateToProps)(UserProfile))