import React, { Component } from 'react';
import { TouchableOpacity, StatusBar, View, Text, AppState, Platform } from 'react-native';
import { Container, Content, Icon, Card, CardItem, CheckBox } from 'native-base';
import { Permissions, IntentLauncherAndroid as IntentLauncher, Linking } from 'expo';

import { HeaderContainer } from '../../../components/header';
import { TextView } from '../../../components/textView';
import { Background } from '../../../components/background';
import { styles } from './style';
import { PRIMARYCOLOR } from '../../../constants/style';
import getPermissionAsync from '../../../constants/funcs';

class Step3 extends Component {
    constructor(props) {
        super(props);
        this.state = {
            permissions: [
                { id: 0, checked: false, title: 'Location Permission' },
                { id: 1, checked: false, title: 'Notification Permission' },
                { id: 2, checked: false, title: 'Recording Permission' },
            ],
            appState: AppState.currentState
        }
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
        this.setState({ permissions: _permissions });


    }

    getPermissionStatus = async (permission) => {
        let { status } = await Permissions.getAsync(permission);
        if (status !== 'granted') {
            return false;
        }
        return true;
    }
    onTapFinsih = () => {
        console.log('onTapNext');
        this.props.navigation.navigate('Home');
        return;
    }
    actionOnRow = async (item, index) => {
        console.log('tap permission', item);
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

            default:
                return;
        }
    }
    render() {
        const { permissions } = this.state;
        return (
            <Container style={{ paddingTop: StatusBar.currentHeight }}>
                <Background />
                <HeaderContainer title="" navigation={this.props.navigation} goBack={true} right={false} />
                <Content contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <View style={styles.titleContainer}>
                        <TextView style={styles.txtTitle} value={'Almost there!'} />
                    </View>
                    <View style={styles.desContainer}>
                        <Text style={styles.txtDescription} value={'We need you to let Vozz to be able to know where you are to offer the best experience possible and send you notifications'} />
                    </View>
                    <View style={styles.infoContainer}>
                        <Card style={styles.cardContainer}>
                            {permissions.map((item, index) => (

                                <CardItem key={index} button={true} onPress={() => this.actionOnRow(item, index)}>
                                    <CheckBox checked={item.checked} color={PRIMARYCOLOR.PURPLE} onPress={() => this.actionOnRow(item, index)} />
                                    <TextView style={styles.textStyle} value={item.title} />
                                </CardItem>

                            ))}
                        </Card>
                    </View>
                    <View style={styles.bottomView}>
                        <TouchableOpacity iconRight light style={styles.nextTapView} onPress={() => this.onTapFinsih()}>
                            <Icon name='check' type='FontAwesome' style={styles.iconStyle} />
                        </TouchableOpacity>
                    </View>
                </Content>
            </Container>
        );
    }
    //}
}
export default Step3;