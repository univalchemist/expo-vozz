import React, { Component } from 'react';
import { FlatList, StatusBar, Dimensions, ImageBackground, TouchableOpacity, View, Text, TouchableHighlight } from 'react-native';
import { Container, Content, Item, ListItem, Left, Body, Right, CheckBox, Icon, Textarea, List } from 'native-base';
import { Asset, Audio, MapView, Location, Permissions } from 'expo';
import { MaterialIcons } from '@expo/vector-icons';
import Menu, { MenuItem } from 'react-native-material-menu';
import { NavigationActions, StackActions } from 'react-navigation';

import Spinner from 'react-native-loading-spinner-overlay';
import { connect } from 'react-redux';
import { SwipeListView } from 'react-native-swipe-list-view';
import Slider from 'react-native-slider';
import {
    SkypeIndicator,
} from 'react-native-indicators';
import { styles } from './style';
import { TextView } from '../../../components/textView';
import { Background } from '../../../components/background';
import { PRIMARYCOLOR, FONT } from '../../../constants/style';
import images from '../../../../assets';
import { LabelView } from '../../../components/labelView';
import { deleteExperience } from '../../../utils/API/experienceAction';
import { updateProgressFlag } from '../../../actions';



const { width, height } = Dimensions.get('window');
const BACKGROUND_COLOR = 'transparent';
const LOADING_STRING = 'Loading...';
const BUFFERING_STRING = 'Buffering...';

const ASPECT_RATIO = width / (height * 3);
const LATITUDE = 40.4123776;
const LONGITUDE = -3.7045121;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

class LastPageExperience extends Component {
    constructor(props) {

        super(props);

        this.musicCount = this.props.navigation.getParam('records').length,
        this.isSeeking = false;
        this.shouldPlayAtEndOfSeek = false;
        this.playbackInstance = null;
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
            experience_id: this.props.navigation.getParam('experience_id'),
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
        const { records, index } = this.state;
        if (this.playbackInstance != null) {
            await this.playbackInstance.unloadAsync();
            this.playbackInstance.setOnPlaybackStatusUpdate(null);
            this.playbackInstance = null;
        }

        const source = { uri: records[index].item.audio.url };
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
        this.setState({
            index: (this.state.index + (forward ? 1 : this.musicCount - 1)) %
                this.musicCount
        });
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
    setMenuRef = ref => {
        this._menu = ref;
    };
    onTapOption = () => {
        console.log('onTapOption');
        this._menu.show();
    }
    menuTapDeleteExperience = () => {
        this._menu.hide();
        console.log('menuTapDeleteExperience')
        const { experience_id } = this.state;
        this.props.dispatch(updateProgressFlag(true));
        deleteExperience(this.props.auth.jwt, experience_id)
            .then((response) => {
                this.menuTapGoDone();
            })
            .catch((error) => {
                this.props.dispatch(updateProgressFlag(false));
                let errorResponse = error.response.data;
                let errorCode = errorResponse.statusCode;
                let errorMessage = errorResponse.message;
                if (errorCode == 500) {
                    this.menuTapGoDone();
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
    menuTapGoDone = () => {
        this._menu.hide();
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
        const { flag, image, records, region, title, description, isLoading, isPlaying } = this.state;

        return (
            <Container style={{ paddingTop: StatusBar.currentHeight, flex: 1 }}>
                <Background start={PRIMARYCOLOR.ORANGE} end={PRIMARYCOLOR.ORANGE} height={100} />
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
                        <MenuItem textStyle={{ fontFamily: FONT.MEDIUM }} onPress={this.menuTapGoDone}>Done</MenuItem>
                        <MenuItem textStyle={{ fontFamily: FONT.MEDIUM, color: 'red' }} onPress={this.menuTapDeleteExperience}>{'Delete Experience'}</MenuItem>
                    </Menu>
                </TouchableOpacity>

                <View style={{ width: width, backgroundColor: 'white', flex: 1 }}>
                    <ImageBackground source={image ? ({ uri: image }) : (images.sample1)} style={{ flex: 1, height: '100%', width: '100%' }}>
                        <View style={styles.labelView}>
                            <LabelView style={styles.labelStyle} value={description} />
                        </View>
                    </ImageBackground>
                </View>
                <View style={{ flex: 2 }}>
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
                    <View style={{ flex: 2 }}>
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
export default connect(mapStateToProps)(LastPageExperience)