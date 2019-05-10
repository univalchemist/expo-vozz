import React from 'react'
import { View, ScrollView } from 'react-native';
import CardExperience from '../../../components/cardExperience';
export const Experiences = (props) => {
    return (
        <View style={{ backgroundColor: 'tranparent', paddingTop: 20  }}>
            <ScrollView style={{ paddingHorizontal: 10 }}>
                {props.experiences.map((item, index) => (
                    <CardExperience key={index} navigation={props.navigation} item={item} />
                ))}
            </ScrollView>
        </View>
    )
}
