import React, { Component } from 'react';
import { AsyncStorage, Image, KeyboardAvoidingView, TouchableOpacity, View, SafeAreaView, Dimensions, Alert } from 'react-native';
import { Item, Icon, Button } from 'native-base';
import { saveAuthdata, updateProgressFlag, savePushToken, registerPushToken } from '../../../actions/index'
import { connect } from 'react-redux';

import { InputText } from '../../../components/inputText'
import { TextView } from '../../../components/textView'
import { Background } from '../../../components/background'

import { styles } from './style';
import { SignIn, forgetPassword, getProfile } from '../../../utils/API/userAction';
import { errorAlert } from '../../../utils/API/errorHandle';
import Backend from '../../../utils/Firebase/ChatUtil';
import { registerForPushNotificationsAsync } from '../../../constants/funcs';
let SCREEN_WIDTH = Dimensions.get('window').width

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            identifier: "",
            password: "",
            tokenjwt: "",
            email: "",
            erromsg: "",
            loading: false,
            error: false,
            errorforgotpassword: false,
            forgotPassword: false,

            username_success: false,
            username_error: false,
            email_success: false,
            email_error: false,
            password_success: false,
            password_error: false,
            flag: false,
            pushToken: ''
        }
        this.forgotPassword = this.forgotPassword.bind(this);
    }

    async componentDidMount() {
        const pushToken = await registerForPushNotificationsAsync();
        console.log({ pushToken });
        if (pushToken) {
            this.setState({ pushToken });
            this.props.dispatch(savePushToken(pushToken))
        }
    }

    forgotPassword() {
        this.setState({
            forgotPassword: !this.state.forgotPassword,
            error: false
        })
    }
    ontapForgot = () => {
        console.log('ontapForgotontapForgotontapForgotontapForgot');
    }
    handleSubmit = () => {
        const { email, password, identifier, forgotPassword } = this.state;
        if (identifier.trim() == '' && !forgotPassword) {
            this.setState({
                username_error: true
            })
            return;
        }
        if (email.trim() == '' && forgotPassword) {
            this.setState({
                email_error: true
            })
            return;
        }
        if (password.trim() == '' && !forgotPassword) {
            this.setState({
                password_error: true
            })
            return;
        }
        this.setState({
            error: false,
            erromsg: "",
            errorforgotpassword: false
        })
        if (!forgotPassword) {
            this.props.dispatch(updateProgressFlag(true));
            const body = {
                identifier: identifier,
                password: password
            }
            SignIn(body)
                .then((response) => {
                    let data = response.data;

                    getProfile(data.user._id)
                        .then((response1) => {
                            let data1 = response1.data;
                            this.props.dispatch(updateProgressFlag(false));
                            this.props.dispatch(saveAuthdata({ jwt: data.jwt, user: data1 }));
                            if (this.state.pushToken) {
                                this.props.dispatch(registerPushToken(data.user._id, data.jwt, this.state.pushToken));
                            }
                            AsyncStorage.setItem('jwt', data.jwt);
                            AsyncStorage.setItem('user', JSON.stringify(data1));
                            Backend.setChatListRef(data1._id);
                            Backend.fetchChatUsers(this.props.dispatch)
                            if (data.jwt) { this.props.navigation.navigate('Home') }
                        })
                        .catch((error) => {
                            this.props.dispatch(updateProgressFlag(false));
                            let errorResponse = error.response.data;
                            console.log('getProfile error', JSON.stringify(errorResponse));
                            let errorCode = errorResponse.statusCode;
                            let errorMessage = errorResponse.message;
                            errorAlert(errorMessage);
                        })

                })
                .catch((error) => {
                    this.props.dispatch(updateProgressFlag(false));
                    let errorResponse = error.response.data;
                    console.log('SignIn error', JSON.stringify(errorResponse));
                    let errorCode = errorResponse.statusCode;
                    let errorMessage = errorResponse.message;
                    // errorAlert(errorMessage);
                });
        } else {
            this.props.dispatch(updateProgressFlag(true));
            const body = {
                email: email,
                url: "https://s3-eu-west-1.amazonaws.com/adminseal/recovery/index.html"
            }

            forgetPassword(body)
                .then((response) => {
                    console.log({ response });
                    if (response.statusCode === 400) { this.setState({ errorforgotpassword: true, erromsg: "Email no valido", email: "" }) } else {
                        this.setState({
                            forgotPassword: false,
                            email: ""
                        })
                        Alert.alert(
                            '',
                            `Se ha envíado un correo electrónico a ${body.email} para que puedas recuperar tu contraseña`,
                            [
                                { text: 'OK', onPress: () => console.log('click OK'), style: 'destructive' },
                            ],
                            { cancelable: false }
                        )
                    }
                    this.props.dispatch(updateProgressFlag(false));
                })
                .catch((error) => {
                    this.props.dispatch(updateProgressFlag(false));
                    let errorResponse = error.response.data;
                    console.log('forgotpassword error', JSON.stringify(errorResponse));
                    let errorCode = errorResponse.statusCode;
                    let errorMessage = errorResponse.message;
                    errorAlert(errorMessage);
                })
        }

    }
    onchangeUsername = (identifier) => {
        if (identifier.trim() == '') {
            this.setState({
                identifier,
                username_error: true
            })
            return;
        }
        this.setState({
            identifier,
            username_error: false
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
    onchangePassword = (password) => {
        if (password.trim() == '') {
            this.setState({
                password,
                password_error: true
            })
            return;
        }
        this.setState({
            password,
            password_error: false
        })
    }
    render() {
        const { error, flag, identifier, password, email, username_error, username_success, password_error, password_success, email_success, email_error } = this.state;
        return (
            <SafeAreaView style={styles.safeArea}>
                <Background />
                <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" enabled>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Image style={{ marginBottom: 0, width: 300, }} resizeMode="contain" />
                        <TextView style={{ color: "darkred", padding: 10 }} value={error ? "Usuario o contraseña inválidos" : " "} />
                        <TextView style={{ color: "darkred", padding: 10 }} value={this.state.errorforgotpassword ? this.state.erromsg : " "} />
                        {this.state.forgotPassword === false ?
                            <View style={{ width: SCREEN_WIDTH - 60 }}>
                                <View style={{ marginBottom: 10, borderColor: error ? "darksalmon" : "gainsboro" }}>
                                    <Item error={username_error} success={username_success} rounded style={{ backgroundColor: 'white' }}>
                                        <Icon active type='FontAwesome' name='user-circle' style={{ color: 'grey' }} />
                                        <InputText value={identifier} placeholder='Usuario' onChangeText={(identifier) => this.onchangeUsername(identifier)}
                                        />
                                        {username_success && <Icon name='checkmark-circle' />}
                                        {username_error && <Icon name='close-circle' />}
                                    </Item>
                                </View>
                                <View last style={{ borderColor: error ? "darksalmon" : "gainsboro" }}>
                                    <Item error={password_error} success={password_success} rounded style={{ marginTop: 30, backgroundColor: 'white' }}>
                                        <Icon active type='FontAwesome' name='lock' style={{ color: 'grey' }} />
                                        <InputText
                                            placeholder='Contraseña'
                                            value={password} secureTextEntry={true} onChangeText={(password) => this.onchangePassword(password)}
                                        />
                                        {password_success && <Icon name='checkmark-circle' />}
                                        {password_error && <Icon name='close-circle' />}
                                    </Item>
                                </View>
                                <View style={{ flex: 1, marginTop: 50, alignItems: 'center', justifyContent: 'center' }}>
                                    <Button rounded block style={styles.button} onPress={() => this.handleSubmit()} >
                                        <TextView style={styles.buttonTxtColor} value={'Login'} />
                                    </Button>
                                </View>
                                <View style={{ marginTop: 45, alignItems: 'center', justifyContent: 'center' }}>
                                    <TouchableOpacity onPress={() => this.props.navigation.navigate('Register')}>
                                        <TextView style={styles.textStyle} value={'Regístrate'} />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ marginTop: 45, alignItems: 'center', justifyContent: 'center' }}>
                                    <TouchableOpacity onPress={this.forgotPassword}>
                                        <TextView style={styles.textStyle} value={'¿Has olvidado la contraseña?'} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            :
                            <View style={{ width: SCREEN_WIDTH - 60 }}>
                                <View style={{ marginBottom: 10, borderColor: error ? "darksalmon" : "gainsboro" }}>
                                    <Item error={email_error} success={email_success} rounded style={{ backgroundColor: 'white' }}>
                                        <Icon active type='MaterialIcons' name='email' style={{ color: 'grey' }} />
                                        <InputText value={email} placeholder='Email' onChangeText={(email) => this.onchangeEmail(email)}
                                        />
                                        {email_success && <Icon name='checkmark-circle' />}
                                        {email_error && <Icon name='close-circle' />}
                                    </Item>
                                </View>
                                <View style={{ marginTop: 50, alignItems: 'center', justifyContent: 'center' }}>
                                    <Button rounded block style={styles.button} onPress={this.handleSubmit} >
                                        <TextView style={styles.buttonTxtColor} value={'Recuperar contraseña'} />
                                    </Button>
                                </View>
                                <View style={{ marginTop: 45, alignItems: 'center', justifyContent: 'center' }}>
                                    <TouchableOpacity onPress={this.forgotPassword}>
                                        <TextView style={styles.textStyle} value={'Atras'} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        }
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }
}
export default connect()(Login)
