import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { FONT } from '../constants/style'

export const TextView = (props) => (
    <Text
        style={[styles.textStyle, props.style]}>
        {props.value}
    </Text>
);


const styles = StyleSheet.create({
    textStyle: {
        fontFamily: FONT.MEDIUM
    },
})