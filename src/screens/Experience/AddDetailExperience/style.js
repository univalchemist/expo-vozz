import { StyleSheet } from 'react-native';
import { PRIMARYCOLOR, FONT, DEVICE } from '../../../constants/style';
export const styles = StyleSheet.create({
    contentStyle: {
        flex: 1,
        
        backgroundColor: 'white',
        borderTopLeftRadius: 20, 
        borderTopRightRadius: 20
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
    },
    shadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
        elevation: 3,
    },
    textAreaStyle: {
        width: '70%',
        height: 120,
        marginTop: 0,
        padding: 5,
        fontSize: 18,
        fontFamily: FONT.MEDIUM,

        backgroundColor: 'white', 
        borderRadius: 7,
        
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
        elevation: 3,
    },
    rowFront: {
		backgroundColor: 'white',
	},
    rowBack: {
		alignItems: 'center',
		backgroundColor: 'white',
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingLeft: 15,
    },
    backRightBtn: {
		alignItems: 'center',
		bottom: 0,
		justifyContent: 'center',
		position: 'absolute',
		top: 0,
		width: 75
	},
	backRightBtnRight: {
		backgroundColor: 'red',
		right: 0
    },
    trash: {
		height: 25,
		width: 25,
    },
    backTextWhite: {
		color: '#FFF'
	},
})