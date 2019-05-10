import { StyleSheet, StatusBar, Platform } from 'react-native';
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import { PRIMARYCOLOR, DEVICE } from '../../constants/style';
export const styles = StyleSheet.create({
    parentContainer: {
        flex: 1,
        backgroundColor: 'transparent',
        width: '100%'
    },
    contentStyle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    panel: {
        flex: 1,
        zIndex: 3,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
    },
    swiperStyle: {
        height: DEVICE.HEIGHT
    },
    infoViewStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: "center",
        height: 60

    },
    followingStyle: {
        width: DEVICE.WIDTH / 4 - 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRightColor: 'white',
        borderRightWidth: 1
    },
    followerStyle: {
        width: DEVICE.WIDTH / 4 - 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRightColor: 'white',
        borderRightWidth: 1

    },
    playerStyle: {
        width: DEVICE.WIDTH / 4 - 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    followButton: {
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        borderRadius: 5,
        marginRight: 50
    },
    recordDescription: {
        marginTop: 15,
        width: DEVICE.WIDTH - 40,
        paddingLeft: 10,
        height: 80,
    },
    bottomTabStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: "center",
        height: 50
    },
    RoutesStyle: {
        width: DEVICE.WIDTH / 2 - 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRightColor: 'grey',
        borderRightWidth: 1

    },
    experienceStyle: {
        width: DEVICE.WIDTH / 2 - 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    thumbNail: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'flex-end'
    },
    addAvatar: {
        backgroundColor: 'white',
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 20,
        height: 20,
        borderRadius: 10,
        alignSelf: 'flex-end',
        alignItems: 'center',
        justifyContent: 'center'
    },
    slidingContainer: {
        flex: 1,
        backgroundColor: 'white',
        width: '100%',
        paddingBottom: 50,
    },
    button: {
        marginTop: '0%',
        width: '50%',
        alignSelf: 'center',
        backgroundColor: PRIMARYCOLOR.ORANGE,
    },
    buttonTxtColor: {
        color: 'white',
        flex: 1,
        justifyContent: 'flex-end',
        textAlign: 'center',
        fontSize: 18,
        paddingLeft: 10
    },
    iconStyle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold'
    },
    menuIcon: {
        position: 'absolute',
        zIndex: 100,
        top: Platform.OS == 'android' ? (StatusBar.currentHeight + 15) : (getStatusBarHeight() + 15),
        right: 20,
        backgroundColor: 'transparent'
    }
})