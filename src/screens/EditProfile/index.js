import React, { Component } from 'react';
import { StatusBar, TouchableOpacity, Dimensions, Animated, View, Platform, AsyncStorage, ActionSheetIOS } from 'react-native';
import { Container, Content, Item, ListItem, Left, Body, Right, Icon, Textarea, Thumbnail } from 'native-base';
import { Permissions, ImagePicker } from 'expo';
import Spinner from 'react-native-loading-spinner-overlay';
import { connect } from 'react-redux';
import { SwipeListView } from 'react-native-swipe-list-view';
import ActionSheet from 'react-native-actionsheet';
import DatePicker from 'react-native-datepicker';
import { Dropdown } from 'react-native-material-dropdown';
import CountryPicker, {
    getAllCountries
} from 'react-native-country-picker-modal';
import DeviceInfo from 'react-native-device-info'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { styles } from './style';
import { TextView } from '../../components/textView';
import { Background } from '../../components/background';
import { HeaderContainer } from '../../components/header';
import { PRIMARYCOLOR } from '../../constants/style';
import { InputText } from '../../components/inputText';
import images from '../../../assets';
import getPermissionAsync from '../../constants/funcs';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import { updateProgressFlag, updateUserdata } from '../../actions';
import { updateProfile } from '../../utils/API/userAction';
import { compressImage } from '../../utils/ImageUtil';

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

class EditProfile extends Component {
    constructor(props) {
        super(props);
        let userLocaleCountryCode = DeviceInfo.getDeviceCountry()
        const userCountryData = getAllCountries()
            .filter(country => country.cca2 === userLocaleCountryCode)
            .pop()
        let callingCode = null
        let cca2 = userLocaleCountryCode
        if (!cca2 || !userCountryData) {
            cca2 = 'ES'
            callingCode = '34'
        } else {
            callingCode = userCountryData.callingCode
        }

        this.state = {
            flag: false,
            image: this.props.auth.user.profile_base64,
            userName: this.props.auth.user.username,
            fullName: '',
            bio: this.props.auth.user.bio,
            email: this.props.auth.user.email,
            phoneNumber: this.props.auth.user.phone,
            birthDay: this.props.auth.user.birthDay,
            gender: [{
                value: 'Male',
            }, {
                value: 'Female',
            }],
            selected_gender: this.props.auth.user.gender,
            cca2: this.props.auth.user.countryName ? this.props.auth.user.countryName : cca2,
            callingCode: this.props.auth.user.countryCode ? this.props.auth.user.countryCode : callingCode,

            userName_success: false,
            userName_error: false,
            email_success: false,
            email_error: false,

        };
    }
    async componentWillMount() {
    }
    componentWillUnmount() {
    }
    onTapDone = () => {
        console.log('onTapDone');
        const { image, userName, fullName, bio, email, phoneNumber, birthDay, selected_gender, cca2, callingCode } = this.state;
        let user = {
            profile_base64: image,
            username: userName,
            email: email,
            bio: bio,
            phone: phoneNumber,
            birthDay: birthDay,
            gender: selected_gender,
            countryName: cca2,
            countryCode: callingCode
        };
        this.props.dispatch(updateProgressFlag(true));
        updateProfile(this.props.auth.user._id, this.props.auth.jwt, user)
            .then((response) => {
                this.props.dispatch(updateProgressFlag(false));
                console.log('updateProfile response', JSON.stringify(response));
                this.props.dispatch(updateUserdata(response.data));
                AsyncStorage.setItem('user', JSON.stringify(response.data));
                this.props.navigation.goBack();
            })
            .catch((error) => {
                this.props.dispatch(updateProgressFlag(false));
                let errorResponse = error.response.data;
                console.log('updateProfile error', JSON.stringify(errorResponse));
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
    onTapItem = (item, index) => {
        console.log('onTapItem', item, index);
    }
    //validation input field
    onchangeUsername = (userName) => {
        if (userName.trim() == '') {
            this.setState({
                userName,
                userName_error: true
            })
            return;
        }
        this.setState({
            userName,
            userName_error: false
        })
    }
    onchangefullName = (fullName) => {
        this.setState({
            fullName
        })
    }
    onchangeEmail = (email) => {
        if (email.trim() == '') {
            this.setState({
                email,
                email_error: true
            })
            return;
        }
        this.setState({
            email,
            email_error: false
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
                    this.setState({ image: compress_result.base64 });
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
                this.setState({ image: compress_result.base64 });
            }
        }
    }
    render() {
        const { flag, bio, image, userName, email, fullName, birthDay, gender, selected_gender, phoneNumber, cca2, callingCode, userName_error, userName_success, email_error, email_success } = this.state;

        return (
            <Container style={{ paddingTop: StatusBar.currentHeight }}>
                <Background start={PRIMARYCOLOR.ORANGE} end={PRIMARYCOLOR.ORANGE} />
                <Spinner
                    visible={flag}
                    textContent={""}
                />
                <HeaderContainer title={'Edit Profile'} goBack={true} navigation={this.props.navigation} right={true} rightText={'Done'} onTapRight={this.onTapDone} />
                <ActionSheet
                    ref={o => this.ActionSheet = o}
                    title={<TextView style={{ color: '#000', fontSize: 18 }} value={'Options'} />}
                    options={options}
                    cancelButtonIndex={cancelButtonIndex}
                    destructiveButtonIndex={4}
                    onPress={(index) => this.selectOption(index)}
                />
                <Content contentContainerStyle={styles.contentStyle}>
                    <KeyboardAwareScrollView
                        extraScrollHeight={0}
                        enableOnAndroid
                        enableAutomaticScroll
                        keyboardOpeningTime={0}
                        showsVerticalScrollIndicator={false}
                        extraHeight={Platform.select({ android: 200 })}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View onPress={this.onTapAvatar} style={{ alignItems: 'center', marginVertical: 20 }}>
                                <TouchableOpacity onPress={this.onTapAvatar}>
                                    <Thumbnail source={image ? ({ uri: `data:image/png;base64,${image}` }) : (images.default_avatar)} style={styles.thumbNail} />
                                </TouchableOpacity>
                            </View>

                            <View style={{ flex: 1 }}>
                                <View style={{ width: '100%' }}>
                                    <View style={{ marginBottom: 10, borderColor: 'red' }}>
                                        <Item rounded style={{ backgroundColor: 'white' }}>
                                            <Icon active type='FontAwesome' name='user-circle' style={{ color: 'grey' }} />
                                            <InputText style={styles.inputStyle} value={fullName} placeholder='full name' onChangeText={(fullName) => this.onchangefullName(fullName)}
                                            />
                                        </Item>
                                    </View>
                                    <View style={{ marginBottom: 10 }}>
                                        <Item error={userName_error} success={userName_success} rounded style={{ backgroundColor: 'white' }}>
                                            <Icon active type='FontAwesome' name='user-circle' style={{ color: 'grey' }} />
                                            <InputText style={styles.inputStyle} value={userName} placeholder='username' onChangeText={(userName) => this.onchangeUsername(userName)}
                                            />
                                            {userName_success && <Icon name='checkmark-circle' />}
                                            {userName_error && <Icon name='close-circle' />}
                                        </Item>
                                    </View>
                                    <View style={{ marginBottom: 10 }}>
                                        <Textarea rowSpan={5} bordered placeholder="About me" style={styles.textAreaStyle} value={bio} onChangeText={(bio) => this.setState({ bio })} />
                                    </View>
                                    <View style={{ marginBottom: 20, marginTop: 10, marginLeft: 10 }}>
                                        <TextView style={{ fontSize: 20 }} value={'Private Information'} />
                                    </View>
                                    <View style={{ marginBottom: 10 }}>
                                        <Item error={email_error} success={email_success} rounded style={{ backgroundColor: 'white' }}>
                                            <Icon active type='MaterialIcons' name='email' style={{ color: 'grey' }} />
                                            <InputText style={styles.inputStyle} value={email} placeholder='Email' onChangeText={(email) => this.onchangeEmail(email)}
                                                keyboardType="email-address" />
                                            {email_success && <Icon name='checkmark-circle' />}
                                            {email_error && <Icon name='close-circle' />}
                                        </Item>
                                    </View>
                                    <View style={{ width: '100%', alignSelf: 'center' }}>
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
                                                this.setState({ birthDay });
                                            }}
                                        />
                                        <Item
                                            rounded
                                            style={{ backgroundColor: 'white' }}
                                            onPress={
                                                () => {
                                                    this.refs.datepicker.onPressDate();
                                                }
                                            }
                                        >

                                            <Icon active name='calendar' style={{ color: 'grey' }} />
                                            <InputText
                                                disabled={true}
                                                placeholder={'Birthday'}
                                                style={styles.inputStyle}
                                                value={birthDay}
                                            />
                                        </Item>
                                    </View>
                                    <View >
                                        <Item style={{ paddingLeft: 10, alignSelf: "flex-start", flexDirection: "row", borderBottomWidth: 1 }}>
                                            <CountryPicker
                                                style={{ flex: 1, borderWidth: 0 }}
                                                onChange={value => {
                                                    this.setState({ cca2: value.cca2, callingCode: value.callingCode })
                                                }}
                                                showCallingCode={true}
                                                cca2={cca2}
                                                translation="eng"
                                            />
                                            <TextView style={{ fontSize: 16 }} value={`+${callingCode}`} />
                                            <View style={{ flexDirection: "row", marginLeft: 10 }}>
                                                <InputText
                                                    style={styles.inputStyle}
                                                    placeholder="Phone Number"
                                                    value={phoneNumber}
                                                    onChangeText={(phoneNumber) => this.setState({
                                                        phoneNumber
                                                    })}
                                                    keyboardType="phone-pad"
                                                />
                                            </View>
                                        </Item>
                                    </View>
                                    <View style={{ width: '95%', alignSelf: 'center', marginTop: -5, marginBottom: 20 }}>
                                        <Dropdown
                                            label="Gender"
                                            style={{ width: '100%' }}
                                            data={gender}
                                            value={selected_gender == 0 ? 'Male' : 'Female'}
                                            textColor={'#000000'}
                                            // itemTextStyle={styles.inputStyle}
                                            onChangeText={(value, index) => {
                                                this.setState({ selected_gender: index });
                                            }}
                                        />
                                    </View>
                                </View>
                            </View>

                        </ScrollView>
                    </KeyboardAwareScrollView>
                </Content>
            </Container>
        )
    }
}
const mapStateToProps = (state) => ({
    auth: state.auth
});
export default connect(mapStateToProps)(EditProfile)