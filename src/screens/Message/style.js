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
    messageTitleStyle: {
        fontFamily: FONT.MEDIUM,
        fontSize: 30,
        marginVertical: 10,
        paddingHorizontal: 10,
        color: PRIMARYCOLOR.GREY
    },
    progressBar: {
        position: 'absolute',
        top: DEVICE.HEIGHT/2 - 20,
        left: DEVICE.WIDTH/2 - 20
    }
})