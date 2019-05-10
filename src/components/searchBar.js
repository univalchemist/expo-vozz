import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { SearchBar } from 'react-native-elements';
import { FONT } from '../constants/style';

export const SearchBarCustom = (props) => (
    <SearchBar
        value={props.value}
        round={props.round}
        containerStyle={[styles.searchContainerStyle, props.containerStyle]}
        inputContainerStyle={[styles.inputContainerStyle, props.inputContainerStyle]}
        inputStyle={[styles.styleInput, props.inputStyle]}
        // searchIcon={{ size: 50, color: 'white' }}
        // clearIcon={{ size: 50, color: 'white' }}
        onChangeText={props.onChangeText}
        onClear={props._onTextClear}
        placeholder={props.placeholder} />
);


const styles = StyleSheet.create({
    searchContainerStyle: {
        marginTop: (Platform.OS === 'android') ? 0 : 30,
        backgroundColor: 'transparent',
        elevation: 0,
        borderBottomColor: 'transparent',
        borderTopColor: 'transparent',
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent'

    },
    inputContainerStyle: {
        backgroundColor: 'white',
        borderRadius: 5,
    },
    styleInput: {
        backgroundColor: 'white',
        color: 'black',
        fontFamily: FONT.MEDIUM,

    },
})