import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from "expo";
import { FONT, PRIMARYCOLOR, DEVICE } from '../constants/style'

export const Background = (props) => (
    <LinearGradient
        colors={[props.start ? props.start : PRIMARYCOLOR.PURPLE1, props.end ? props.end : PRIMARYCOLOR.PURPLE2]}
        style={[{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: props.height ? props.height : DEVICE.HEIGHT + 50,
        }, props.style]}
    />
);


const styles = StyleSheet.create({
    inputStyle: {
        fontFamily: FONT.MEDIUM
    },
})