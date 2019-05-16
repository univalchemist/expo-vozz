import React from 'react'
import { Text, View, Dimensions, Image, Animated, ImageBackground, Alert, AsyncStorage, TouchableOpacity, ScrollView, Platform, ActionSheetIOS } from 'react-native';
import { Button, Icon, Container, Content } from 'native-base';
import { connect } from 'react-redux';
import { withApollo } from 'react-apollo'
import Swiper from 'react-native-swiper';
import SlidingUpPanel from 'rn-sliding-up-panel'
import { LinearGradient, ImagePicker, Permissions } from 'expo';
import Menu, { MenuItem } from 'react-native-material-menu';
import ActionSheet from 'react-native-actionsheet';

import { TextView } from '../../components/textView';
import CardHome from '../../components/cardhome'
import images from '../../../assets';
import { styles } from './style';
import { PRIMARYCOLOR, FONT } from '../../constants/style';
import getPermissionAsync from '../../constants/funcs';
import { updateProfile } from '../../utils/API/userAction';
import { updateProgressFlag, updateTabIndex, updateUserdata } from '../../actions';
import { compressImage } from '../../utils/ImageUtil';
import { getCount } from '../../utils/number';
import { USER_ROUTE_QUERY } from '../../utils/Apollo/Queries/route';
import CardExperience from '../../components/cardExperience';
import { errorAlert } from '../../utils/API/errorHandle';
import { USER_EXPERIENCE_QUERY } from '../../utils/Apollo/Queries/experience';
import { Background } from '../../components/background';


const { height, width } = Dimensions.get('window');
const SLIDING_UP_PANEL_HEIGHT = Platform.select({
    // The issue doesn't affect iOS
    ios: height,
    android: height
})
const options = [
    <TextView style={{ color: 'blue', fontSize: 18 }} value={'Choose From Library'} />,
    <TextView style={{ color: 'blue', fontSize: 18 }} value={'Take Picture'} />,
    <TextView style={{ color: 'blue', fontSize: 18 }} value={'Cancel'} />];
const options_ios = [
    'Choose From Library',
    'Take Picture',
    'Cancel'];
const cancelButtonIndex = options.length - 1;
const cancelButtonIndex_ios = options_ios.length - 1;
class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            image: this.props.auth.user.profile_base64,
            dragging: true,
            tabIndex: 0,
            user: this.props.auth.user,
            routes: [],
            experiences: [],
            draggableRange: {
                top: SLIDING_UP_PANEL_HEIGHT,
                bottom: ((Dimensions.get('screen').height / Dimensions.get('screen').width) === (37 / 18)) ? 255 : 303
            },
            plays: 0
        };
    }
    _draggedValue = new Animated.Value(0)
    componentDidMount() {
        this.getMyRoutesExperiences();
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.auth.user !== this.props.auth.user) {

            this.setState({
                user: nextProps.auth.user,
                image: nextProps.auth.user.profile_base64
            });
        }
    }
    getMyRoutesExperiences = async () => {
        console.log("my profile page>>>>");
        this.props.dispatch(updateProgressFlag(true));
        try {
            let routes = [];
            let experiences = [];
            let res_routes = await this.props.client.query({ query: USER_ROUTE_QUERY, fetchPolicy: 'network-only', variables: { id: this.props.auth.user._id } });
            routes = res_routes.data.routes;
            let res_experiences = await this.props.client.query({ query: USER_EXPERIENCE_QUERY, fetchPolicy: 'network-only', variables: { id: this.props.auth.user._id } });
            experiences = res_experiences.data.experiences;
            this.props.dispatch(updateProgressFlag(false));
            console.log({ routes: routes });
            console.log({ experiences: experiences });
            let count = 0;
            routes.map(item => {
                item.plays.map(play => {
                    count = count + play.count;
                })

            })
            experiences.map(item => {
                item.plays.map(play => {
                    count = count + play.count;
                })

            })
            this.setState({ plays: count, routes: routes, experiences: experiences });
        } catch (e) {
            this.props.dispatch(updateProgressFlag(false));
            console.log({ error: e });
            errorAlert('Network error. Please make sure your network is connected.');
        }
    }
    _presingOutAsync() {
        console.log('_presingOutAsync')
        Alert.alert(
            '',
            'Are you sure you want to Log out from the app?',
            [
                { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                { text: 'Log out', onPress: () => this._signOutAsync(), style: 'destructive' },
            ],
            { cancelable: false }
        )
    }
    _signOutAsync = async () => {
        await AsyncStorage.clear();
        this.props.dispatch(updateTabIndex(0));
        this.props.navigation.navigate('Auth');
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
    menuTapEditProfile = (e) => {
        this._menu.hide();
        console.log('menuTapEditProfile');
        this.props.navigation.navigate('EditProfile');
        e.stopPropagation()
        e.preventDefault();
    };
    menuTapSettings = () => {
        this._menu.hide();
        console.log('menuTapSettings');
        this.props.navigation.navigate('Settings');
    }
    menuTapAudioLibrary = () => {
        this._menu.hide();
        console.log('menuTapAudioLibrary');
        this.props.navigation.navigate('AudioLibrary');
    }
    menuTapLogout = () => {
        this._menu.hide();
        console.log('menuTapLogout');
        this._presingOutAsync();
    }
    onTapaddAvatar = () => {
        if (Platform.OS === 'android') {
            this.ActionSheet.show()
            return;
        }
        this.showActionSheet();
    }
    showActionSheet = () => {
        ActionSheetIOS.showActionSheetWithOptions({
            options: options_ios,
            cancelButtonIndex: cancelButtonIndex_ios,
        },
            (buttonIndex) => {
                this.selectOption(buttonIndex);
            });
    };
    selectOption = (index) => {
        switch (index) {
            case 0:
                this.selectLibrary();
                return;
            case 1:
                this.takePicture();
                return;
            default:
        }
    }
    takePicture = async () => {
        if (await getPermissionAsync(Permissions.CAMERA)) {
            if (await getPermissionAsync(Permissions.CAMERA_ROLL)) {
                const result = await ImagePicker.launchCameraAsync({
                    allowsEditing: true,
                    base64: false,
                    aspect: [4, 4],
                });
                console.log('takePicture result', result);
                if (!result.cancelled) {
                    const compress_result = await compressImage(result.uri, 100, 100);
                    console.log('compress result::', compress_result);
                    this.alertToSaveProfileImage(compress_result.base64);
                }
            }

        }
    }
    selectLibrary = async () => {
        if (await getPermissionAsync(Permissions.CAMERA_ROLL)) {
            const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                base64: false,
                aspect: [4, 4],
            });
            console.log('selectLibrary result', result);
            if (!result.cancelled) {
                const compress_result = await compressImage(result.uri, 100, 100);
                console.log('compress result::', compress_result);
                this.alertToSaveProfileImage(compress_result.base64);
            }
        }
    }
    alertToSaveProfileImage = (base64) => {
        Alert.alert(
            '',
            'Are you sure you want to change profile image?',
            [
                { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                { text: 'Change', onPress: () => this.onChangeProfileImage(base64), style: 'destructive' },
            ],
            { cancelable: false }
        )
    }
    onChangeProfileImage = (base64) => {
        this.props.dispatch(updateProgressFlag(true));
        updateProfile(this.props.auth.user._id, this.props.auth.jwt, { profile_base64: base64 })
            .then((response) => {
                this.setState({ image: base64 });
                this.props.dispatch(updateProgressFlag(false));
                console.log('updateProfileImage response', JSON.stringify(response));
                this.props.dispatch(updateUserdata(response.data));
                AsyncStorage.setItem('user', JSON.stringify(response.data));
            })
            .catch((error) => {
                this.props.dispatch(updateProgressFlag(false));
                let errorResponse = error.response.data;
                console.log('updateProfileImage error', JSON.stringify(errorResponse));
                let errorCode = errorResponse.statusCode;
                let errorMessage = errorResponse.message;
                Alert.alert(
                    'Connection failed',
                    errorMessage,
                    [
                        { text: 'OK', onPress: () => console.log('click OK'), style: 'destructive' },
                    ],
                    { cancelable: true }
                )
            })
    }
    onTapEditProfile = () => {
        console.log('onTapEditProfile');
        this.props.navigation.navigate('EditProfile');
    }
    onTapRoutes = () => {
        this.setState({ tabIndex: 0 });
        this._panel.show()
    }
    onTapExperience = () => {
        console.log('onTapExperience');
        this.setState({ tabIndex: 1 });
        this._panel.show()
    }
    onTapNewRouteExperience = () => {
        console.log('onTapNewRoute');
        switch (this.state.tabIndex) {
            case 0:
                this.props.navigation.navigate('newRoute');
                return;
            case 1:
                this.props.navigation.navigate('newExperience');
                return;
            default:
                return;
        }

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

    render() {
        const { experiences, dragging, image, tabIndex, user, plays, routes } = this.state;
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
        const addAvatarSize = this._draggedValue.interpolate({
            inputRange: [bottom, top],
            outputRange: [20, 0],
            extrapolate: 'clamp'
        })
        const addAvatarSizeRadius = this._draggedValue.interpolate({
            inputRange: [bottom, top],
            outputRange: [10, 0],
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
        const addPlusFontSize = this._draggedValue.interpolate({
            inputRange: [bottom, top],
            outputRange: [14, 0],
            extrapolate: 'clamp'
        })
        const addPlusMovePosition = this._draggedValue.interpolate({
            inputRange: [bottom, top],
            outputRange: [0, 5],
            extrapolate: 'clamp'
        })
        const transParentZindex = this._draggedValue.interpolate({
            inputRange: [bottom, top],
            outputRange: [100, -100],
            extrapolate: 'clamp'
        })

        const transform = [{ scale: draggedValue }];

        return (
            // <SafeAreaView style={styles.parentContainer}>
            <Container>
                <ActionSheet
                    ref={o => this.ActionSheet = o}
                    title={<TextView style={{ color: '#000', fontSize: 18 }} value={'Options'} />}
                    options={options}
                    cancelButtonIndex={cancelButtonIndex}
                    destructiveButtonIndex={4}
                    onPress={(index) => this.selectOption(index)}
                />
                <Animated.View style={[{ top: -50, zIndex: transParentZindex }]} >
                    <Background start={'#2a2d33'} end={'transparent'} height={150} />
                </Animated.View>
                <Animated.View style={[styles.menuIcon, { transform }]}>
                    <TouchableOpacity onPress={this.showMenu}>
                        <Icon name="more-horizontal" type='Feather' style={{ color: 'white' }} />
                        <Menu
                            ref={this.setMenuRef}
                            button={<Text></Text>}
                        >
                            <MenuItem textStyle={{ fontFamily: FONT.MEDIUM }} onPress={this.menuTapEditProfile}>Edit Profile</MenuItem>
                            <MenuItem textStyle={{ fontFamily: FONT.MEDIUM }} onPress={this.menuTapSettings}>Settings</MenuItem>
                            <MenuItem textStyle={{ fontFamily: FONT.MEDIUM }} onPress={this.menuTapAudioLibrary}>Audio Library</MenuItem>
                            <MenuItem textStyle={{ fontFamily: FONT.MEDIUM, color: 'red' }} onPress={this.menuTapLogout}>Logout</MenuItem>
                        </Menu>
                    </TouchableOpacity>
                </Animated.View>
                <ImageBackground style={styles.swiperStyle} resizeMode="cover" source={images.placeHolderMoment}>
                    <Swiper style={styles.swiperStyle} index={0} paginationStyle={{ bottom: ((Dimensions.get('screen').height / Dimensions.get('screen').width) === (37 / 18)) ? 265 : 313 }} activeDotColor={PRIMARYCOLOR.ORANGE} dotColor='#fff'>
                        <View style={{ flex: 1, position: 'absolute', left: 10, bottom: ((Dimensions.get('screen').height / Dimensions.get('screen').width) === (37 / 18)) ? 265 : 313 }}>
                            <Text style={{ color: 'white'}}>{'1 hour ago'}</Text>
                        </View>
                        <View style={{ flex: 1, position: 'absolute', left: 10, bottom: ((Dimensions.get('screen').height / Dimensions.get('screen').width) === (37 / 18)) ? 265 : 313 }}>
                            <Text style={{ color: 'white'}}>{'2 hours ago'}</Text>
                        </View>
                    </Swiper>
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
                >
                    {dragHandler => (
                        <View style={styles.panel}>

                            <Animated.View style={[{ width: animatedPanWith }]}>
                                <Animated.View style={{ marginTop: 0, paddingHorizontal: 10, paddingTop: 20, backgroundColor: PRIMARYCOLOR.ORANGE, borderTopLeftRadius: borderRadius, borderTopRightRadius: borderRadius }}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Animated.View style={{ width: imageSize, height: imageSize, marginTop: 15 }} {...dragHandler}>
                                            <Animated.Image style={[styles.thumbNail, { width: imageSize, height: imageSize, borderRadius: imageRadius }]} source={image ? ({ uri: `data:image/png;base64,${image}` }) : (images.default_avatar)}>

                                            </Animated.Image>

                                            <Animated.View style={[styles.addAvatar, { width: addAvatarSize, height: addAvatarSize, borderRadius: addAvatarSizeRadius, right: addPlusMovePosition, bottom: addPlusMovePosition }]}>
                                                <TouchableOpacity style={{ backgroundColor: 'transparent', width: 20, height: 20, justifyContent: 'center', alignItems: 'center' }} onPress={() => this.onTapaddAvatar()}>
                                                    <Animated.Text style={[{ color: PRIMARYCOLOR.PURPLE, fontSize: addPlusFontSize }, { transform }]} >{'+'}</Animated.Text>
                                                </TouchableOpacity>
                                            </Animated.View>

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
                                                <Animated.View style={[styles.followButton, { marginTop: buttonMarginTop, marginRight: buttonMarginRight, width: buttonWidth }]}>
                                                    <TouchableOpacity onPress={(e) => this.onTapEditProfile(e)}>
                                                        <TextView style={{ color: '#FF4710' }} value={'Edit Profile'} />
                                                    </TouchableOpacity>
                                                </Animated.View>
                                            </View>

                                        </View>
                                    </View>
                                    <Animated.View style={[styles.recordDescription, { height: descriptionSize }, { transform }]} {...dragHandler} >
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
                                                {routes.map((item, index) => (
                                                    <CardHome key={index} item={item} navigation={this.props.navigation} me={true} />
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
                                                {experiences.map((item, index) => (
                                                    <CardExperience key={index} item={item} navigation={this.props.navigation} me={true} />
                                                ))}

                                            </ScrollView>
                                            :
                                            <View style={{ padding: 30 }}>
                                                <TextView style={{ fontSize: 20, color: 'grey' }} value={'There is no experience you have created.'} />
                                            </View>
                                        }
                                    </View>
                                }

                                <View style={{ marginTop: 50, alignItems: 'stretch', justifyContent: 'center', width: '100%' }}>
                                    <Button rounded iconRight block style={styles.button} onPress={this.onTapNewRouteExperience} >
                                        <TextView style={styles.buttonTxtColor} value={(tabIndex == 0) ? 'New Route' : 'New Experience'} />
                                        <Icon name='arrow-right' type='FontAwesome' style={styles.iconStyle} />
                                    </Button>
                                </View>

                            </View>
                        </View>
                    )}


                </SlidingUpPanel>
                {/* </SafeAreaView> */}
            </Container>
        )
    }
}
const mapStateToProps = (state) => ({
    auth: state.auth
});

export default withApollo(connect(mapStateToProps)(Profile))