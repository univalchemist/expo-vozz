import React, { Component } from 'react';
import { View, TouchableHighlight, Text, SafeAreaView } from 'react-native';
import constantes  from '../../utils/constantes';
import SortableList from 'react-native-sortable-list';


export default class Experiencia extends Component {
    constructor(props) {
        super(props);
        this.state = {
            audios: this.props.navigation.getParam('finalaudios'),
            experiencia: this.props.navigation.getParam('experiencia'),
            finalaudios: []
        }
        
        
    }

   componentDidMount(){
       console.log(this.state)
   }

   _renderRow = ({data}) => {
    return <Text>{data.hastags}</Text>
  }

  onChangeOrder = async (nextOrder) => {
    let finalaudios = [];
    await nextOrder&&nextOrder.map((item)=>{
        finalaudios.push(this.state.audios[item])
    })
    this.setState({
        finalaudios
    })
  }
   
    render(){
        return(
            <View>
                <Text>{this.state.experiencia.nombre}</Text>
                <Text>{this.state.experiencia.descripcion}</Text>
                <SortableList
                    data={this.state.audios}
                    renderRow={this._renderRow}
                    onChangeOrder={this.onChangeOrder} />
            </View>
        )
    }
}