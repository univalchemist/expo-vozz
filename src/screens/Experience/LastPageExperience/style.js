import { StyleSheet, StatusBar } from 'react-native';
import { PRIMARYCOLOR, FONT, DEVICE } from '../../../constants/style';
export const styles = StyleSheet.create({
    contentStyle: {
        flex: 1,
        backgroundColor: 'white',
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
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20
    },
    labelStyle: {
        fontSize: 22,
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
    playerContainerBase: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 20
    },
    playerContainerMiddleRow: {
        maxHeight: 40,
        alignSelf: 'stretch',
        paddingRight: 20,
        backgroundColor: PRIMARYCOLOR.ORANGE
    },
    sliderContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minWidth: DEVICE.WIDTH - 40,
        maxWidth: DEVICE.WIDTH - 40,
    },
    track: {
        height: 10,
        borderRadius: 5,
    },
    trackSlider: {
        width: DEVICE.WIDTH - 60,
    },
    backTextWhite: {
        color: '#FFF'
    },
    markerFixed: {
        left: '50%',
        marginLeft: -24,
        marginTop: -48,
        position: 'absolute',
        top: '50%',
        zIndex: 100
    },
    marker: {
        height: 48,
        width: 48
    },
    infoCard: {
        width: '31%', height: 45,
        backgroundColor: 'white',
        marginHorizontal: 2, borderRadius: 5,
        paddingLeft: 5, flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    menuIcon: {
        position: 'absolute',
        zIndex: 100,
        top: 15 + StatusBar.currentHeight,
        right: 20,
        backgroundColor: 'transparent'
    },
    backIcon: {
        position: 'absolute', 
        zIndex: 2, 
        top: StatusBar.currentHeight + 15, 
        left: 20, 
        backgroundColor: 'transparent'
    }
})