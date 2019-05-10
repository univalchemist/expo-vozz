import React, { Component } from 'react';
import { View,Text, Image, Dimensions, SafeAreaView, TouchableOpacity } from 'react-native';

let SCREEN_WIDTH = Dimensions.get('window').width
let SCREEN_HEIGHT = Dimensions.get('window').height

export default class Pre extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
      <SafeAreaView style={{flex:1, justifyContent:'center', alignItems:'center'}}>
        
          <Image
            style={{width: 200, height: 200}}
            source={{uri: 'https://facebook.github.io/react-native/docs/assets/favicon.png'}}
          />
          
          <View style={{position: 'absolute', bottom:0, width: SCREEN_WIDTH, height:40, backgroundColor:'#ED3A17' }}>
          </View>
          <View style={{position: 'absolute', borderTopRightRadius:25, borderTopLeftRadius:25, bottom:0, left:35, width: SCREEN_WIDTH-70, height:120, paddingHorizontal:20, paddingTop:20, backgroundColor:'#FF4710' }}>
            <TouchableOpacity onPress={() => this.props.navigation.navigate('Home')} style={{flexDirection:'row',padding:5,borderRadius:25, width:SCREEN_WIDTH-110, height:50,  backgroundColor:'white'}}>
              <View style={{position: 'absolute',top:5, left:5, alignItems:'center', justifyContent:'center', width:40,height:40, borderRadius:20, backgroundColor:'#FF4710'}}><Text style={{color:'white', fontSize:25, lineHeight:27}}>+</Text></View>
              <View style={{flex:1, alignItems:'center', justifyContent: 'center'}}><Text style={{textAlign:'center', fontSize:20, color:'#FF4710'}}>COMENZAR</Text></View>
            </TouchableOpacity>
          </View>
        
      </SafeAreaView>
    );
  }
}
