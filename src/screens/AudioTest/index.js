import React, { Component } from 'react'
import { View, Text, ScrollView, TouchableHighlight, TextInput, SafeAreaView, StatusBar, Alert } from 'react-native';
import { LinearGradient, Font, Permissions } from 'expo';
import Moment from 'moment';
class AudioTest extends Component {
    constructor(props){
        super(props)
        this.state = {
            holi: true,
            status: "armado",
            nuevaGrabacion: true,
            grabaciones: []
        }
        grabadora = new Expo.Audio.Recording() 
        reproductor = new Expo.Audio.Sound()
        contador = undefined
    }

    pedirPermisoAudio = async retry => {
        
        let audioPerm = await Permissions.getAsync( Permissions.AUDIO_RECORDING, Permissions.CAMERA_ROLL )
        audioPerm = audioPerm.status === "granted" ? audioPerm : await Permissions.askAsync( Permissions.AUDIO_RECORDING, Permissions.CAMERA_ROLL )
        if( retry ){ this.grabarAudio() }
        return audioPerm.status
    }
    grabarAudio = async () => {
        const audioPerm = await this.pedirPermisoAudio(false)
        if( audioPerm !== "granted"){
            Alert.alert(
                'Acceso denegado a la grabadora de audio',
                'Es necesario que otorgues acceso a la grabadora a Columbus App para usar esta funcionalidad',
                [
                {text: 'Reintentar', onPress: () => this.pedirPermisoAudio(true)},
                {text: 'Cancelar', onPress: () => {}, style: 'cancel'},
                ],
                { cancelable: false }
            )
        }

        grabadora = new Expo.Audio.Recording() 

        try {
            await grabadora.prepareToRecordAsync(Expo.Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
            const estado = await grabadora.startAsync();
            this.setState({ position: "00:00"})
            if( estado.isRecording === true ){
                this.setState({ status: "grabando" })
                contador = setInterval( async () => {
                    const status = await grabadora.getStatusAsync()
                    this.setState({ duracion: Moment(0).millisecond(status.durationMillis).format("mm:ss") })
                }, 250)
            }
        } catch (error) {
            console.log("Error en la grabación de audio")
            console.log( error )
        }
    }

    finalizarGrabacion = async () => {
        const estado = await grabadora.stopAndUnloadAsync()
        clearInterval(contador)
        this.setState({ status: "grabado", uriGrabacion: grabadora._uri })
    }

    playPauseAudio = async pause => {
        if(pause){
            const status = await reproductor.pauseAsync()
            this.setState({ status: "pausado", puntero: status.positionMillis })
        }
        else{
            if(this.state.nuevaGrabacion){
                reproductor = new Expo.Audio.Sound()
                await reproductor.loadAsync({ uri: grabadora._uri })
                this.setState({ nuevaGrabacion: false })
            }
            reproductor.setPositionAsync(this.state.puntero || 0)
            await reproductor.playAsync()
            this.setState({ status: "reproduciendo" })
            contador = setInterval( async () => {
                const status = await reproductor.getStatusAsync()
                this.setState({ duracion: Moment(0).millisecond(status.positionMillis).format("mm:ss") })
                if(!status.shouldPlay){
                    clearInterval(contador)
                }
                else if(status.positionMillis === status.durationMillis && this.state.status !== "descartado"){ 
                    this.setState({ status: "reproducido", puntero: 0, duracion: "00:00" }) 
                }
            }, 250)
        }
    }

    pararAudio = async () => {
        await reproductor.stopAsync()
        this.setState({ status: "grabado", puntero: 0, duracion: "00:00" })
        clearInterval(contador)
        
    }

    descartarGrabacion = async () => {
        if(!this.state.nuevaGrabacion){
            await reproductor.stopAsync()
        }
        clearInterval(contador)
        this.setState({ status: "descartado", duracion: "00:00", puntero: 0, nuevaGrabacion: true })
    }
    
    subirGrabacion = async () => {
        const body = new FormData();
        //body.append("refId", this.props.user._id);
        //body.append("ref", "user" );
        //body.append("field", "picture");
        //body.append("source", "users-permissions");
        const file = await Expo.FileSystem.getInfoAsync(this.state.uriGrabacion)
        const ext = file.uri.split(".").slice(-1)[0]
        body.append('files', { 
            uri: file.uri, 
            name: "audio." + ext, 
            type: 'multipart/form-data' 
        });
    
        const request = await fetch("http://34.253.233.130:1337/upload", {
            method: "POST",
            headers: {
                "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YjlkNjdjZGRlM2Y3ZDEzNDUxMTg1ODAiLCJpYXQiOjE1NDQ0NDAzMTgsImV4cCI6MTU0NzAzMjMxOH0.ane3VAF8dYNGVBSx04_fFZMtJRr2xRSOrhser1Eq7hU",
                "Content-Type": 'multipart/form-data'
            },
            body
        })

        if( request.status >= 400 ){
            alert("Ocurrió un error durante la subida del audio")
        }
        else{
            alert("El audio se ha subido correctamente")
            this.setState({ status: "descartado", duracion: "00:00", puntero: 0, nuevaGrabacion: true })
        }
    }

    async componentDidMount(){
        const grabaciones = await Expo.FileSystem.readDirectoryAsync( Expo.FileSystem.cacheDirectory + "Audio/" )
        this.setState({ grabaciones })
    }

    render(){
        const { status, grabaciones } = this.state;
        return (
            <SafeAreaView>
                <ScrollView>
                    {( status === "armado" || status === "descartado" || status === "grabando" ) &&
                        <View style={{ padding: 30, justifyContent: "center" }}>
                            <Text style={{ padding: 20, fontSize: 20, fontWeight: "bold", textAlign: "center" }}>Nueva grabación</Text>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                                <TouchableHighlight onPress={() => { if( status !== "grabando" ){ this.grabarAudio() }} }>
                                    <View style={{...boton, backgroundColor: status === "grabando" ? "red" : "gainsboro"}}>
                                        <Text>⚫</Text>
                                    </View> 
                                </TouchableHighlight>
                                <View>
                                    <Text style={{ fontSize: 30 }}>{ this.state.duracion || "00:00" }</Text>
                                </View>
                                <TouchableHighlight onPress={() => { if( status === "grabando" ){ this.finalizarGrabacion()}} }>
                                    <View style={{...boton, backgroundColor: status === "grabando" ? "lightblue" : "gainsboro"}}>
                                        <Text style={{ fontSize: 20 }}>■</Text>
                                    </View>
                                </TouchableHighlight>
                            </View>
                        </View>   
                    }

                    {( status === "reproduciendo" || status === "grabado" || status === "pausado" || status === "reproducido" ) &&
                        <View style={{ padding: 30, justifyContent: "center" }}>
                            <Text style={{ padding: 20, fontSize: 20, fontWeight: "bold", textAlign: "center" }}>Revisar grabación</Text>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                                <TouchableHighlight onPress={() => this.playPauseAudio(status === "reproduciendo" ? true : false) }>
                                    <View style={{...boton, backgroundColor: status === "reproduciendo" ? "yellow" : "lightgreen"}}>
                                        <Text style={{ fontSize: 20 }}>{ status === "reproduciendo" ? "❚❚" : "▶" }</Text>
                                    </View>
                                </TouchableHighlight>
                                <View>
                                    <Text style={{ fontSize: 30 }}>{ this.state.duracion || "00:00" }</Text>
                                </View>
                                <TouchableHighlight onPress={() => { if( status === "reproduciendo" ){ this.pararAudio()}} }>
                                    <View style={{...boton, backgroundColor: "lightblue" }}>
                                        <Text style={{ fontSize: 20 }}>■</Text>
                                    </View>
                                </TouchableHighlight>
                            </View>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingTop: 30, alignItems: "center", width: "100%" }}>
                                <TouchableHighlight onPress={() => this.descartarGrabacion()}>
                                    <View style={boton2}>
                                        <Text>Descartar</Text>
                                    </View>
                                </TouchableHighlight>
                                <TouchableHighlight onPress={() => this.subirGrabacion()}>
                                    <View style={boton2}>
                                        <Text>Subir</Text>
                                    </View>
                                </TouchableHighlight>
                            </View>
                        </View>   
                    }

                    <View style={{ flexDirection: "row", justifyContent: "center", flexWrap: "wrap" }}>
                        {grabaciones.map((a, i) => (
                            <TouchableHighlight key={i} style={{ padding: 5 }} onPress={() => this.reproducirTest(a)}>
                                <View style={boton}>
                                    <Text>{ a }</Text>
                                </View>
                            </TouchableHighlight>
                        ))}
                    </View>
                </ScrollView>
            </SafeAreaView>
        )
    }
}

const boton = {
    height: 50,
    width: 50,
    borderRadius: 5,
    display: "flex",
    padding: 10,
    alignItems: "center",
    justifyContent: "center"
}

const boton2 = {
    height: 50,
    borderRadius: 5,
    backgroundColor: "gainsboro",
    display: "flex",
    padding: 10,
    alignItems: "center",
    justifyContent: "center"
}

export default AudioTest