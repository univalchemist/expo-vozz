import { StyleSheet } from 'react-native';
import { PRIMARYCOLOR, FONT } from '../../../constants/style';
export const styles = StyleSheet.create({
    contentStyle: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center'
    },
    buttonTxtColor: {
        color: 'white',
        flex: 1,
        justifyContent: 'flex-end',
        textAlign: 'center',
        fontFamily: FONT.MEDIUM,
        fontSize: 18
    },
    button: {
        marginTop: '0%',
        width: '100%',
        backgroundColor: PRIMARYCOLOR.PURPLE,
    },
    inputStyle: {
        flex: 1, 
    }
})