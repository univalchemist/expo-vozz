import React, { Component } from 'react';
import { FlatList, StatusBar, Alert, TouchableOpacity, View, Text, TouchableHighlight, StyleSheet } from 'react-native';
import { Container, ListItem, Left, Body, Right, Icon, List } from 'native-base';
import { Audio, MapView, } from 'expo';
import { withApollo } from 'react-apollo';
import { connect } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import Menu, { MenuItem } from 'react-native-material-menu';

import Spinner from 'react-native-loading-spinner-overlay';
import Slider from 'react-native-slider';

import {
    SkypeIndicator,
} from 'react-native-indicators';

import { styles } from './style';
import { TextView } from '../../components/textView';
import { Background } from '../../components/background';
import { PRIMARYCOLOR, FONT, DEVICE } from '../../constants/style';
import { CustomMarker } from '../../components/customMarker';
import MapViewDirections from '../../utils/MapViewDirections';
import CONSTANTS from '../../utils/constantes';
import { GET_ROUTE_QUERY } from '../../utils/Apollo/Queries/route';
import { getCount, getPlays } from '../../utils/number';
import { updatePlay, createPlay } from '../../utils/API/play';
import { deleteLike, createLike } from '../../utils/API/likes';
import { updateProfileStore } from '../../actions';
import { errorAlert } from '../../utils/API/errorHandle';

const BACKGROUND_COLOR = 'transparent';
const LOADING_STRING = 'Loading...';

const ASPECT_RATIO = DEVICE.WIDTH / (DEVICE.HEIGHT * 3);
const LATITUDE = 40.4123776;
const LONGITUDE = -3.7045121;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

class ViewRoute extends Component {
    constructor(props) {

        super(props);


        this.isSeeking = false;
        this.shouldPlayAtEndOfSeek = false;
        this.playbackInstance = null;
        this.mapView = null;
        this.state = {
            me: this.props.navigation.getParam('me'),
            buttonTitle: 'Next',

            flag: false,
            title: '',

            playbackInstanceName: LOADING_STRING,
            playbackInstancePosition: null,
            playbackInstanceDuration: null,
            shouldPlay: false,
            isPlaying: false,
            isBuffering: false,
            isLoading: true,
            fontLoaded: false,
            volume: 1.0,
            rate: 1.0,
            portrait: null,
            locationResult: null,
            location: { coords: { latitude: 37.78825, longitude: -122.4324 } },
            region: {
                latitude: LATITUDE,
                longitude: LONGITUDE,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA,
            },
            current_coords: { latitude: 37.78825, longitude: -122.4324 },

            route_id: this.props.navigation.getParam('route_id'),
            route: null,
            moments: [],
            musicCount: 0,
            playIndex: 0,

            like: false,
            comments: 0,
            plays: 0,
            likes: 0,
            tapLike: false
        };

    }
    async componentWillMount() {
        Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
            playThroughEarpieceAndroid: false
        });
        this.getRouteInfo();
    }
    componentWillUnmount() {
    }
    getRouteInfo = async () => {
        const { route_id } = this.state;
        try {
            let res = await this.props.client.query({ query: GET_ROUTE_QUERY, fetchPolicy: 'network-only', variables: { id: route_id } });
            let route = res.data.route;
            let moments = route.moments;
            moments.map((m, index) => index == 0 ? m.play = true : m.play = false);
            const like = this.contains(this.props.auth.user._id, route.likes)
            const comments = getCount(route.comments);
            const plays = getPlays(route.plays);
            const likes = getCount(route.likes);
            this.setState({
                moments: moments,
                route: route,
                musicCount: route.moments.length,
                like,
                comments,
                plays,
                likes
            });
            this._loadNewPlaybackInstance(true);
            this.onUpdatePlays();
        } catch (e) {
            console.log({ getRouteInfo_error: e });
            errorAlert('Network error. Please make sure your network is connected.')
        }

    }
    async _loadNewPlaybackInstance(playing) {
        if (this.playbackInstance != null) {
            await this.playbackInstance.unloadAsync();
            this.playbackInstance.setOnPlaybackStatusUpdate(null);
            this.playbackInstance = null;
        }
        const { route, playIndex } = this.state;
        const source = { uri: route.moments[playIndex].audio.url };
        const initialStatus = {
            shouldPlay: playing,
            rate: this.state.rate,
            volume: this.state.volume,
            autoPlay: true,
            isLoading: true
        };
        try {
            const { sound, status } = await Audio.Sound.createAsync(
                source,
                initialStatus,
                this._onPlaybackStatusUpdate
            );
            this.playbackInstance = sound;
            this._updateScreenForLoading(false);
        } catch (e) {
            console.log('************************************', e)
        }

    }
    _onPlaybackStatusUpdate = status => {
        if (status.isLoaded) {
            this.setState({
                playbackInstancePosition: status.positionMillis,
                playbackInstanceDuration: status.durationMillis,
                shouldPlay: status.shouldPlay,
                isPlaying: status.isPlaying,
                isBuffering: status.isBuffering,
                rate: status.rate,
                volume: status.volume,
            });
            if (status.didJustFinish) {
                this._advanceIndex(true);
                this._updatePlaybackInstanceForIndex(true);
            }
        } else {
            if (status.error) {
                console.log(`FATAL PLAYER ERROR: ${status.error}`);
            }
        }
    };

    _advanceIndex(forward) {
        const { playIndex, musicCount, moments } = this.state;
        let i =
            (playIndex + (forward ? 1 : musicCount - 1)) %
            musicCount;
        moments.map((m, index) => index == i ? m.play = true : m.play = false);
        this.setState({ playIndex: i, moments: moments });

    }

    async _updatePlaybackInstanceForIndex(playing) {
        this._updateScreenForLoading(true);

        this._loadNewPlaybackInstance(playing);
    }

    _onPlayPausePressed = () => {
        if (this.playbackInstance != null) {
            if (this.state.isPlaying) {
                this.playbackInstance.pauseAsync();
            } else {
                this.playbackInstance.playAsync();
            }
        }
    };

    _onStopPressed = () => {
        if (this.playbackInstance != null) {
            this.playbackInstance.stopAsync();
        }
    };

    _onSeekSliderValueChange = value => {
        if (this.playbackInstance != null && !this.isSeeking) {
            this.isSeeking = true;
            this.shouldPlayAtEndOfSeek = this.state.shouldPlay;
            this.playbackInstance.pauseAsync();
        }
    };

    _onSeekSliderSlidingComplete = async value => {
        if (this.playbackInstance != null) {
            this.isSeeking = false;
            const seekPosition = value * this.state.playbackInstanceDuration;
            if (this.shouldPlayAtEndOfSeek) {
                this.playbackInstance.playFromPositionAsync(seekPosition);
            } else {
                this.playbackInstance.setPositionAsync(seekPosition);
            }
        }
    };

    _getSeekSliderPosition() {
        if (
            this.playbackInstance != null &&
            this.state.playbackInstancePosition != null &&
            this.state.playbackInstanceDuration != null
        ) {
            return (
                this.state.playbackInstancePosition /
                this.state.playbackInstanceDuration
            );
        }
        return 0;
    }

    _updateScreenForLoading(isLoading) {
        if (isLoading) {
            this.setState({
                isPlaying: false,
                playbackInstanceName: LOADING_STRING,
                playbackInstanceDuration: null,
                playbackInstancePosition: null,
                isLoading: true,
            });
        } else {
            this.setState({
                isLoading: false,
            });
        }
    }
    _getSeekSliderPosition() {
        if (
            this.playbackInstance != null &&
            this.state.playbackInstancePosition != null &&
            this.state.playbackInstanceDuration != null
        ) {
            return (
                this.state.playbackInstancePosition /
                this.state.playbackInstanceDuration
            );
        }
        return 0;
    }
    _onSeekSliderValueChange = value => {
        if (this.playbackInstance != null && !this.isSeeking) {
            this.isSeeking = true;
            this.shouldPlayAtEndOfSeek = this.state.shouldPlay;
            this.playbackInstance.pauseAsync();
        }
    };
    _onSeekSliderSlidingComplete = async value => {
        if (this.playbackInstance != null) {
            this.isSeeking = false;
            const seekPosition = value * this.state.playbackInstanceDuration;
            if (this.shouldPlayAtEndOfSeek) {
                this.playbackInstance.playFromPositionAsync(seekPosition);
            } else {
                this.playbackInstance.setPositionAsync(seekPosition);
            }
        }
    };
    onReady = (result) => {
        this.mapView.fitToCoordinates(result.coordinates, {
            edgePadding: {
                right: (DEVICE.WIDTH / 20),
                bottom: (DEVICE.HEIGHT / 20),
                left: (DEVICE.WIDTH / 20),
                top: (DEVICE.HEIGHT / 20),
            }
        });
    }

    onError = (errorMessage) => {
        Alert.alert(errorMessage);
    }
    onUpdatePlays = async () => {
        const { route } = this.state;
        const plays = route.plays;
        let play = [];
        if (plays != null || plays.length != 0) {
            play = plays.filter(p => p.user._id == this.props.auth.user._id);
        }
        if (play.length != 0) {
            updatePlay(play[0]._id, this.props.auth.jwt, { count: play[0].count + 1 })
                .then((res) => {
                    this.props.dispatch(updateProfileStore(this.props.auth.user._id));
                })
                .catch((error) => {
                    console.log('updatePlayError:', error);
                })
        } else {
            let temp_play = {
                play_route: true,
                route: route._id,
                user: this.props.auth.user._id,
                count: 1,
                own_user: route.user._id
            }
            createPlay(this.props.auth.jwt, temp_play)
                .then((res) => {
                    this.props.dispatch(updateProfileStore(this.props.auth.user._id));
                })
                .catch((error) => {
                    console.log('createPlayError:', error);
                })
        }
    }
    setMenuRef = ref => {
        this._menu = ref;
    };
    onTapOption = () => {
        console.log('onTapOption');
        this._menu.show();
    }
    menuTapDeleteReportRoute = () => {
        this._menu.hide();
        console.log('menuTapDeleteReportRoute')
        const { create } = this.state;
    };
    menuTapViewStats = () => {
        this._menu.hide();
        console.log('menuTapViewStats')
    }
    menuTapGoProfile = () => {
        console.log('menuTapGoProfile')
        this._menu.hide();
        const { route } = this.state;
        this.props.navigation.navigate('UserProfile', { user_id: route.user._id });

    }
    onClickItem = (item, index) => {
        console.log(item, index);
        if (this.playbackInstance != null) {
            this.setState({ index: index });
            this._updatePlaybackInstanceForIndex(this.state.shouldPlay);
        }

    }
    onTapGoBack = async () => {
        const { isLoading } = this.state;
        if (isLoading) {
            return;
        }
        if (this.playbackInstance != null) {
            await this.playbackInstance.unloadAsync();
            this.props.navigation.goBack()
        } else {
            this.props.navigation.goBack()
        }

    }
    onActionLike = () => {
        const { like, likes, route, tapLike } = this.state;
        if (tapLike) return;
        if (like) {
            let myLike = this.props.auth.user.likes.filter(l => l.route == route._id);
            if (myLike.length == 0) return;
            this.setState({ tapLike: true });
            deleteLike(myLike[0]._id, this.props.auth.jwt)
                .then((res) => {
                    this.setState({
                        like: !like,
                        likes: like ? likes - 1 : likes + 1,
                        tapLike: false
                    });
                    this.props.dispatch(updateProfileStore(this.props.auth.user._id));
                })
                .catch((error) => {
                    let errorResponse = error.response.data;
                    console.log('deleteLike error', JSON.stringify(errorResponse));
                    let errorCode = errorResponse.statusCode;
                    console.log({ errorCode })
                    this.setState({ tapLike: false });
                    this.props.dispatch(updateProfileStore(this.props.auth.user._id));
                })
        } else {
            let temp_like = {
                like_route: true,
                route: route._id,
                user: this.props.auth.user._id,
            }
            this.setState({ tapLike: true });
            createLike(this.props.auth.jwt, temp_like)
                .then((res) => {
                    this.setState({
                        like: !like,
                        likes: like ? likes - 1 : likes + 1,
                        tapLike: false
                    });
                    this.props.dispatch(updateProfileStore(this.props.auth.user._id));
                })
                .catch((error) => {
                    this.setState({ tapLike: false });
                    console.log('createPlayError:', error);
                })
        }


    }
    onActionComment = () => {
        const { route, comments } = this.state;
        this.props.navigation.navigate('Comment', {
            title: route.title,
            c_count: comments,
            route: route._id,
            comments: route.comments,
            onGoBack: (c) => this.refresh(c),
        });
    }
    refresh = (c) => {
        const { comments } = this.state;
        this.setState({ comments: c });
    }
    contains = (value, arr) => {
        var i = arr.length;
        while (i--) {
            if (arr[i].user._id === value) {
                return true;
            }
        }
        return false;
    }
    renderItem = ({ item, index }) => {
        const { playIndex } = this.state;
        return (
            <ListItem icon button={true}>
                <Left>
                    <Icon name={'menu'} type='Feather' style={{ color: 'grey' }} />
                </Left>
                <Body>
                    <TextView value={item.title} />
                </Body>
                <Right>
                    {item.play ?
                        <Icon active type='Feather' name="bar-chart-2" style={{ color: PRIMARYCOLOR.PURPLE }} />
                        : null
                    }
                </Right>
            </ListItem>
        )

    }
    render() {
        const { flag, like, plays, comments, likes, isLoading, isPlaying, region, me, route, moments } = this.state;
        if (route == null || route == undefined) {
            return (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <SkypeIndicator color={PRIMARYCOLOR.ORANGE} size={40} />
                </View>
            )
        }
        return (
            <Container style={{ paddingTop: StatusBar.currentHeight, flex: 1 }}>
                <Background style={{ top: -50, zIndex: 100 }} start={'#2a2d33'} end={'transparent'} height={150} />
                <Spinner
                    visible={flag}
                    textContent={""}
                />
                <TouchableOpacity style={[styles.backIcon]} onPress={() => this.onTapGoBack()}>
                    <Icon name="chevron-left" type='Feather' style={{ color: 'white' }} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.menuIcon]} onPress={this.onTapOption}>
                    <Icon name="more-horizontal" type='Feather' style={{ color: 'white' }} />
                    <Menu
                        ref={this.setMenuRef}
                        button={<Text></Text>}
                    >
                        {/* <MenuItem textStyle={{ fontFamily: FONT.MEDIUM }} onPress={this.menuTapViewStats}>View stats</MenuItem> */}
                        {!me && <MenuItem textStyle={{ fontFamily: FONT.MEDIUM }} onPress={this.menuTapGoProfile}>{'Profile'}</MenuItem>}
                        {/* <MenuItem textStyle={{ fontFamily: FONT.MEDIUM, color: 'red' }} onPress={this.menuTapDeleteReportRoute}>{me ? 'Delete Route' : 'Report'}</MenuItem> */}

                    </Menu>
                </TouchableOpacity>

                <View style={{ width: DEVICE.WIDTH, height: DEVICE.HEIGHT / 2 + StatusBar.currentHeight, marginTop: -StatusBar.currentHeight, backgroundColor: 'white', flex: 1 }}>
                    <MapView
                        style={{ flex: 1 }}
                        initialRegion={region}
                        showsUserLocation={true}
                        loadingEnabled={true}
                        style={StyleSheet.absoluteFill}
                        ref={c => this.mapView = c}
                    >
                        {route.markers.map((item, index) =>
                            <MapView.Marker key={item.key} coordinate={item.coordinate} >
                                <CustomMarker text={`${index + 1}`} {...item.coordinate} />
                            </MapView.Marker>
                        )}
                        {route.markers.map((point, index) =>
                            (route.markers.length - 1 > index) ?
                                <MapViewDirections
                                    key={`point${index}`}
                                    origin={route.markers[index]['coordinate']}
                                    destination={route.markers[index + 1]['coordinate']}
                                    apikey={CONSTANTS.GOOGLE_MAP_DIRECTION_API_KEY}
                                    strokeWidth={3}
                                    strokeColor={PRIMARYCOLOR.PURPLE}
                                    onReady={this.onReady}
                                    onError={this.onError}
                                />
                                : null
                        )}
                    </MapView>

                </View>
                <View style={{ flex: 1 }}>
                    <View style={[styles.shadow, { flex: 1, backgroundColor: PRIMARYCOLOR.ORANGE }]}>
                        <View style={{
                            position: 'absolute',
                            top: -20,
                            right: 0,
                            width: DEVICE.WIDTH,
                            flex: 1,
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'stretch',
                        }}>
                            <TouchableHighlight underlayColor="#fff" style={[styles.shadow, styles.infoCard]} onPress={this.onActionComment}>
                                <View style={[styles.infoCardContent]}>
                                    <Icon active type='Feather' name="message-circle" style={{ marginLeft: 0, marginRight: 2, color: 'red' }} />
                                    <View style={{ paddingHorizontal: 10, flex: 1 }}>
                                        <Text style={{ fontSize: 12, fontFamily: FONT.BOOK }}>{comments}</Text>
                                        <Text style={{ fontSize: 12, fontFamily: FONT.BOOK, color: 'red' }}>{'comments'}</Text>
                                    </View>
                                </View>
                            </TouchableHighlight>
                            <TouchableHighlight underlayColor="#fff" style={[styles.shadow, styles.infoCard]} onPress={this.onActionLike}>
                                <View style={[styles.infoCardContent]}>
                                    <Icon active type={like ? 'FontAwesome' : 'Feather'} name={'heart'} style={{ marginLeft: 0, marginRight: 2, color: 'red' }} />
                                    <View style={{ paddingHorizontal: 10, flex: 1 }}>
                                        <Text style={{ fontSize: 12, fontFamily: FONT.BOOK }}>{likes}</Text>
                                        <Text style={{ fontSize: 12, fontFamily: FONT.BOOK, color: 'red' }}>{'likes'}</Text>
                                    </View>
                                </View>
                            </TouchableHighlight>
                            <TouchableHighlight underlayColor="#fff" style={[styles.shadow, styles.infoCard]}>
                                <View style={[styles.infoCardContent]}>
                                    <Icon active type='Feather' name="bar-chart-2" style={{ marginLeft: 0, marginRight: 2, color: 'red' }} />
                                    <View style={{ paddingHorizontal: 10, flex: 1 }}>
                                        <Text style={{ fontSize: 12, fontFamily: FONT.BOOK }}>{plays}</Text>
                                        <Text style={{ fontSize: 12, fontFamily: FONT.BOOK, color: 'red' }}>{'plays'}</Text>
                                    </View>
                                </View>
                            </TouchableHighlight>

                        </View>
                        <View style={{ width: '100%', marginTop: 40, marginBottom: 35 }}>
                            <TextView style={{ color: 'white', fontSize: 26, textAlign: 'center' }} value={route.title} />
                        </View>
                        <View
                            style={[
                                styles.playerContainerBase,
                                styles.playerContainerMiddleRow,
                            ]}
                        >
                            <View style={styles.sliderContainer}>
                                <TouchableHighlight
                                    underlayColor={BACKGROUND_COLOR}
                                    onPress={this._onPlayPausePressed}
                                    disabled={isLoading}
                                >
                                    {!isLoading ? <View style={{ width: 40, height: 40 }}>
                                        {isPlaying ? (
                                            <MaterialIcons
                                                name="pause"
                                                size={40}
                                                color="#fff"
                                            />
                                        ) : (
                                                <MaterialIcons
                                                    name="play-arrow"
                                                    size={40}
                                                    color="#fff"
                                                />
                                            )}
                                    </View>
                                        :
                                        <View style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}><SkypeIndicator color='white' size={25} /></View>
                                    }
                                </TouchableHighlight>
                                <Slider
                                    style={styles.trackSlider}
                                    trackStyle={styles.track}
                                    value={this._getSeekSliderPosition()}
                                    onValueChange={this._onSeekSliderValueChange}
                                    onSlidingComplete={this._onSeekSliderSlidingComplete}
                                    thumbTintColor={'white'}
                                    minimumTrackTintColor={PRIMARYCOLOR.PURPLE1}
                                    maximumTrackTintColor={'white'}
                                    disabled={this.state.isLoading}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={{ flex: 1.2 }}>
                        <List>
                            <FlatList
                                data={moments}
                                renderItem={this.renderItem}
                                keyExtractor={(item) => item._id}
                                extraData={this.state}
                            />
                        </List>
                    </View>
                </View>
            </Container >
        )
    }
}
const mapStateToProps = (state) => ({
    auth: state.auth
});
export default withApollo(connect(mapStateToProps)(ViewRoute))