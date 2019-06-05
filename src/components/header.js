import React from 'react';
import { StyleSheet } from 'react-native';
import { Header, Left, Body, Right, Button, Icon, Title, Thumbnail } from "native-base";
import { FONT } from '../constants/style';
import { TextView } from './textView';
import images from '../../assets';
const goback = (props) => {
    if(props.customGoBack) {
        props.GoBack();
    }
    if (props.player != null) {
        props.player.stopPlay(true)
    }
    if (props.playbackInstance != null) {
        props.playbackInstance.stopAsync()
    }
    props.navigation.goBack()
}
export const HeaderContainer = (props) => {
    return (
        <Header style={[styles.header, props.style]}>
            <Left style={styles.left}>
                {
                    props.goBack &&
                    <Button
                        transparent
                        onPress={() => goback(props)}>
                        <Icon name="chevron-left" type='Feather' style={{ color: 'white' }} />
                    </Button>
                }
                {
                    props.avatar &&
                    <Thumbnail small style={{ alignSelf: 'center' }} source={props.uri ? ({ uri: `data:image/png;base64,${props.uri}`}) : images.default_avatar} />
                }

            </Left>
            <Body style={styles.body}>
                <Title style={styles.textTitle}>
                    {props.title}
                </Title>
            </Body>
            <Right style={styles.right}>
                {props.right &&
                    <Button transparent onPress={props.onTapRight}>
                        <TextView style={styles.rightTxtStyle} value={props.rightText} />
                    </Button>}
                {props.rightIcon &&
                    <Button transparent onPress={props.onTapRight}>
                        <Icon name="more-horizontal" type='Feather' style={{ color: 'white' }} />
                    </Button>}

            </Right>
        </Header>
    )
}
const styles = StyleSheet.create({
    header: {
        elevation: 0,
        backgroundColor: 'transparent',
        shadowColor: 'transparent',
        borderBottomColor: 'transparent',
        borderBottomWidth: 0
    },
    body: {
        flex: 4,
        alignItems: 'center',
        backgroundColor: 'transparent'
    },
    textTitle: {
        marginTop: 5,
        alignSelf: 'center',
        color: 'white',
        fontFamily: FONT.MEDIUM

    },
    left: {
        flex: 2,
        flexDirection: 'row',
        backgroundColor: 'transparent',
    },
    right: {
        flex: 2,
    },
    rightTxtStyle: {
        color: 'white',
        fontSize: 18,
    }
})
