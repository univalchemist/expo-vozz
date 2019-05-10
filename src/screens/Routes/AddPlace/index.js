import React, { Component } from 'react';
import { StatusBar, Dimensions, View, Image, TouchableHighlight, Alert } from 'react-native';
import { Container, Content } from 'native-base';
import { Asset, Audio, MapView, Location, Permissions } from 'expo';
import { MaterialIcons } from '@expo/vector-icons';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';


import Spinner from 'react-native-loading-spinner-overlay';
import { connect } from 'react-redux';
import Slider from 'react-native-slider';

import {
    BallIndicator,
    BarIndicator,
    DotIndicator,
    MaterialIndicator,
    PacmanIndicator,
    PulseIndicator,
    SkypeIndicator,
    UIActivityIndicator,
    WaveIndicator
} from 'react-native-indicators';

import { styles } from './style';
import { Background } from '../../../components/background';
import { HeaderContainer } from '../../../components/header';
import { PRIMARYCOLOR, FONT } from '../../../constants/style';
import images from '../../../../assets';
import { CustomMarker } from '../../../components/customMarker';
import CONSTANTS from '../../../utils/constantes';
import getPermissionAsync from '../../../constants/funcs';
import { createRoute, uploadRouteImage } from '../../../utils/API/routeAction';
import { updateProgressFlag } from '../../../actions';

const { width, height } = Dimensions.get('window');
const BACKGROUND_COLOR = 'transparent';
const LOADING_STRING = 'Loading...';

const ASPECT_RATIO = width / (height - 100);
const LATITUDE = 40.4123776;
const LONGITUDE = -3.7045121;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
class AddPlace extends Component {
    constructor(props) {

        super(props);

        this.musicCount = this.props.navigation.getParam('records').length,
            this.index = 0;
        this.isSeeking = false;
        this.shouldPlayAtEndOfSeek = false;
        this.playbackInstance = null;
        this.state = {

            buttonTitle: 'Next',

            flag: false,
            title: this.props.navigation.getParam('records')[0].title,

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

            markers: [],
            region: null,
            initialRegion: null,
            records: this.props.navigation.getParam('records'),
            title: this.props.navigation.getParam('title'),
            description: this.props.navigation.getParam('description'),
            image: this.props.navigation.getParam('image'),

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
        this._loadNewPlaybackInstance(false);
        this._getLocationAsync();
    }
    componentWillUnmount() {
    }
    _getLocationAsync = async () => {
        if (await getPermissionAsync(Permissions.LOCATION)) {
            let location = await Location.getCurrentPositionAsync({});
            console.log('current location>', location);
            let region = { latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 0.0922, longitudeDelta: 0.0421 }
            this.setState({ region, initialRegion: region });
        }
    };
    async _loadNewPlaybackInstance(playing) {
        if (this.playbackInstance != null) {
            await this.playbackInstance.unloadAsync();
            this.playbackInstance.setOnPlaybackStatusUpdate(null);
            this.playbackInstance = null;
        }

        const source = { uri: this.state.records[this.index].item.audio.url };
        const initialStatus = {
            shouldPlay: playing,
            rate: this.state.rate,
            volume: this.state.volume,
            isLooping: true,
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
            this.props.dispatch(updateProgressFlag(false));
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
                // this._advanceIndex(true);
                // this._updatePlaybackInstanceForIndex(true);
            }
        } else {
            if (status.error) {
                console.log(`FATAL PLAYER ERROR: ${status.error}`);
            }
        }
    };

    _advanceIndex(forward) {
        this.index =
            (this.index + (forward ? 1 : this.musicCount - 1)) %
            this.musicCount;
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

    _onStopPressed = async () => {
        if (this.playbackInstance != null) {
            this.playbackInstance.stopAsync();
        }
    };

    _onForwardPressed = () => {
        if (this.playbackInstance != null) {
            this._advanceIndex(true);
            this._updatePlaybackInstanceForIndex(false);
        }
    };

    _onBackPressed = () => {
        if (this.playbackInstance != null) {
            this._advanceIndex(false);
            this._updatePlaybackInstanceForIndex(this.state.shouldPlay);
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
    onchangeTitle = (title) => {
        this.setState({
            title
        })
    }
    onTapNext = () => {
        const { region } = this.state;
        if (region == null) {
            return;
        }
        this._onStopPressed();
        if (this.state.buttonTitle == 'Publish') {
            this.publishRoute();
            return;
        }

        let coordinate = { latitude: region.latitude, longitude: region.longitude };
        this.setState({
            markers: [
                ...this.state.markers,
                {
                    coordinate: coordinate,
                    key: `${this.index + 1}`,
                },
            ],
            buttonTitle: (this.index == this.musicCount - 1) ? 'Publish' : 'Next'
        });
        if (this.index != this.musicCount - 1) {
            this._onForwardPressed()
        }
    }
    publishRoute = () => {
        const { records, title, description, image, markers } = this.state;
        let temp = [];
        records.map(item => {
            temp.push(item.item._id);
        })
        let temp_tags = [];
        records.map(record => {
            record.item.tags.map(tag => {
                temp_tags.push(tag._id);
            });
        });
        console.log({ temp_tags});
        const output = [...new Map(temp_tags.map(o => [o, o])).values()]
        console.log({ output});
        let body = {
            title: title,
            description: description,
            borrador: true,
            user: this.props.auth.user._id,
            markers: markers,
            moments: temp,
            tags: output
        }
        this.props.dispatch(updateProgressFlag(true));
        createRoute(this.props.auth.jwt, body)
            .then((response) => {
                let data = response.data;
                this.uploadRouteImage(data._id, image);
            })
            .catch((error) => {
                this.props.dispatch(updateProgressFlag(false));
                let errorResponse = error.response.data;
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
    uploadRouteImage = (route_id, image) => {
        const { title, description, records, markers } = this.state;
        let body = new FormData();
        body.append('files', {
            uri: image,
            name: image.split("/").slice(-1)[0],
            type: 'multipart/form-data'
        });
        body.append("refId", route_id);
        body.append("ref", "route");
        body.append("field", "image");
        body.append("path", `routes/${this.props.auth.user._id}`);
        uploadRouteImage(this.props.auth.jwt, body)
            .then((response) => {
                this.props.dispatch(updateProgressFlag(false));
                this.props.navigation.navigate('LastPage', { route_id, title, description, records, image, markers });

            })
            .catch((error) => {
                this.props.dispatch(updateProgressFlag(false));
                let errorResponse = error.response.data;
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
    onRegionChange = (region) => {
        this.setState({ region });
    }
    onTapResult = (data, details) => {
        let location = details.geometry.location;
        console.log('location::', location);
        let region = { latitude: location.lat, longitude: location.lng, latitudeDelta: 0.0922, longitudeDelta: 0.0852 }
        this.setState({ region });
    }
    render() {
        const { flag, buttonTitle, markers, region, isPlaying, initialRegion, title, isLoading, records } = this.state;
        return (
            <Container style={{ paddingTop: StatusBar.currentHeight }}>
                <Background start={PRIMARYCOLOR.ORANGE} end={PRIMARYCOLOR.ORANGE} />
                <Spinner
                    visible={flag}
                    textContent={""}
                />
                <HeaderContainer playbackInstance={this.playbackInstance} title={records[this.index].title} goBack={true} navigation={this.props.navigation} right={true} rightText={buttonTitle} onTapRight={this.onTapNext} />
                <Content contentContainerStyle={styles.contentStyle}>
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
                                {!isLoading ? <View style={{width: 40, height: 40 }}>
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
                                    <View style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center'}}><SkypeIndicator color='white' size={25} /></View>
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
                    <View style={{ width: width, flex: 1, backgroundColor: 'white' }}>
                        <View style={[styles.shadow, { zIndex: 9999, width: width - 40, position: 'absolute', top: -10, right: 20 }]}>

                            <GooglePlacesAutocomplete
                                placeholder="Search"
                                minLength={2}
                                autoFocus={false}
                                returnKeyType={'search'}
                                listViewDisplayed={false}
                                fetchDetails={true}
                                onPress={(data, details = null) => this.onTapResult(data, details)}
                                getDefaultValue={() => {
                                    return '';
                                }}
                                query={{
                                    key: CONSTANTS.GOOGLE_MAP_PLACE_API_KEY,
                                    language: 'en',
                                    types: '(cities)',
                                }}
                                styles={{
                                    description: {
                                        fontFamily: FONT.MEDIUM,
                                    },
                                    predefinedPlacesDescription: {
                                        color: '#1faadb',
                                    },
                                    container: {
                                        backgroundColor: 'transparent'
                                    },
                                    textInputContainer: {
                                        backgroundColor: 'white',
                                        borderRadius: 7
                                    },
                                    textInput: {
                                        fontFamily: FONT.MEDIUM
                                    },
                                    listView: {
                                    },
                                    row: {
                                        backgroundColor: 'white'
                                    },
                                    poweredContainer: {
                                        display: 'none'
                                    },
                                    powered: {
                                        display: 'none'
                                    }
                                }}
                                currentLocation={false}
                                nearbyPlacesAPI="GooglePlacesSearch"
                                GoogleReverseGeocodingQuery={{
                                }}
                                GooglePlacesSearchQuery={{
                                    rankby: 'distance',
                                    types: 'food',
                                }}
                                filterReverseGeocodingByTypes={[
                                    'locality',
                                    'administrative_area_level_3',
                                ]}
                                debounce={200}
                                GooglePlacesDetailsQuery={{
                                    fields: 'formatted_address',
                                }}
                                predefinedPlacesAlwaysVisible={false}
                            />
                        </View>
                        <View style={styles.markerFixed}>
                            <Image style={styles.marker} source={images.flag_blue} />
                        </View>
                        <View style={{ height: '100%', flex: 1 }}>
                            {
                                (initialRegion != null || initialRegion != undefined) &&
                                <MapView
                                    style={{ flex: 1 }}
                                    initialRegion={initialRegion}
                                    showsUserLocation={false}
                                    onRegionChangeComplete={this.onRegionChange}
                                >
                                    {markers.map(marker => (
                                        <MapView.Marker
                                            title={marker.key}
                                            key={marker.key}
                                            coordinate={marker.coordinate}
                                        >
                                            <CustomMarker text={marker.key} {...marker} />
                                        </MapView.Marker>
                                    ))}
                                </MapView>
                            }

                        </View>

                    </View>
                </Content>
            </Container>
        )
    }
}
const mapStateToProps = (state) => ({
    auth: state.auth
});
export default connect(mapStateToProps)(AddPlace)