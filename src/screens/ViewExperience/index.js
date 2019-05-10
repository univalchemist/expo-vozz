import React, { Component } from 'react';
import { FlatList, ImageBackground, TouchableOpacity, View, Text, TouchableHighlight } from 'react-native';
import { Container, ListItem, Left, Body, Right, Icon, List } from 'native-base';
import { Audio } from 'expo';
import { MaterialIcons } from '@expo/vector-icons';
import Menu, { MenuItem } from 'react-native-material-menu';
import { NavigationActions, StackActions } from 'react-navigation';

import Spinner from 'react-native-loading-spinner-overlay';
import { connect } from 'react-redux';
import { withApollo } from 'react-apollo';
import Slider from 'react-native-slider';
import {
    SkypeIndicator,
} from 'react-native-indicators';
import { styles } from './style';
import { TextView } from '../../components/textView';
import { Background } from '../../components/background';
import { PRIMARYCOLOR, FONT, DEVICE } from '../../constants/style';
import images from '../../../assets';
import { LabelView } from '../../components/labelView';
import { GET_EXPERIENCE_QUERY } from '../../utils/Apollo/Queries/experience';
import { getCount, getPlays } from '../../utils/number';
import { deleteExperience } from '../../utils/API/experienceAction';
import { updateProgressFlag } from '../../actions';
import { updatePlay, createPlay } from '../../utils/API/play';

const BACKGROUND_COLOR = 'transparent';
const LOADING_STRING = 'Loading...';

let id = 0;
class ViewExperience extends Component {
    constructor(props) {

        super(props);

        this.isSeeking = false;
        this.shouldPlayAtEndOfSeek = false;
        this.playbackInstance = null;
        this.state = {
            me: this.props.navigation.getParam('me'),
            image: '',
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

            experience_id: this.props.navigation.getParam('experience_id'),
            experience: null,
            musicCount: 0,
            index: 0,

            like: false,
            comments: 0,
            plays: 0,
            likes: 0
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
        this.getExperienceInfo();
    }
    componentWillUnmount() {
    }
    getExperienceInfo = async () => {
        const { experience_id } = this.state;
        try {
            let res = await this.props.client.query({ query: GET_EXPERIENCE_QUERY, fetchPolicy: 'network-only', variables: { id: experience_id } });
            let experience = res.data.experience;
            const like = this.contains(this.props.auth.user._id, experience.likes)
            const comments = getCount(experience.comments);
            const plays = getCount(experience.plays);
            const likes = getCount(experience.likes);
            this.setState({
                experience: experience,
                musicCount: experience.moments.length,
                like,
                comments,
                plays,
                likes
            });
            this._loadNewPlaybackInstance(true);
            this.onUpdatePlays()
        } catch (e) {
            console.log({ getExperienceInfo: e });
            errorAlert('Network error. Please make sure your network is connected.')
        }

    }
    async _loadNewPlaybackInstance(playing) {
        const { experience, index } = this.state;
        if (this.playbackInstance != null) {
            await this.playbackInstance.unloadAsync();
            this.playbackInstance.setOnPlaybackStatusUpdate(null);
            this.playbackInstance = null;
        }

        const source = { uri: experience.moments[index].audio.url };
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
        const { index, musicCount } = this.state;
        let i =
            (index + (forward ? 1 : musicCount - 1)) %
            musicCount;
        this.setState({ index: i });
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
    onUpdatePlays = async () => {
        const { experience } = this.state;
        const plays = experience.plays;
        let play = [];
        if (plays != null || plays.length != 0) {
            play = plays.filter(p => p.user._id == this.props.auth.user._id);
        }
        if (play.length != 0) {
            updatePlay(play[0]._id, this.props.auth.jwt, { count: play[0].count + 1 })
                .then((res) => {
                })
                .catch((error) => {
                    console.log('updatePlayError:', error);
                })
        } else {
            let temp_play = {
                play_experience: true,
                experience: experience._id,
                user: this.props.auth.user._id,
                count: 1,
                own_user: experience.user._id
            }
            createPlay(this.props.auth.jwt, temp_play)
            .then((res) => {
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
    menuTapDeleteReportExperience = () => {
        this._menu.hide();
        console.log('menuTapDeleteReportExperience')
        const { experience_id } = this.state;
        this.props.dispatch(updateProgressFlag(true));
        deleteExperience(this.props.auth.jwt, experience_id)
            .then((response) => {
                const resetAction = StackActions.reset({
                    index: 0,
                    actions: [NavigationActions.navigate({ routeName: 'Profile' })],
                });
                this.props.navigation.dispatch(resetAction);
                return;
            })
            .catch((error) => {
                this.props.dispatch(updateProgressFlag(false));
                let errorResponse = error.response.data;
                let errorCode = errorResponse.statusCode;
                let errorMessage = errorResponse.message;
                if (errorCode == 500) {
                    const resetAction = StackActions.reset({
                        index: 0,
                        actions: [NavigationActions.navigate({ routeName: 'Profile' })],
                    });
                    this.props.navigation.dispatch(resetAction);
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
    menuTapViewStats = () => {
        this._menu.hide();
        console.log('menuTapViewStats')
    }
    menuTapGoProfile = () => {
        this._menu.hide();
        const { experience } = this.state;
        this.props.navigation.navigate('UserProfile', { user_id: experience.user._id });
    }
    onClickItem = (item, index) => {
        console.log(item, index);
        if (this.playbackInstance != null) {
            this.setState({ index: index });
            this._updatePlaybackInstanceForIndex(this.state.shouldPlay);
        }

    }
    onTapGoBack = async () => {
        if(isLoading) {
            return;
        }
        if (this.playbackInstance != null) {
            await this.playbackInstance.unloadAsync();
            this.props.navigation.goBack()
        } else {
            this.props.navigation.goBack()
        }
    }
    render() {
        const { flag, isLoading, isPlaying, experience, me } = this.state;
        if (experience == null || experience == undefined) {
            return (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <SkypeIndicator color={PRIMARYCOLOR.ORANGE} size={40} />
                </View>
            )
        }
        return (
            <Container>
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
                        <MenuItem textStyle={{ fontFamily: FONT.MEDIUM }} onPress={this.menuTapViewStats}>View stats</MenuItem>
                        {!me && <MenuItem textStyle={{ fontFamily: FONT.MEDIUM }} onPress={this.menuTapGoProfile}>Profile</MenuItem>}
                        <MenuItem textStyle={{ fontFamily: FONT.MEDIUM, color: 'red' }} onPress={this.menuTapDeleteReportExperience}>{me ? 'Delete Experience' : 'Report'}</MenuItem>
                    </Menu>
                </TouchableOpacity>

                <View style={{ width: DEVICE.WIDTH, backgroundColor: 'white', flex: 1 }}>
                    <ImageBackground source={experience ? ({ uri: experience.image.url }) : (images.sample1)} style={{ flex: 1, height: '100%', width: '100%' }}>
                        <View style={styles.labelView}>
                            <LabelView style={styles.labelStyle} value={experience.description} />
                        </View>
                    </ImageBackground>
                </View>
                <View style={{ flex: 2 }}>
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
                            <View style={[styles.shadow, styles.infoCard]}>
                                <Icon active type='Feather' name="message-circle" style={{ marginLeft: 0, marginRight: 2, color: 'red' }} />
                                <View style={{ paddingHorizontal: 10, flex: 1 }}>
                                    <Text style={{ fontSize: 12, fontFamily: FONT.BOOK }}>{getCount(experience.comments)}</Text>
                                    <Text style={{ fontSize: 12, fontFamily: FONT.BOOK, color: 'red' }}>{'comments'}</Text>
                                </View>
                            </View>
                            <View style={[styles.shadow, styles.infoCard]}>
                                <Icon active type='Feather' name="heart" style={{ marginLeft: 0, marginRight: 2, color: 'red' }} />
                                <View style={{ paddingHorizontal: 10, flex: 1 }}>
                                    <Text style={{ fontSize: 12, fontFamily: FONT.BOOK }}>{getCount(experience.likes)}</Text>
                                    <Text style={{ fontSize: 12, fontFamily: FONT.BOOK, color: 'red' }}>{'likes'}</Text>
                                </View>
                            </View>
                            <View style={[styles.shadow, styles.infoCard]}>
                                <Icon active type='Feather' name="bar-chart-2" style={{ marginLeft: 0, marginRight: 2, color: 'red' }} />
                                <View style={{ paddingHorizontal: 10, flex: 1 }}>
                                    <Text style={{ fontSize: 12, fontFamily: FONT.BOOK }}>{getPlays(experience.plays)}</Text>
                                    <Text style={{ fontSize: 12, fontFamily: FONT.BOOK, color: 'red' }}>{'plays'}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={{ width: '100%', marginTop: 40, marginBottom: 35 }}>
                            <TextView style={{ color: 'white', fontSize: 26, textAlign: 'center' }} value={experience.title} />
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
                                    disabled={this.state.isLoading}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={{ flex: 2 }}>
                        <List>
                            <FlatList
                                data={experience.moments}
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
                                keyExtractor={(item) => item.title}
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
export default withApollo(connect(mapStateToProps)(ViewExperience))