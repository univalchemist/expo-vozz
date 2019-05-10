import React from 'react';
import { Text, View, StyleSheet, Image, TouchableHighlight } from 'react-native';
import { withNavigation } from 'react-navigation';
import { Button, Icon } from 'native-base';
import images from '../../assets'
import { PRIMARYCOLOR, FONT } from '../constants/style';
import { getCount, getPlays } from '../utils/number';
const CardExperience = (props) => (

    <TouchableHighlight underlayColor="#ffffff00" style={[styles.shadow, styles.container]} onPress={() => props.me ? props.navigation.navigate('Experience', { me: props.me, experience_id: props.item._id }) : props.navigation.navigate('ViewExperience', { experience_id: props.item._id })}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
            <Image
                style={{ width: 100, height: 100, borderRadius: 7 }}
                source={props.item.image != null || props.item.image != undefined? ({ uri: props.item.image.url }) : (images.sample1)}
            />
            <View style={{ flex: 1, padding: 10 }}>
                <Text style={{ fontSize: 20, fontFamily: FONT.BOOK }}>{props.item.title}</Text>
                <View style={{ flexDirection: 'row' }}>
                    <Button transparent style={{ marginRight: 15 }}>
                        <Icon active type='Feather' name="heart" style={{ marginLeft: 0, marginRight: 2, color: 'red' }} />
                        <Text style={{ marginLeft: 0, fontFamily: FONT.BOOK }}>{getCount(props.item.likes)}</Text>
                    </Button>
                    <Button transparent style={{ marginRight: 15 }}>
                        <Icon active type='Feather' name="message-circle" style={{ marginLeft: 0, marginRight: 2, color: 'red' }} />
                        <Text style={{ marginLeft: 0, fontFamily: FONT.BOOK }}>{getCount(props.item.comments)}</Text>
                    </Button>
                    <Button transparent style={{ marginRight: 15 }}>
                        <Icon active type='Feather' name="bar-chart-2" style={{ marginLeft: 0, marginRight: 2, color: 'red' }} />
                        <Text style={{ marginLeft: 0, fontFamily: FONT.BOOK }}>{getPlays(props.item.plays)}</Text>
                    </Button>
                </View>
            </View>

        </View>
    </TouchableHighlight>
);

export default withNavigation(CardExperience);

const styles = StyleSheet.create({
    container: {
        borderRightColor: PRIMARYCOLOR.PURPLE,
        borderRightWidth: 8,
        height: 100,
        marginBottom: 10,
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
    }
})