import React from 'react';
import { Text, View, StyleSheet, Image, TouchableHighlight } from 'react-native';
import { withNavigation } from 'react-navigation';
import images from '../../assets'
import { FONT, DEVICE } from '../constants/style';
const CardCreator = (props) => (

    <TouchableHighlight underlayColor="#ffffff00" style={[styles.shadow, styles.container]} onPress={() => props.navigation.navigate('UserProfile', { user_id: props.item._id })}>
        <View style={{ flex: 1, flexDirection: 'column' }}>
            <Image
                style={{ width: DEVICE.WIDTH / 2 - 30, height: DEVICE.WIDTH / 2 - 30, borderTopLeftRadius: 7, borderTopRightRadius: 7 }}
                source={props.item.profile_base64 ? ({ uri: `data:image/png;base64,${props.item.profile_base64}` }) : (images.default_avatar)}
            />
            <View style={{ flex: 1, padding: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: FONT.BOOK }}>{props.item.username}</Text>
            </View>

        </View>
    </TouchableHighlight>
);

export default withNavigation(CardCreator);

const styles = StyleSheet.create({
    container: {
        width: DEVICE.WIDTH / 2 - 30, 
        marginBottom: 10,
        marginHorizontal: 10,
        backgroundColor: 'white', 
        borderTopLeftRadius: 7,
        borderTopRightRadius: 7
    },
    shadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,

        elevation: 5,
    }
})