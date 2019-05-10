import React from 'react';
import { Text, View, Image, StyleSheet } from 'react-native';
import { DEVICE } from '../constants/style';


const BigCat = ( props ) => (
    <View style={[styles.shadow, {width: (DEVICE.WIDTH/2)-25,  margin: 5, backgroundColor:'white', elevation:3, borderRadius:6, }]}>
            <Image
                style={{width: (DEVICE.WIDTH/2)-25, height: (DEVICE.WIDTH/2)-25, borderRadius: 7 }}
                source={{ uri: props.catimg }}
            />
            <Text style={{ textAlign: 'center', marginTop: 10, marginBottom:10 }}>{props.catname}</Text>
    </View>
);

export default BigCat;


const styles = StyleSheet.create({
    shadow:{
        shadowColor: "black", 
        shadowOpacity:0.2, 
        shadowOffset:{width:0, height:2}, 
        shadowRadius:16, 
        backgroundColor:'white'
    }
})