import { StyleSheet } from 'react-native';
import { PRIMARYCOLOR } from '../../../constants/style';

export const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'transparent'
    },
    buttonTxtColor: {
        color: 'white',
        flex: 1,
        justifyContent: 'flex-end',
        textAlign: 'center',
        fontSize: 18
    },
    button: {
        marginTop: '0%',
        width: '100%',
        backgroundColor: PRIMARYCOLOR.PURPLE,
    },
    forgotPasswordTxt: {
        color: PRIMARYCOLOR.ORANGE,
    },
    forgotPasswordBg: {
        alignSelf: 'flex-end',
        padding: 10
    },
    inputStyle: {
        flex: 1,
    },
    textStyle: {
        fontSize: 16,
        color: 'white'
    }
})