import { StyleSheet } from 'react-native';
import { FONT } from '../../constants/style';
export const styles = StyleSheet.create({
    contentStyle: {
        flex: 1,
        backgroundColor: 'white',
        borderTopLeftRadius: 20, 
        borderTopRightRadius: 20,
        padding: 20
    },
    fontStyle: {
        fontFamily: FONT.MEDIUM,
    },
    trash: {
		height: 25,
		width: 25,
    },
    backTextWhite: {
		color: '#FFF'
    },
    textStyle: {
        fontSize: 20,
        marginLeft: 25
    },
})