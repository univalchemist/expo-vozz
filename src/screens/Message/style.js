import { StyleSheet, Platform, StatusBar } from 'react-native';
import { getStatusBarHeight } from 'react-native-iphone-x-helper';
import { PRIMARYCOLOR, FONT, DEVICE } from '../../constants/style';
export const styles = StyleSheet.create({
    contentStyle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: Platform.OS == 'android' ? (StatusBar.currentHeight + 15) : (getStatusBarHeight() + 15),
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
    messageTitleStyle: {
        fontFamily: FONT.MEDIUM,
        fontSize: 30,
        marginVertical: 10,
        paddingHorizontal: 10,
        color: PRIMARYCOLOR.GREY
    },
    fontStyle: {
        fontFamily: FONT.MEDIUM,
    }
})