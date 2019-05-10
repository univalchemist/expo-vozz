import React from 'react'
import { View, ScrollView } from 'react-native';
import CardHome from '../../../components/cardhome';
export const Routes = (props) => {
    return (
        <View style={{ backgroundColor: 'tranparent', paddingTop: 20  }}>
            <ScrollView style={{ paddingHorizontal: 10 }}>
                {props.routes.map((item, index) => (
                    <CardHome key={index} navigation={props.navigation} item={item} />
                ))}
            </ScrollView>
        </View>
    )
}
