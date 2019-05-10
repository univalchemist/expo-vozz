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
    inputStyle: {
        fontFamily: FONT.MEDIUM,
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
    textStyle: {
        fontSize: 20,
        marginLeft: 25
    },
})