import React from 'react';
import { Text, View, StyleSheet, Image, TouchableHighlight } from 'react-native';
import { withNavigation } from 'react-navigation';
import { Icon } from 'native-base';
import images from '../../assets'
import { FONT } from '../constants/style';
import { LastMsgTime } from '../utils/Date';
const CardUserMessage = (props) => (

    <TouchableHighlight underlayColor="#ffffff00" style={[styles.shadow, styles.container]} onPress={() => props.onPress(props.item)}>
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Image
                style={{ width: 60, height: 60, borderRadius: 30 }}
                source={props.item.profile_base64 ? ({ uri: `data:image/png;base64,${props.item.profile_base64}` }) : (images.default_avatar)}
            />
            <View style={styles.textPart} >
                <Text style={{ fontSize: 20, fontFamily: FONT.BOOK }}>{props.item.username}</Text>
                <Text style={{ fontFamily: FONT.BOOK, color: 'grey' }}>{props.last}</Text>
            </View>
            <View style={{ padding: 0, justifyContent: 'center', alignItems: 'flex-end' }}>
                <Icon active type='Entypo' name="dot-single" style={{ color: props.unRead ? 'grey' : 'red' }} />
                <Text style={{ fontFamily: FONT.BOOK, color: 'grey', fontSize: 10 }}>{props.time?LastMsgTime(new Date(props.time)):''}</Text>
            </View>
        </View>
    </TouchableHighlight>
);

export default withNavigation(CardUserMessage);

const styles = StyleSheet.create({
    container: {
        height: 80,
        marginBottom: 10,
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 7
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