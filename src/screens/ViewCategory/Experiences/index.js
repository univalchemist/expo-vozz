import React from 'react'
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Content, Form, Item, Label, Input, Button, Thumbnail } from 'native-base';
import { TextView } from '../../../components/textView';
import CardHome from '../../../components/cardhome';
import CardExperience from '../../../components/cardExperience';
export const Experiences = (props) => {
    let deviceWidth = Dimensions.get('window').width;
    let deviceheight = Dimensions.get('window').height;
    let formWidth = Dimensions.get('window').width * 0.8
    let isDisable = false;
    return (
        <View style={{ backgroundColor: 'tranparent' }}>
            <ScrollView style={{ paddingHorizontal: 10 }}>
                {props.experiences.map((item, index) => (
                    <CardExperience key={index} navigation={props.navigation} item={item} />
                ))}
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    buttonColor: {
        color: 'white'
    },
    button: {
        marginTop: '10%',
        width: '75%'
    },
    button2: {
        marginTop: '2%',
        width: '75%'
    },
    disableButton: {
        backgroundColor: 'grey',
    },
    activeButton: {
        backgroundColor: '#2e6aec',
    },
    forgotPasswordTxt: {
        color: '#0691ce',
    },
    forgotPasswordBg: {
        alignSelf: 'flex-end',
        padding: 10
    }
})
