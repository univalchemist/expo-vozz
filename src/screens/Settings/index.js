import React, { Component } from 'react';
import { StatusBar, View, Platform, AppState } from 'react-native';
import { Container, Content, CheckBox } from 'native-base';
import { Permissions, IntentLauncherAndroid as IntentLauncher, Linking } from 'expo';
import Spinner from 'react-native-loading-spinner-overlay';
import { connect } from 'react-redux';

import { styles } from './style';
import { TextView } from '../../components/textView';
import { Background } from '../../components/background';
import { HeaderContainer } from '../../components/header';
import { PRIMARYCOLOR } from '../../constants/style';
import getPermissionAsync from '../../constants/funcs';
import { FlatList } from 'react-native-gesture-handler';

class Settings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            flag: false,
            permissions: [
                { id: 0, checked: false, title: 'Location Permission', des: 'We use the location Permission to be able to know where you are at to show you the closest routes and experiences. Also eventually some other infomation relevant to your location like special offers and deal on our network' },
                { id: 1, checked: false, title: 'Notification Permission', des: 'We use the notification Permission to inform you of any updates that might happen on Vozz as well as notification from your firends, peoples you follow and interactions on your contents. We might use it some times to show you deals and special offers of our network' },
                { id: 2, checked: false, title: 'Recording Permission', des: 'We use the Recording Permission for you to be able to record audios to create Moments, Experiences and Routes' },
                { id: 3, checked: false, title: 'Files Permission', des: 'We use this Permission to be able to store your audios and pictures on your phone' },
                { id: 4, checked: false, title: 'Camera Permission', des: 'We use this Permission for you to be able to take a picture for your profile, Experience and Routes' },
            ],
            appState: AppState.currentState
        };
    }
    async componentDidMount() {
        AppState.addEventListener('change', this._handleAppStateChange);
        this.getPermissions()

    }
    componentWillUnmount() {
        AppState.removeEventListener('change', this._handleAppStateChange);
    }
    _handleAppStateChange = (nextAppState) => {
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            console.log('App has come to the foreground!')
            this.getPermissions()
        }
        this.setState({ appState: nextAppState });
    }
    getPermissions = async () => {
        const _permissions = [...this.state.permissions];

        let status0 = await this.getPermissionStatus(Permissions.LOCATION);
        if (status0) {
            _permissions[0].checked = true;
        } else {
            _permissions[0].checked = false;
        }
        let status1 = await this.getPermissionStatus(Permissions.NOTIFICATIONS);
        if (status1) {
            _permissions[1].checked = true;
        } else {
            _permissions[1].checked = false;
        }
        let status2 = await this.getPermissionStatus(Permissions.AUDIO_RECORDING);
        if (status2) {
            _permissions[2].checked = true;
        } else {
            _permissions[2].checked = false;
        }
        let status3 = await this.getPermissionStatus(Permissions.CAMERA_ROLL);
        if (status3) {
            _permissions[3].checked = true;
        } else {
            _permissions[3].checked = false;
        }
        let status4 = await this.getPermissionStatus(Permissions.CAMERA);
        if (status4) {
            _permissions[4].checked = true;
        } else {
            _permissions[4].checked = false;
        }
        this.setState({ permissions: _permissions });


    }

    getPermissionStatus = async (permission) => {
        let { status } = await Permissions.getAsync(permission);
        if (status !== 'granted') {
            return false;
        }
        return true;
    }
    onTapDone = () => {
        console.log('onTapDone');
        this.props.navigation.goBack();
    }

    onTapItem = async (item, index) => {
        console.log('onTapItem', item, index);
        const _permissions = [...this.state.permissions];
        switch (index) {
            case 0:
                if (item.checked) {
                    Platform.OS === 'android' ?
                        IntentLauncher.startActivityAsync(IntentLauncher.ACTION_LOCATION_SOURCE_SETTINGS)
                        :
                        Linking.openURL('app-settings:')
                    return;
                } else {
                    const status0 = await getPermissionAsync(Permissions.LOCATION);
                    _permissions[0].checked = status0;
                    this.setState({ permissions: _permissions });
                    return;
                }

            case 1:
                if (item.checked) {
                    Platform.OS === 'android' ?
                        IntentLauncher.startActivityAsync(IntentLauncher.ACTION_NOTIFICATION_SETTINGS)
                        :
                        Linking.openURL('app-settings:')
                    return;
                } else {
                    const status1 = await getPermissionAsync(Permissions.NOTIFICATIONS);
                    _permissions[1].checked = status1;
                    this.setState({ permissions: _permissions });
                    return;
                }

            case 2:
                if (item.checked) {
                    Platform.OS === 'android' ?
                        IntentLauncher.startActivityAsync(IntentLauncher.ACTION_MANAGE_APPLICATIONS_SETTINGS)
                        :
                        Linking.openURL('app-settings:')
                    return;
                } else {
                    const status2 = await getPermissionAsync(Permissions.AUDIO_RECORDING);
                    _permissions[2].checked = status2;
                    this.setState({ permissions: _permissions });
                    return;
                }

            case 3:
                if (item.checked) {
                    Platform.OS === 'android' ?
                        IntentLauncher.startActivityAsync(IntentLauncher.ACTION_MANAGE_APPLICATIONS_SETTINGS)
                        :
                        Linking.openURL('app-settings:')
                    return;
                } else {
                    const status3 = await getPermissionAsync(Permissions.CAMERA_ROLL);
                    _permissions[3].checked = status3;
                    this.setState({ permissions: _permissions });
                    return;
                }
            case 4:
                if (item.checked) {
                    Platform.OS === 'android' ?
                        IntentLauncher.startActivityAsync(IntentLauncher.ACTION_MANAGE_APPLICATIONS_SETTINGS)
                        :
                        Linking.openURL('app-settings:')
                    return;
                } else {
                    const status4 = await getPermissionAsync(Permissions.CAMERA);
                    _permissions[4].checked = status4;
                    this.setState({ permissions: _permissions });
                    return;
                }

            default:
                return;
        }

    }
    render() {
        const { flag, permissions } = this.state;

        return (
            <Container style={{ paddingTop: StatusBar.currentHeight }}>
                <Background start={PRIMARYCOLOR.ORANGE} end={PRIMARYCOLOR.ORANGE} />
                <Spinner
                    visible={flag}
                    textContent={""}
                />
                <HeaderContainer title={'Permission Settings'} goBack={true} navigation={this.props.navigation} right={true} rightText={'Done'} onTapRight={this.onTapDone} />
                <Content contentContainerStyle={styles.contentStyle}>

                    <FlatList
                        data={permissions}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item, index }) => (
                            <View>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <CheckBox checked={item.checked} color={PRIMARYCOLOR.ORANGE} onPress={() => this.onTapItem(item, index)} />
                                    <TextView style={styles.textStyle} value={item.title} />
                                </View>
                                <View style={{ marginVertical: 20, marginLeft: 10 }}>
                                    <TextView style={{ color: 'grey' }} value={item.des} />
                                </View>
                            </View>
                        )
                        }
                        keyExtractor={(item) => `${item.id}`}
                    />
                </Content>
            </Container>
        )
    }
}

export default connect()(Settings)