import { StyleSheet } from 'react-native';
import { FONT, DEVICE } from '../../constants/style';
export const styles = StyleSheet.create({
    contentStyle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    cardContainer: {
        width: DEVICE.WIDTH - 50,
        height: 180,
        marginTop: 0
    },
    slide: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'stretch'
    },
    safeArea: {
        flex: 1,
        backgroundColor: 'white'
    },
    inputStyle: {
        fontFamily: FONT.MEDIUM,
    },
    labelView: {
        flex: 1,
        justifyContent: 'flex-end',
        marginBottom: 5,
        marginLeft: 10,
    },
    labelStyle: {
        fontFamily: FONT.MEDIUM,
        color: 'white'
    },
    fontStyle: {
        fontFamily: FONT.MEDIUM,
    }
})