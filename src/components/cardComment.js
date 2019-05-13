import React from 'react';
import { Text, View, StyleSheet, Image, TouchableHighlight } from 'react-native';
import { withNavigation } from 'react-navigation';
import images from '../../assets'
import { FONT } from '../constants/style';
const CardComment = (props) => (

    <View style={[styles.container]}>
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Image
                style={{ width: 50, height: 50, borderRadius: 25 }}
                source={props.item.profile_base64 ? ({ uri: `data:image/png;base64,${props.item.profile_base64}` }) : (images.default_avatar)}
            />
            <View style={styles.textPart} >
                <Text style={{ fontFamily: FONT.BOOK, color: 'red' }}>{props.item.user.username}</Text>
                <Text style={{ fontFamily: FONT.BOOK }}>{props.item.message}</Text>
            </View>
        </View>
    </View>
);

export default withNavigation(CardComment);

const styles = StyleSheet.create({
    container: {
        height: 100,
        padding: 10,
        backgroundColor: 'white',
        borderStyle: 'solid',
        borderRadius: 7,
        borderBottomColor: 'grey',
        borderBottomWidth: 1.5,
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
    },
    textPart: {
        flex: 5, 
        padding: 10, 
        marginLeft: 10, 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'stretch'
    }
})