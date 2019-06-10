import React, { Component } from 'react';
import { View, StatusBar, Platform, KeyboardAvoidingView, YellowBox } from 'react-native';
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
import Backend from '../../../utils/Firebase/ChatUtil';
import { withApollo } from 'react-apollo';
import _ from 'lodash';
import { sendNotification } from '../../../utils/API/notification';
import { sendNotificationToUser, updateChatScreenState } from '../../../actions';

class Chat extends Component {
    constructor(props) {
        super(props);
        // YellowBox.ignoreWarnings(['Setting a timer']);
        // const _console = { ...console };
        // console.warn = message => {
        //     if (message.indexOf('Setting a timer') <= -1) {
        //         _console.warn(message);
        //     }
        // };
        this.state = {
            user: this.props.navigation.getParam('user'),
            receiver: { _id: this.props.navigation.getParam('user')._id, name: this.props.navigation.getParam('user').username, avatar: this.props.navigation.getParam('user').url },
            sender: { _id: this.props.auth.user._id, name: this.props.auth.user.username },
            flag: false,

            step: 0,
            messages: [],
            loadEarlier: true,
            typingText: null,
            isLoadingEarlier: false,
        };
        this.setRef();
    }
    setRef = () => {
        Backend.setRef(this.props.auth.user, this.props.navigation.getParam('user'));
    }
    _isMounted = false;
    async componentWillMount() {
        this._isMounted = true;
        this.props.dispatch(updateChatScreenState(true));
    }
    componentDidMount() {
        Backend.loadMessages((message) => {
            this.setState((previousState) => {
                return {
                    messages: GiftedChat.append(previousState.messages, message),
                };
            });
            console.log({message})
            if(message.user._id != this.props.auth.user._id) {
                Backend.updateMsgStatus(this.props.auth.user._id, message.user._id, message._id)
            }

        });
    }
    componentWillUnmount() {
        const { user, sender } = this.state;
        this._isMounted = false;
        Backend.closeChat();
        this.props.dispatch(updateChatScreenState(false));
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
    onSendMessage = (message) => {
        const { user } = this.state;
        Backend.sendMessage(message);
        this.props.dispatch(sendNotificationToUser(user.pushToken, this.props.auth.user.username, message[0].text));
    }
    render() {
        const { flag, user, receiver, sender } = this.state;
        return (
            <Container style={{ paddingTop: StatusBar.currentHeight }}>
                <Background start={PRIMARYCOLOR.ORANGE} end={PRIMARYCOLOR.ORANGE} height={300} />
                <Spinner
                    visible={flag}
                    textContent={""}
                />
                <HeaderContainer title={user.username} goBack={true} navigation={this.props.navigation} avatar={true} uri={user.profile_base64} right={false} />
                <Content contentContainerStyle={styles.contentStyle}>
                    <View style={{ flex: 1, paddingBottom: getBottomSpace() }} accessible accessibilityLabel="main" testID="main">
                        <GiftedChat
                            messages={this.state.messages}
                            onSend={(message) => this.onSendMessage(message)}
                            keyboardShouldPersistTaps="never"
                            // loadEarlier={this.state.loadEarlier}
                            // onLoadEarlier={this.onLoadEarlier}
                            // isLoadingEarlier={this.state.isLoadingEarlier}
                            parsePatterns={this.parsePatterns}
                            user={sender}
                            // renderAccessory={this.renderAccessory}
                            // renderActions={this.renderCustomActions}
                            renderBubble={this.renderBubble}
                            // renderSystemMessage={this.renderSystemMessage}
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
const mapStateToProps = (state) => ({
    auth: state.auth
});
export default withApollo(connect(mapStateToProps)(Chat))