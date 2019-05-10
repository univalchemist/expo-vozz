import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Svg } from 'expo'
import { connect } from 'react-redux';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import { showRecorder, updateTabIndex } from '../actions/index'
const { Path } = Svg;

import { PRIMARYCOLOR, FONT, DEVICE } from '../constants/style';
//#ED3A17
class Nav extends Component {
    constructor(props) {
        super(props);
        this.state = {
            items: ['Home', 'Search', 'Messages', 'Profile'],
            selectedIndex: this.props.tabIndex,
        };
    }
    onTapItem = (index) => {
        const { items } = this.state;
        this.props.navigation.navigate(items[index]);
        // this.props.updateTabIndex(index)
        this.props.dispatch(updateTabIndex(index));
        this.setState({selectedIndex: index});
    }

    render() {
        const { selectedIndex } = this.state;
        return (
            <View style={[styles.shadow, styles.tabContainer]}>
                <TouchableOpacity onPress={() => this.onTapItem(0)} style={{ width: DEVICE.WIDTH / 5, height: 45, alignItems: 'center', justifyContent: 'center' }}>
                    <Image style={{ width: 22, height: 22 }}
                        source={require('../../assets/homeicon.png')}
                    />
                    {selectedIndex == 0 && <Text style={{ color: 'white', fontFamily: FONT.MEDIUM }}>Home</Text>}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.onTapItem(1)} style={{ width: DEVICE.WIDTH / 5, height: 45, alignItems: 'center', justifyContent: 'center' }}>
                    <Image style={{ width: 22, height: 22 }}
                        source={require('../../assets/searchicon.png')}
                    />
                    {selectedIndex == 1 && <Text style={{ color: 'white', fontFamily: FONT.MEDIUM }}>Search</Text>}
                </TouchableOpacity>
                <View style={{ width: 65, marginTop: -20, height: 65, padding: 5, backgroundColor: PRIMARYCOLOR.ORANGE, borderRadius: 35 }}>
                    <TouchableOpacity onPress={() => this.props.dispatch(showRecorder(true))} style={{ width: 55, height: 55, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', borderRadius: 30 }}>
                        {/* <TouchableOpacity onPress={() => this.props.handler()} style={{width:55, height:55, backgroundColor:'white', alignItems: 'center', justifyContent:'center', borderRadius:30}}> */}
                        <Svg width={30} height={27}>
                            <Path
                                d="M15 0c-.92 0-1.667.72-1.667 1.61v11.426c0 .89-.746 1.61-1.666 1.61-.92 0-1.667-.72-1.667-1.61V7.37c0-.889-.746-1.61-1.667-1.61-.92 0-1.666.721-1.666 1.61v4.264c0 .89-.746 1.61-1.667 1.61-.92 0-1.667-.72-1.667-1.61v-1.615c0-.889-.746-1.61-1.666-1.61C.747 8.41 0 9.13 0 10.02v12.035c0 .89.746 1.61 1.667 1.61.92 0 1.666-.72 1.666-1.61v-2.421c0-.89.746-1.61 1.667-1.61.92 0 1.667.72 1.667 1.61v4.622c0 .89.746 1.61 1.666 1.61.92 0 1.667-.72 1.667-1.61v-3.032c0-.89.746-1.61 1.667-1.61.92 0 1.666.72 1.666 1.61v.83c0 .89.747 1.611 1.667 1.611s1.665-.72 1.667-1.608v-4.163c0-.89.746-1.61 1.666-1.61.92 0 1.667.72 1.667 1.61v7.455c0 .89.746 1.61 1.667 1.61.92 0 1.666-.72 1.666-1.61v-6.027c0-.89.746-1.61 1.667-1.61.92 0 1.667.72 1.667 1.61v2.733c0 .89.746 1.61 1.666 1.61.92 0 1.666-.72 1.667-1.608V10.019c0-.889-.746-1.61-1.667-1.61-.92 0-1.666.721-1.666 1.61v1.615c0 .89-.747 1.61-1.667 1.61s-1.667-.72-1.667-1.61V6.747c0-.89-.746-1.61-1.666-1.61-.92 0-1.667.72-1.667 1.61v1.77c0 .89-.746 1.61-1.667 1.61-.92 0-1.666-.72-1.666-1.61V1.61C16.667.72 15.92 0 15 0z"
                                fill={PRIMARYCOLOR.ORANGE}
                            />
                        </Svg>
                    </TouchableOpacity>

                </View>
                <TouchableOpacity onPress={() => this.onTapItem(2)} style={{ width: DEVICE.WIDTH / 5, height: 45, alignItems: 'center', justifyContent: 'center' }}>
                    <Image style={{ width: 22, height: 22 }}
                        source={require('../../assets/chaticon.png')}
                    />
                    {selectedIndex == 2 && <Text style={{ color: 'white', fontFamily: FONT.MEDIUM }}>Chat</Text>}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.onTapItem(3)} style={{ width: DEVICE.WIDTH / 5, height: 45, alignItems: 'center', justifyContent: 'center' }}>
                    <Image style={{ width: 22, height: 22 }}
                        source={require('../../assets/profileicon.png')}
                    />
                    {selectedIndex == 3 && <Text style={{ color: 'white', fontFamily: FONT.MEDIUM }}>Profile</Text>}
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    shadow: {
        shadowColor: "black",
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: -3 },
        shadowRadius: 16,
        backgroundColor: 'white'
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: DEVICE.WIDTH,
        height: 48 + getBottomSpace(),
        paddingTop: 2,
        backgroundColor: PRIMARYCOLOR.ORANGE
    }
})
const mapStateToProps = (state) => ({
    tabIndex: state.tabIndex.index
});
export default connect(mapStateToProps)(Nav)