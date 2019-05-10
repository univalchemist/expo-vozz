import { StyleSheet } from 'react-native';
import { getBottomSpace } from 'react-native-iphone-x-helper';

import { FONT, PRIMARYCOLOR, DEVICE } from '../../../constants/style';
export const styles = StyleSheet.create({

    nextTapView: {
        backgroundColor: 'white',
        width: 40, height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: 'center'
    },
    iconStyle: {
        color: PRIMARYCOLOR.PURPLE, 
        fontSize: 18, 
        fontWeight: 'bold'
    },
    bottomView: {
        width: DEVICE.WIDTH * 0.8,
        marginBottom: 20 + getBottomSpace(), 
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
    },
    txtTitle: {
        color: 'white',
        fontSize: 40,
        textAlign: 'center'
    },
    txtDescription: {
        color: 'white',
        textAlign: 'center',
        fontSize: 18,
    },
    titleContainer: {
        backgroundColor: 'transparent',
        marginTop: 0,
    },
    desContainer: {
        backgroundColor: 'transparent',
        marginTop: 20,
    },
    infoContainer: {
        flex: 1,
        backgroundColor: 'transparent',
        marginTop: 60,
        justifyContent: 'center',
        alignItems: 'center'
    },
    cardContainer: {
        width: DEVICE.WIDTH - 50,
        backgroundColor: PRIMARYCOLOR.ORANGE,
    },
    avatarBody: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    thumbNail: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginTop: -60
    },
    inputStyle: {
        color: 'black',
        flex: 1,
    },
    labelStyle: {
        color: 'black',
    },
    textStyle: {
        fontSize: 16
    },
    textAreaStyle: {
        width: '100%',
        height: 80,
        padding: 5,
        fontSize: 18,
        fontFamily: FONT.MEDIUM
    }
})