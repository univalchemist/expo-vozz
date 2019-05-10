import React, { Component } from 'react';
import { Alert, StatusBar, KeyboardAvoidingView, View, Dimensions, AsyncStorage } from 'react-native';
import { Container, Content, Item, Icon, Button } from 'native-base';
import { connect } from 'react-redux';
import Spinner from 'react-native-loading-spinner-overlay';

import { HeaderContainer } from '../../../components/header';
import { InputText } from '../../../components/inputText'
import { TextView } from '../../../components/textView'
import { Background } from '../../../components/background'

import constantes from '../../../utils/constantes';
import { styles } from './style';
import { RegisterUser } from '../../../utils/API/userAction';
import { saveAuthdata, updateProgressFlag } from '../../../actions';
let SCREEN_WIDTH = Dimensions.get('window').width

class Register extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: "",
            email: "",
            password: "",
            password2: "",

            username_success: false,
            username_error: false,
            email_success: false,
            email_error: false,
            password_success: false,
            password_error: false,
            confirm_password_success: false,
            confirm_password_error: false,

            loading: true
        }
    }

    async componentWillMount() {
    }
    validateEmail = email => {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    handleRegistro = () => {
        const { username, email, password, password2 } = this.state;
        if (password === password2 && password.length >= 6 && username.length > 0 && email.length > 0 && this.validateEmail(email)) {
            this.props.dispatch(updateProgressFlag(true));
            RegisterUser({ username, email, password })
                .then((response) => {
                    this.props.dispatch(updateProgressFlag(false));
                    console.log('RegisterUser', JSON.stringify(response));
                    let data = response.data;
                    if (data.jwt) {
                        // Alert.alert("¡Enhorabuena!", "El usuario se ha creado correctamente", [{ text: "Aceptar", type: "cancel" }]);
                        this.props.dispatch(saveAuthdata(data));
                        AsyncStorage.setItem('jwt', data.jwt);
                        AsyncStorage.setItem('user', JSON.stringify(data.user));

                        this.props.navigation.navigate("Step1");
                    }
                })
                .catch((error) => {
                    this.props.dispatch(updateProgressFlag(false));
                    let errorResponse = error.response.data;
                    console.log('RegisterUser error', JSON.stringify(errorResponse));
                    let errorCode = errorResponse.statusCode;
                    let errorMessage = errorResponse.message;
                    if (errorMessage === "This username is already taken" || (errorMessage && errorMessage.includes("`username` is required"))) {
                        this.setState({ error: "username" })
                        Alert.alert("Error en el registro", "El nombre de usuario ya está en uso", [{ text: "Aceptar", type: "cancel" }]);
                    }
                    else if (errorMessage === "Email is already taken." || (errorMessage && errorMessage.includes("`email` is required"))) {
                        this.setState({ error: "email" })
                        Alert.alert("Error en el registro", "Ya existe un usuario con esa dirección de correo electrónico", [{ text: "Aceptar", type: "cancel" }]);
                    }
                })
        }
        else {
            if (username.length === 0) { Alert.alert("Error en el registro", "Es necesario introducir un nombre de usuario", [{ text: "Aceptar", type: "cancel" }]); this.setState({ error: "username" }) }
            else if (email.length === 0 || !this.validateEmail(email)) { Alert.alert("Error en el registro", "Es necesario introducir una dirección válida de correo electrónico", [{ text: "Aceptar", type: "cancel" }]); this.setState({ error: "email" }) }
            else if (password !== password2) { Alert.alert("Error en el registro", "Las contraseñas no coinciden", [{ text: "Aceptar", type: "cancel" }]); this.setState({ error: "password" }) }
            else if (password.length < 6) { Alert.alert("Error en el registro", "La contraseña ha de ser de al menos 6 caracteres", [{ text: "Aceptar", type: "cancel" }]); this.setState({ error: "password" }) }
        }
    }
    //validation input field
    onchangeUsername = (username) => {
        if (username.trim() == '') {
            this.setState({
                username,
                username_error: true
            })
            return;
        }
        this.setState({
            username,
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
    onchangeConfirmPassword = (password2) => {
        if (password2.trim() == '') {
            this.setState({
                password2,
                confirm_password_error: true
            })
            return;
        }
        this.setState({
            password2,
            confirm_password_error: false
        })
    }
    render() {
        const { error, username, email, password, password2, username_error, username_success, email_error, email_success, password_error, password_success, confirm_password_error, confirm_password_success } = this.state;
        return (
            <Container style={{ paddingTop: StatusBar.currentHeight }}>
                <Background />
                <HeaderContainer title="Registro" goBack={true} navigation={this.props.navigation} right={false} />
                <Content contentContainerStyle={styles.contentStyle}>
                    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" enabled>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <View style={{ width: SCREEN_WIDTH - 60 }}>
                                <View style={{ marginBottom: 10, borderColor: error ? "darksalmon" : "gainsboro" }}>
                                    <Item error={username_error} success={username_success} rounded style={{ backgroundColor: 'white', marginTop: 10 }}>
                                        <Icon active type='FontAwesome' name='user-circle' style={{ color: 'grey' }} />
                                        <InputText style={styles.inputStyle} value={username} placeholder='Nombre de usuario' onChangeText={(username) => this.onchangeUsername(username)}
                                        />
                                        {username_success && <Icon name='checkmark-circle' />}
                                        {username_error && <Icon name='close-circle' />}
                                    </Item>
                                </View>
                                <View style={{ marginBottom: 10, borderColor: error ? "darksalmon" : "gainsboro" }}>
                                    <Item error={email_error} success={email_success} rounded style={{ backgroundColor: 'white', marginTop: 10 }}>
                                        <Icon active type='MaterialIcons' name='email' style={{ color: 'grey' }} />
                                        <InputText style={styles.inputStyle} value={email} placeholder='Email' onChangeText={(email) => this.onchangeEmail(email)}
                                            keyboardType="email-address" />
                                        {email_success && <Icon name='checkmark-circle' />}
                                        {email_error && <Icon name='close-circle' />}
                                    </Item>
                                </View>
                                <View last style={{ marginBottom: 10, borderColor: error ? "darksalmon" : "gainsboro" }}>
                                    <Item error={password_error} success={password_success} rounded style={{ backgroundColor: 'white', marginTop: 10 }}>
                                        <Icon active type='FontAwesome' name='lock' style={{ color: 'grey' }} />
                                        <InputText
                                            style={styles.inputStyle}
                                            placeholder='Contraseña'
                                            value={password} secureTextEntry={true} onChangeText={(password) => this.onchangePassword(password)}
                                        />
                                        {password_success && <Icon name='checkmark-circle' />}
                                        {password_error && <Icon name='close-circle' />}
                                    </Item>
                                </View>
                                <View last style={{ marginBottom: 10, borderColor: error ? "darksalmon" : "gainsboro" }}>
                                    <Item error={confirm_password_error} success={confirm_password_success} rounded style={{ backgroundColor: 'white', marginTop: 10 }}>
                                        <Icon active type='FontAwesome' name='lock' style={{ color: 'grey' }} />
                                        <InputText
                                            style={styles.inputStyle}
                                            placeholder='Confirmar contraseña'
                                            value={password2} secureTextEntry={true} onChangeText={(password2) => this.onchangeConfirmPassword(password2)}
                                        />
                                        {confirm_password_success && <Icon name='checkmark-circle' />}
                                        {confirm_password_error && <Icon name='close-circle' />}
                                    </Item>
                                </View>
                                <View style={{ flex: 1, marginTop: 50, alignItems: 'center', justifyContent: 'center' }}>
                                    <Button rounded block style={styles.button} onPress={() => this.handleRegistro()} >
                                        <TextView style={styles.buttonTxtColor} value={'Enviar'} />
                                    </Button>
                                </View>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </Content>
            </Container>
        );
    }
    //}
}
export default connect()(Register)