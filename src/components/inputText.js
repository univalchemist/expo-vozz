import React from 'react';
import { StyleSheet } from 'react-native';
import { Input } from 'native-base';
import { FONT } from '../constants/style'

export const InputText = (props) => (
    <Input
        style={[props.style, styles.inputStyle]}
        value={props.value}
        autoCapitalize={'none'}
        disabled={props.disabled}
        keyboardType={props.keyboardType}
        secureTextEntry={props.secureTextEntry}
        placeholder={props.placeholder}
        onChangeText={props.onChangeText}
        onSubmitEditing={props.onSubmitEditing}
        clearButtonMode="while-editing" />
);


const styles = StyleSheet.create({
    inputStyle: {
        fontFamily: FONT.MEDIUM
    },
})