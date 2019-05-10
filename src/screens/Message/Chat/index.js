import React, { Component } from 'react';
import { View, StatusBar, Platform, KeyboardAvoidingView } from 'react-native';
import { Container, Content } from 'native-base';
import Spinner from 'react-native-loading-spinner-overlay';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import { connect } from 'react-redux';
import { AppLoading, Linking } from 'expo';
import { Bubble, GiftedChat, SystemMessage } from 'react-native-gifted-chat';

import AccessoryBar from './AccessoryBar';
import CustomActions from './CustomActions';
import CustomView from './CustomView';
import messagesData from './data/messages';
import earlierMessages from './data/earlierMessages';

import { styles } from './style';
import { Background } from '../../../components/background';
import { HeaderContainer } from '../../../components/header';
import { PRIMARYCOLOR } from '../../../constants/style';


const filterBotMessages = (message) => !message.system && message.user && message.user._id && message.user._id === 2;
const findStep = (step) => (_, index) => index === step - 1;


class Chat extends Component {
    constructor(props) {
        super(props);

        this.state = {
            user: this.props.navigation.getParam('user'),
            receiver: { _id: 2, name: this.props.navigation.getParam('user').name, avatar: this.props.navigation.getParam('user').url },
            sender: { _id: 1, name: 'Gui' },
            flag: false,

            step: 0,
            messages: [],
            loadEarlier: true,
            typingText: null,
            isLoadingEarlier: false,
        };
    }
    _isMounted = false;
    async componentWillMount() {
        this._isMounted = true;
        // init with only system messages
        this.setState({ messages: messagesData.filter((message) => message.system), appIsReady: true });
    }
    componentWillUnmount() {
        this._isMounted = false;
    }
    onLoadEarlier = () => {
        this.setState((previousState) => {
            return {
                isLoadingEarlier: true,
            };
        });

        setTimeout(() => {
            if (this._isMounted === true) {
                this.setState((previousState) => {
                    return {
                        messages: GiftedChat.prepend(previousState.messages, earlierMessages),
                        loadEarlier: false,
                        isLoadingEarlier: false,
                    };
                });
            }
        }, 1000); // simulating network
    };
    _onRefresh = () => {
        this.setState({ refreshing: true });
        setTimeout(this.setState({ refreshing: false }), 30000)
    }

    onSend = (messages = []) => {
        const step = this.state.step + 1;
        this.setState((previousState) => {
            const sentMessages = [{ ...messages[0], sent: true, received: true }];
            return {
                messages: GiftedChat.append(previousState.messages, sentMessages),
                step,
            };
        });
        // for demo purpose
        setTimeout(() => this.botSend(step), Math.round(Math.random() * 1000));
    };

    botSend = (step = 0) => {
        const newMessage = messagesData
            .reverse()
            .filter(filterBotMessages)
            .find(findStep(step));
        if (newMessage) {
            this.setState((previousState) => ({
                messages: GiftedChat.append(previousState.messages, newMessage),
            }));
        }
    };

    parsePatterns = (linkStyle) => {
        return [
            {
                pattern: /#(\w+)/,
                style: { ...linkStyle, color: 'darkorange' },
                onPress: () => Linking.openURL('http://gifted.chat'),
            },
        ];
    };

    renderCustomView(props) {
        return <CustomView {...props} />;
    }

    onReceive = (text) => {
        const { receiver } = this.state;
        this.setState((previousState) => {
            return {
                messages: GiftedChat.append(previousState.messages, {
                    _id: Math.round(Math.random() * 1000000),
                    text,
                    createdAt: new Date(),
                    user: receiver,
                }),
            };
        });
    };

    onSendFromUser = (messages = []) => {
        const { sender } = this.state;
        const createdAt = new Date();
        const messagesToUpload = messages.map((message) => ({
            ...message,
            user: sender,
            createdAt,
            _id: Math.round(Math.random() * 1000000),
        }));
        this.onSend(messagesToUpload);
    };

    renderAccessory = () => <AccessoryBar onSend={this.onSendFromUser} />;
    renderCustomActions = (props) => {
        return <CustomActions {...props} onSend={this.onSendFromUser} />;
    };

    renderBubble = (props) => {
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    left: {
                        backgroundColor: '#f0f0f0',
                    },
                }}
            />
        );
    };

    renderSystemMessage = (props) => {
        return (
            <SystemMessage
                {...props}
                containerStyle={{
                    marginBottom: 15,
                }}
                textStyle={{
                    fontSize: 14,
                }}
            />
        );
    };
    renderFooter = (props) => {
        if (this.state.typingText) {
            return (
                <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>{this.state.typingText}</Text>
                </View>
            );
        }
        return null;
    };
    render() {
        const { flag, user, receiver, sender } = this.state;
        if (!this.state.appIsReady) {
            return <AppLoading />;
        }
        return (
            <Container style={{ paddingTop: StatusBar.currentHeight}}>
                <Background start={PRIMARYCOLOR.ORANGE} end={PRIMARYCOLOR.ORANGE} height={300} />
                <Spinner
                    visible={flag}
                    textContent={""}
                />
                <HeaderContainer title={user.name} goBack={true} navigation={this.props.navigation} avatar={true} uri={user.url} right={false} />
                <Content contentContainerStyle={styles.contentStyle}>
                    <View style={{ flex: 1, paddingBottom: getBottomSpace() }} accessible accessibilityLabel="main" testID="main">
                        <GiftedChat
                            messages={this.state.messages}
                            onSend={this.onSend}
                            keyboardShouldPersistTaps="never"
                            loadEarlier={this.state.loadEarlier}
                            onLoadEarlier={this.onLoadEarlier}
                            isLoadingEarlier={this.state.isLoadingEarlier}
                            parsePatterns={this.parsePatterns}
                            user={sender}
                            // renderAccessory={this.renderAccessory}
                            renderActions={this.renderCustomActions}
                            renderBubble={this.renderBubble}
                            renderSystemMessage={this.renderSystemMessage}
                            renderCustomView={this.renderCustomView}
                            renderFooter={this.renderFooter}
                        />
                        {Platform.OS == 'android' && <KeyboardAvoidingView behavior={'padding'} keyboardVerticalOffset={80} />}
                    </View>
                </Content>
            </Container>
        )
    }
}

export default connect()(Chat)