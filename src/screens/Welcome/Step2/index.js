import React, { Component } from 'react';
import { Platform, TouchableOpacity, StatusBar, View, AsyncStorage, ActionSheetIOS } from 'react-native';
import { Container, Content, Body, Icon, Card, CardItem, Thumbnail, Item, Textarea } from 'native-base';
import { ImagePicker, Permissions, } from 'expo';
import { connect } from 'react-redux';
import DatePicker from 'react-native-datepicker';
import { Dropdown } from 'react-native-material-dropdown';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ActionSheet from 'react-native-actionsheet';

import { HeaderContainer } from '../../../components/header';
import { TextView } from '../../../components/textView';
import { Background } from '../../../components/background';
import { InputText } from '../../../components/inputText';

import { styles } from './style';
import images from '../../../../assets';
import getPermissionAsync from '../../../constants/funcs';
import { updateProfile } from '../../../utils/API/userAction';
import { updateUserdata, updateProgressFlag } from '../../../actions';
import { compressImage } from '../../../utils/ImageUtil';
import { errorAlert } from '../../../utils/API/errorHandle';
import { DEVICE } from '../../../constants/style';

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

class Step2 extends Component {
    constructor(props) {
        super(props);
        this.state = {
            image: null,
            base64: '',
            birthDay: '',
            bio: '',
            gender: [
                { value: 'None' },
                { value: 'Male' },
                { value: 'Female' },
                { value: 'Other' }
            ],
            selected_gender: '',
            flag: false
        }
    }

    async componentWillMount() {
    }
    onTapSkip = () => {
        console.log('onTapSkiponTapSkiponTapSkip');
        this.props.navigation.navigate('Step3');
    }
    onTapNext = () => {
        const { selected_gender, birthDay, base64, bio } = this.state;
        this.props.dispatch(updateProgressFlag(true));
        updateProfile(this.props.auth.user._id, this.props.auth.jwt, { birthDay: birthDay, gender: selected_gender, profile_base64: base64, bio: bio })
            .then((response) => {
                this.props.dispatch(updateProgressFlag(false));
                console.log('updateDobGenderImg response', JSON.stringify(response));
                this.props.dispatch(updateUserdata(response.data));
                AsyncStorage.setItem('user', JSON.stringify(response.data));
                this.props.navigation.navigate('Step3');
            })
            .catch((error) => {
                this.props.dispatch(updateProgressFlag(false));
                let errorResponse = error.response.data;
                console.log('updateDobGenderImg error', JSON.stringify(errorResponse));
                let errorCode = errorResponse.statusCode;
                let errorMessage = errorResponse.message;
                errorAlert(errorMessage);
            })
    }
    onTapAvatar = () => {
        console.log('onTapAvatar');
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
        if (await getPermissionAsync(Permissions.CAMERA, Permissions.CAMERA_ROLL)) {
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
                    this.setState({ image: compress_result.uri, base64: compress_result.base64 });
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
                this.setState({ image: compress_result.uri, base64: compress_result.base64 });
            }
        }
    }
    render() {
        const { bio, gender, image, birthDay } = this.state;
        return (
            <Container style={{ paddingTop: StatusBar.currentHeight }}>
                <Background />
                <HeaderContainer title="" navigation={this.props.navigation} goBack={true} right={true} rightText={'skip'} onTapRight={this.onTapSkip} />
                <ActionSheet
                    ref={o => this.ActionSheet = o}
                    title={<TextView style={{ color: '#000', fontSize: 18 }} value={'Options'} />}
                    options={options}
                    cancelButtonIndex={cancelButtonIndex}
                    destructiveButtonIndex={4}
                    onPress={(index) => this.selectOption(index)}
                />
                <Content contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <KeyboardAwareScrollView
                        extraScrollHeight={120}
                        enableOnAndroid
                        enableAutomaticScroll
                        keyboardOpeningTime={0}
                        extraHeight={Platform.select({ android: 200 })}>
                        <View style={styles.titleContainer}>
                            <TextView style={styles.txtTitle} value={'About You'} />
                        </View>
                        <View style={styles.desContainer}>
                            <TextView style={styles.txtDescription} value={'If you want upload a picture and write a short description that represents you or your adventures'} />
                        </View>
                        <View style={styles.infoContainer}>
                            <Card style={styles.cardContainer}>
                                <CardItem>
                                    <Body style={styles.avatarBody}>
                                        <TouchableOpacity onPress={this.onTapAvatar}>
                                            <Thumbnail source={image ? ({ uri: image }) : (images.default_avatar)} style={styles.thumbNail} />
                                        </TouchableOpacity>
                                    </Body>
                                </CardItem>
                                <CardItem>
                                    <Body style={{ backgroundColor: '', flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <View style={{ width: '40%', alignSelf: 'center' }}>
                                            <DatePicker
                                                style={{ width: 0, height: 0 }}
                                                ref="datepicker"
                                                customStyles={{
                                                    dateIcon: {
                                                        width: 0,
                                                        height: 0,
                                                    },
                                                    dateInput: {
                                                        borderWidth: 0,
                                                    },
                                                }}
                                                date={birthDay}
                                                mode="date"
                                                format="YYYY-MM-DD"
                                                maxDate={new Date()}
                                                hideText={true}
                                                confirmBtnText="Confirm"
                                                cancelBtnText="Cancel"
                                                onDateChange={birthDay => {
                                                    this.setState({ birthDay: birthDay });
                                                }}
                                            />
                                            <Item
                                                onPress={
                                                    () => {
                                                        this.refs.datepicker.onPressDate();
                                                    }
                                                }
                                            >

                                                <Icon active name='calendar' sty={{ color: 'grey' }} />
                                                <InputText
                                                    disabled={true}
                                                    placeholder={'Birthday'}
                                                    style={styles.inputStyle}
                                                    value={this.state.birthDay}
                                                />
                                            </Item>
                                        </View>
                                        <View style={{ width: '40%', alignSelf: 'center', marginBottom: 5 }}>
                                            <Dropdown
                                                label="Gender"
                                                style={{ width: DEVICE.WIDTH - 10 }}
                                                data={gender}
                                                textColor={'#000000'}
                                                // itemTextStyle={styles.inputStyle}
                                                onChangeText={(value, key) => {
                                                    this.setState({ selected_gender: key });
                                                }}
                                            />
                                        </View>

                                    </Body>
                                </CardItem>
                                <CardItem>
                                    <Body>
                                        <Textarea value={bio} rowSpan={5} bordered placeholder="About me" style={styles.textAreaStyle} onChangeText={(bio) => this.setState({ bio })} />
                                    </Body>
                                </CardItem>
                            </Card>
                        </View>

                    </KeyboardAwareScrollView>
                    <View style={styles.bottomView}>
                        <TouchableOpacity iconRight light style={styles.nextTapView} onPress={() => this.onTapNext()}>
                            <Icon name='arrow-right' type='FontAwesome' style={styles.iconStyle} />
                        </TouchableOpacity>
                    </View>
                </Content>
            </Container>
        );
    }
    //}
}
const mapStateToProps = (state) => ({
    auth: state.auth
});
export default connect(mapStateToProps)(Step2);