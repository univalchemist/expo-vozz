import React, { Component } from 'react'
import { View, StyleSheet, Dimensions, FlatList } from 'react-native';
import CardCreator from '../../../components/cardCreator';
const { width, height } = Dimensions.get('window');
class Creators extends Component {
    constructor(props) {
        super(props);
    }
    onPress = (item) => {
        console.log('onPress item', item);
    }
    renderItem = ({ item, index }) => {
        if (item.empty) {
            return <View style={styles.itemInvisible}></View>
        }
        return (
            <CardCreator navigation={this.props.navigation} item={item} />
        )
    }
    render() {
        return (
            <View style={{ backgroundColor: 'tranparent', paddingTop: 20 }}>
                <FlatList
                    data={this.props.users}
                    numColumns={2}
                    contentContainerStyle={styles.container}
                    keyExtractor={(item) => item._id}
                    renderItem={this.renderItem}
                />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    itemInvisible: {
        backgroundColor: 'transparent',
        width: width / 2 - 30,
        marginBottom: 10,
        marginHorizontal: 10,
        borderTopLeftRadius: 7,
        borderTopRightRadius: 7
    }
})
export default Creators;
