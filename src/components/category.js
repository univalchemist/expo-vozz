import React from 'react';
import { View, Text, TouchableHighlight, Image } from 'react-native';
import { withNavigation } from 'react-navigation';
import images from '../../assets'
const Category = (props) => (
    <TouchableHighlight underlayColor="#ffffff00" style={{ width: 90, height: 130, marginLeft: 10, marginRight: 10 }} onPress={() => props.navigation.navigate('ViewCategory', { tags: props.tags, title: props.item.title }) }>
        <View style={{ flex: 1 }}>
            <Image
                style={{ width: 90, height: 90, borderRadius: 7 }}
                source={props.item.picture ? ({ uri: props.item.picture.url }) : (images.sample1)}
            />
            <Text style={[props.fontStyle, { textAlign: 'center', marginTop: 10 }]}>{props.item.title}</Text>
        </View>
    </TouchableHighlight>
);

export default withNavigation(Category);