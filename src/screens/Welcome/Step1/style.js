import { StyleSheet } from 'react-native';
import { PRIMARYCOLOR, FONT, DEVICE } from '../../../constants/style';
import { getBottomSpace } from 'react-native-iphone-x-helper';
export const styles = StyleSheet.create({

    nextTapView: {
        backgroundColor: 'white',
        width: 40, 
        height: 40,
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
    },
    txtDescription: {
        color: 'white',
        textAlign: 'center',
        fontSize: 18,
    },
    titleContainer: {
        backgroundColor: 'transparent',
        marginTop: 50,
    },
    desContainer: {
        backgroundColor: 'transparent',
        marginTop: 30,
    },
    tagContainer: {
        flex: 1,
        backgroundColor: 'transparent',
        marginTop: 30,
        marginLeft: 15,
        marginRight: 15
    },
    containerStyle: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    labelText: {
        color: PRIMARYCOLOR.PURPLE,
        fontSize: 15,
        marginBottom: 15,
        fontFamily: FONT.MEDIUM
    },
    item: {
        borderWidth: 1,
        borderColor: 'white',
        backgroundColor: '#FFF',
        width: 100
    },
    label: {
        color: PRIMARYCOLOR.PURPLE,
        textAlign: 'center',
        fontFamily: FONT.MEDIUM
    },
    itemSelected: {
        backgroundColor: PRIMARYCOLOR.PURPLE,
        borderColor: PRIMARYCOLOR.PURPLE,
    },
    labelSelected: {
        color: '#FFF',
    },
    inputStyle: {
        flex: 1,
    },
    labelStyle: {
        fontFamily: FONT.BOOK
    },
    textStyle: {
        fontFamily: FONT.MEDIUM,
        fontSize: 16
    }
})