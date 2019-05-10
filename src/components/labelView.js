import React from 'react';
import { StyleSheet } from 'react-native';
import { Label } from 'native-base';
import { FONT } from '../constants/style'

export const LabelView = (props) => (
    <Label
        style={[styles.labelStyle, props.style]}>
        {props.value}
    </Label>
);


const styles = StyleSheet.create({
    labelStyle: {
        fontFamily: FONT.MEDIUM
    },
})