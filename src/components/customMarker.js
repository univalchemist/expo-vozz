import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo';
import { FONT } from '../constants/style'
import { TextInput } from 'react-native-gesture-handler';

export const CustomMarker = (props) => (
    <LinearGradient
        colors={['#00FFFF', '#17C8FF', '#329BFF', '#4C64FF', '#6536FF', '#8000FF']}
        start={{ x: 0.0, y: 1.0 }} end={{ x: 1.0, y: 1.0 }}
        style={{ height: 30, width: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 15 }}
    >
    <TextInput style={{ color: 'white', textAlign: 'center', fontFamily: FONT.BOLD, fontSize: 18 }} value={props.text}/>
    </LinearGradient>
);


const styles = StyleSheet.create({
    inputStyle: {
        fontFamily: FONT.MEDIUM
    },
})