import React, { Component } from 'react';
import { FlatList, StatusBar, TouchableOpacity, Dimensions, Alert, Animated, View, Image, Platform, ActionSheetIOS } from 'react-native';
import { Container, Content, Item, ListItem, Left, Body, Right, CheckBox, Icon, Textarea, List } from 'native-base';
import { Permissions, ImagePicker } from 'expo';
import Spinner from 'react-native-loading-spinner-overlay';
import { connect } from 'react-redux';
import { SwipeListView } from 'react-native-swipe-list-view';
import ActionSheet from 'react-native-actionsheet';

import { styles } from './style';
import { TextView } from '../../../components/textView';
import { Background } from '../../../components/background';
import { HeaderContainer } from '../../../components/header';
import { PRIMARYCOLOR } from '../../../constants/style';
import { InputText } from '../../../components/inputText';
import images from '../../../../assets';
import getPermissionAsync from '../../../constants/funcs';
import { updateProgressFlag } from '../../../actions';
import { createExperience, uploadExperienceImage } from '../../../utils/API/experienceAction';
import MusicPlayer from '../../../utils/Audio';
const { height, width } = Dimensions.get('window');

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
class AddDetailExperience extends Component {
    MusicPlayer = null;
    constructor(props) {
        super(props);
        this.state = {
            flag: false,
            title: '',
            image: '',
            description: '',
            records: this.props.navigation.getParam('records').map((item, i) => ({ key: `${i}`, title: item.title, item: item.item, play: false })),
            playing: false,
        };
        this.rowSwipeAnimatedValues = {};
        Array(this.state.records.length).fill('').forEach((_, i) => {
            this.rowSwipeAnimatedValues[`${i}`] = new Animated.Value(0);
        });
    }
    async componentWillMount() {
        this.MusicPlayer = new MusicPlayer();
    }
    componentWillUnmount() {
    }
    onTapPublish = () => {
        const { title, description, image, records } = this.state;
        if (title == '' || description == '' || image == '') {
            Alert.alert(
                'Vozz',
                'Please fill out title, description and image for your route.',
                [
                    { text: 'OK', onPress: () => console.log('Cancel Pressed'), style: 'cancel' }
                ],
                { cancelable: false }
            )
            return;
        }
        if (records.length < 2) {
            Alert.alert(
                'Vozz',
                'You should choose two records at least to create the route.',
                [
                    { text: 'OK', onPress: () => console.log('Cancel Pressed'), style: 'cancel' }
                ],
                { cancelable: false }
            )
            return;
        }
        this.publishRoute();
        this.MusicPlayer.stopPlay()

    }
    publishRoute = () => {
        const { title, description, image, records } = this.state;
        let temp = [];
        records.map(item => {
            temp.push(item.item._id);
        })
        let temp_tags = [];
        records.map(record => {
            record.item.tags ?
                record.item.tags.map(tag => {
                    temp_tags.push(tag._id);
                })
                :
                null;
        });
        console.log({ temp_tags });
        const output = [...new Map(temp_tags.map(o => [o, o])).values()]
        console.log({ output });
        let body = {
            title: title,
            description: description,
            user: this.props.auth.user._id,
            moments: temp,
            tags: output
        }
        this.props.dispatch(updateProgressFlag(true));
        createExperience(this.props.auth.jwt, body)
            .then((response) => {
                let data = response.data;
                this.uploadExperienceImage(data._id, image);
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
    uploadExperienceImage = (experience_id, image) => {
        const { title, description, records } = this.state;
        let body = new FormData();
        body.append('files', {
            uri: image,
            name: image.split("/").slice(-1)[0],
            type: 'multipart/form-data'
        });
        body.append("refId", experience_id);
        body.append("ref", "experience");
        body.append("field", "image");
        body.append("path", `experiences/${this.props.auth.user._id}`);
        uploadExperienceImage(this.props.auth.jwt, body)
            .then((response) => {
                this.props.dispatch(updateProgressFlag(false));
                this.props.navigation.navigate('LastPageExperience', { title, description, image, records, experience_id });

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
    onchangeTitle = (title) => {
        this.setState({
            title
        })
    }
    actionOnRow = (item, index) => {
        let temp = [...this.state.records];
        temp[index]['value'] = !temp[index]['value'];
        this.setState({ records: temp })
    }
    onTapPlayRow = (play, index) => {
        let temp = [...this.state.records];
        for (t of temp) {
            t.play = false;
        }
        temp[index]['play'] = !play;
        this.setState({ records: temp });
        if (play) {
            this.stopPlay();
            return;
        }

        let uri = temp[index]['item']['audio']['url'];
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
    deleteRow(rowMap, rowKey) {
        this.closeRow(rowMap, rowKey);
        const newData = [...this.state.records];
        const prevIndex = this.state.records.findIndex(item => item.key === rowKey);
        newData.splice(prevIndex, 1);
        this.setState({ records: newData });
    }
    closeRow(rowMap, rowKey) {
        console.log(rowMap, rowKey)
        if (rowMap[rowKey]) {
            rowMap[rowKey].closeRow();
        }
    }
    onRowDidOpen = (rowKey, rowMap) => {
        console.log('This row opened', rowKey);
    }

    onSwipeValueChange = (swipeData) => {
        const { key, value } = swipeData;
        this.rowSwipeAnimatedValues[key].setValue(Math.abs(value));
    }
    onTapImage = () => {
        console.log('onTapImage');
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
                    this.setState({ image: result.uri });
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
                this.setState({ image: result.uri });
            }
        }
    }
    render() {
        const { flag, title, image, records, description } = this.state;

        return (
            <Container style={{ paddingTop: StatusBar.currentHeight }}>
                <Background start={PRIMARYCOLOR.ORANGE} end={PRIMARYCOLOR.ORANGE} />
                <Spinner
                    visible={flag}
                    textContent={""}
                />
                <HeaderContainer player={this.MusicPlayer} title={'Add the details'} goBack={true} navigation={this.props.navigation} right={true} rightText={'Publish'} onTapRight={this.onTapPublish} />
                <ActionSheet
                    ref={o => this.ActionSheet = o}
                    title={<TextView style={{ color: '#000', fontSize: 18 }} value={'Options'} />}
                    options={options}
                    cancelButtonIndex={cancelButtonIndex}
                    destructiveButtonIndex={4}
                    onPress={(index) => this.selectOption(index)}
                />
                <Content contentContainerStyle={styles.contentStyle}>
                    <View style={{ width: '100%', marginTop: 30, paddingHorizontal: 20 }}>
                        <Item regular style={[styles.shadow, { backgroundColor: 'white', borderRadius: 7 }]}>
                            <InputText value={title} placeholder='Title' onChangeText={(title) => this.onchangeTitle(title)}
                            />
                        </Item>
                        <View style={{ marginTop: 15, flexDirection: 'row' }}>
                            <Textarea
                                rowSpan={5}
                                bordered
                                placeholder="Description"
                                style={styles.textAreaStyle}
                                value={description}
                                onChangeText={(description) => this.setState({ description })}
                            />
                            <TouchableOpacity onPress={this.onTapImage}>
                                <View style={[styles.shadow, { width: width * 0.3 - 20, marginLeft: 10, height: 120, borderRadius: 7 }]}>
                                    <Image
                                        style={{ borderRadius: 7, width: '100%', height: '100%' }}
                                        source={image ? ({ uri: image }) : (images.camera)}
                                    />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ flex: 1 }}>
                        <View style={{ width: '100%', marginVertical: 20, paddingHorizontal: 20 }}>
                            <TextView style={{ color: PRIMARYCOLOR.GREY, fontSize: 26 }} value={'Audios'} />
                            <TextView style={{ color: 'grey', fontSize: 18 }} value={'click on the audio to change the title'} />
                        </View>
                        <SwipeListView
                            useFlatList
                            data={records}
                            renderItem={(data, rowMap) => (
                                <ListItem icon button={true} style={styles.rowFront}>
                                    <Left>
                                        <Icon name={'menu'} type='Feather' style={{ color: 'grey' }} />
                                    </Left>
                                    <Body>
                                        <TextView value={data.item.title} />
                                    </Body>
                                    <Right>
                                        <TouchableOpacity onPress={() => this.onTapPlayRow(data.item.play, data.item.key)}>
                                            <Icon name={data.item.play ? 'play' : 'pause'} type='FontAwesome' style={{ color: data.item.play ? PRIMARYCOLOR.ORANGE : 'grey' }} />
                                        </TouchableOpacity>
                                    </Right>
                                </ListItem>
                            )}
                            renderHiddenItem={(data, rowMap) => (
                                <View style={styles.rowBack}>
                                    <TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnRight]} onPress={_ => this.deleteRow(rowMap, data.item.key)}>
                                        <Animated.View
                                            style={[
                                                styles.trash,
                                                {

                                                    transform: [
                                                        {
                                                            scale: this.rowSwipeAnimatedValues[data.item.key].interpolate({
                                                                inputRange: [45, 90],
                                                                outputRange: [0, 1],
                                                                extrapolate: 'clamp',
                                                            }),
                                                        }
                                                    ],
                                                }
                                            ]}
                                        >
                                            <Image source={images.trash} style={styles.trash} />
                                        </Animated.View>
                                    </TouchableOpacity>
                                </View>
                            )}
                            disableRightSwipe={true}
                            rightOpenValue={-75}
                            previewRowKey={'0'}
                            previewOpenValue={-40}
                            previewOpenDelay={3000}
                            onRowDidOpen={this.onRowDidOpen}
                            onSwipeValueChange={this.onSwipeValueChange}
                        />
                    </View>

                </Content>
            </Container>
        )
    }
}
const mapStateToProps = (state) => ({
    auth: state.auth
});
export default connect(mapStateToProps)(AddDetailExperience)