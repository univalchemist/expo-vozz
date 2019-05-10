import React, { Component } from 'react';
import { FlatList, StatusBar, Dimensions, Alert, TouchableOpacity, View, Text, TouchableHighlight, StyleSheet } from 'react-native';
import { Container, ListItem, Left, Body, Right, Icon, List } from 'native-base';
import { Audio, MapView, } from 'expo';
import { NavigationActions, StackActions } from 'react-navigation';
import { MaterialIcons } from '@expo/vector-icons';
import Menu, { MenuItem } from 'react-native-material-menu';
import Spinner from 'react-native-loading-spinner-overlay';
import { connect } from 'react-redux';
import Slider from 'react-native-slider';

import {
    SkypeIndicator,
} from 'react-native-indicators';

import { styles } from './style';
import { TextView } from '../../../components/textView';
import { Background } from '../../../components/background';
import { PRIMARYCOLOR, FONT } from '../../../constants/style';
import { CustomMarker } from '../../../components/customMarker';
import MapViewDirections from '../../../utils/MapViewDirections';
import CONSTANTS from '../../../utils/constantes';
import { updateProgressFlag } from '../../../actions';
import { deleteRoute } from '../../../utils/API/routeAction';


const { width, height } = Dimensions.get('window');
const BACKGROUND_COLOR = 'transparent';
const LOADING_STRING = 'Loading...';
const BUFFERING_STRING = 'Buffering...';

const ASPECT_RATIO = width / (height * 3);
const LATITUDE = 40.4123776;
const LONGITUDE = -3.7045121;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

class LastPage extends Component {
    constructor(props) {
        super(props);

        this.musicCount = this.props.navigation.getParam('records').length,
        this.isSeeking = false;
        this.shouldPlayAtEndOfSeek = false;
        this.playbackInstance = null;
        this.mapView = null;
        this.state = {
            image: '',
            buttonTitle: 'Next',

            flag: false,
            title: '',
            index: 0,
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
            user: this.props.auth.user,
            locationResult: null,
            location: { coords: { latitude: 37.78825, longitude: -122.4324 } },
            region: {
                latitude: LATITUDE,
                longitude: LONGITUDE,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA,
            },
            current_coords: { latitude: 37.78825, longitude: -122.4324 },

            records: this.props.navigation.getParam('records'),
            title: this.props.navigation.getParam('title'),
            description: this.props.navigation.getParam('description'),
            image: this.props.navigation.getParam('image'),
            route_id: this.props.navigation.getParam('route_id'),
            markers: this.props.navigation.getParam('markers'),

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
        this._loadNewPlaybackInstance(true);
    }
    componentWillUnmount() {

    }
    async _loadNewPlaybackInstance(playing) {
        if (this.playbackInstance != null) {
            await this.playbackInstance.unloadAsync();
            this.playbackInstance.setOnPlaybackStatusUpdate(null);
            this.playbackInstance = null;
        }

        const source = { uri: this.state.records[this.state.index].item.audio.url };
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
            console.log('audio object creating error', e)
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
        this.setState({
            index: (this.state.index + (forward ? 1 : this.musicCount - 1)) %
                this.musicCount
        });
    }
    async _updatePlaybackInstanceForIndex(playing) {
        this._updateScreenForLoading(true);

        this._loadNewPlaybackInstance(playing);
    }

    _onPlayPausePressed = async () => {
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
    onReady = (result) => {
        this.mapView.fitToCoordinates(result.coordinates, {
            edgePadding: {
                right: (width / 20),
                bottom: (height / 20),
                left: (width / 20),
                top: (height / 20),
            }
        });
    }

    onError = (errorMessage) => {
        Alert.alert(errorMessage);
    }
    setMenuRef = ref => {
        this._menu = ref;
    };
    onTapOption = () => {
        console.log('onTapOption');
        this._menu.show();
    }
    menuTapDeleteReport = () => {
        this._menu.hide();
        console.log('menuTapDeleteReport')
        const { route_id } = this.state;

        this.props.dispatch(updateProgressFlag(true));
        deleteRoute(this.props.auth.jwt, route_id)
            .then((response) => {
                this.menuTapDone();
            })
            .catch((error) => {
                this.props.dispatch(updateProgressFlag(false));
                let errorResponse = error.response.data;
                let errorCode = errorResponse.statusCode;
                let errorMessage = errorResponse.message;
                if (errorCode == 500) {
                    this.menuTapDone();
                    return;
                }
                Alert.alert(
                    'Connection failed',
                    errorMessage,
                    [
                        { text: 'OK', onPress: () => console.log('click OK'), style: 'destructive' },
                    ],
                    { cancelable: true }
                )
            })


    };
    menuTapDone = async () => {
        console.log('menuTapDone')
        if (this.playbackInstance != null) {
            this.playbackInstance.unloadAsync();
        }
        const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: 'Profile' })],
        });
        this.props.navigation.dispatch(resetAction);

    }
    onClickItem = (item, index) => {
        console.log(item, index);
        if (this.playbackInstance != null) {
            this.setState({ index: index })
            this._updatePlaybackInstanceForIndex(this.state.shouldPlay);
        }

    }
    render() {
        const { flag, records, markers, user, region, title, isLoading, isPlaying } = this.state;

        return (
            <Container style={{ paddingTop: StatusBar.currentHeight, flex: 1 }}>
                <Background style={{ top: -50, zIndex: 100 }} start={'#2a2d33'} end={'transparent'} height={150} />
                <Spinner
                    visible={flag}
                    textContent={""}
                />
                <TouchableOpacity style={[styles.menuIcon]} onPress={this.onTapOption}>
                    <Icon name="more-horizontal" type='Feather' style={{ color: 'white' }} />
                    <Menu
                        ref={this.setMenuRef}
                        button={<Text></Text>}
                    >
                        <MenuItem textStyle={{ fontFamily: FONT.MEDIUM }} onPress={this.menuTapDone}>{'Done'}</MenuItem>
                        <MenuItem textStyle={{ fontFamily: FONT.MEDIUM, color: 'red' }} onPress={this.menuTapDeleteReport}>{'Delete Route'}</MenuItem>

                    </Menu>
                </TouchableOpacity>

                <View style={{ width: width, height: height / 2 + StatusBar.currentHeight, marginTop: -StatusBar.currentHeight, backgroundColor: 'white', flex: 1 }}>
                    <MapView
                        style={{ flex: 1 }}
                        initialRegion={region}
                        showsUserLocation={true}
                        loadingEnabled={true}
                        style={StyleSheet.absoluteFill}
                        ref={c => this.mapView = c}
                    >
                        {markers.map((item, index) =>
                            <MapView.Marker key={item.key} coordinate={item.coordinate} >
                                <CustomMarker text={`${index + 1}`} {...item.coordinate} />
                            </MapView.Marker>
                        )}
                        {markers.map((point, index) =>
                            (markers.length - 1 > index) ?
                                <MapViewDirections
                                    key={`point${index}`}
                                    origin={markers[index]['coordinate']}
                                    destination={markers[index + 1]['coordinate']}
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
                            width: width,
                            flex: 1,
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'stretch',
                        }}>
                            <View style={[styles.shadow, styles.infoCard]}>
                                <Icon active type='Feather' name="message-circle" style={{ marginLeft: 0, marginRight: 2, color: 'red' }} />
                                <View style={{ paddingHorizontal: 10, flex: 1 }}>
                                    <Text style={{ fontSize: 12, fontFamily: FONT.BOOK }}>{'0'}</Text>
                                    <Text style={{ fontSize: 12, fontFamily: FONT.BOOK, color: 'red' }}>{'comments'}</Text>
                                </View>
                            </View>
                            <View style={[styles.shadow, styles.infoCard]}>
                                <Icon active type='Feather' name="heart" style={{ marginLeft: 0, marginRight: 2, color: 'red' }} />
                                <View style={{ paddingHorizontal: 10, flex: 1 }}>
                                    <Text style={{ fontSize: 12, fontFamily: FONT.BOOK }}>{'0'}</Text>
                                    <Text style={{ fontSize: 12, fontFamily: FONT.BOOK, color: 'red' }}>{'likes'}</Text>
                                </View>
                            </View>
                            <View style={[styles.shadow, styles.infoCard]}>
                                <Icon active type='Feather' name="bar-chart-2" style={{ marginLeft: 0, marginRight: 2, color: 'red' }} />
                                <View style={{ paddingHorizontal: 10, flex: 1 }}>
                                    <Text style={{ fontSize: 12, fontFamily: FONT.BOOK }}>{'0'}</Text>
                                    <Text style={{ fontSize: 12, fontFamily: FONT.BOOK, color: 'red' }}>{'plays'}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={{ width: '100%', marginTop: 40, marginBottom: 35 }}>
                            <TextView style={{ color: 'white', fontSize: 26, textAlign: 'center' }} value={title} />
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
                                    disabled={this.state.isLoading}
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
                                    disabled={isLoading}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={{ flex: 1.2 }}>
                        <List>
                            <FlatList
                                data={records}
                                renderItem={({ item, index }) => (
                                    <ListItem icon button={true} onPress={() => this.onClickItem(item, index)}>
                                        <Left>
                                            <Icon name={'menu'} type='Feather' style={{ color: 'grey' }} />
                                        </Left>
                                        <Body>
                                            <TextView value={item.title} />
                                        </Body>
                                        <Right>
                                            {this.state.index == index && this.playbackInstance != null &&
                                                <Icon active type='Feather' name="bar-chart-2" style={{ color: PRIMARYCOLOR.PURPLE }} />
                                            }

                                        </Right>
                                    </ListItem>

                                )
                                }
                                keyExtractor={(item) => item.key}
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
export default connect(mapStateToProps)(LastPage)