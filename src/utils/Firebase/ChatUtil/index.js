import firebase from 'firebase';
import { fetchChatList } from '../../../actions';

class Backend {
    uid = '';
    messagesRef = null;
    receiver_messagesRef = null;
    ref = null

    senderRef = null;
    receiverRef = null;
    chatListRef = null;
    // initialize Firebase Backend
    constructor() {
        firebase.initializeApp({
            apiKey: "AIzaSyC8qYXYnQFsuYaHMBSTRW-xd3bathua-Bg",
            authDomain: "clever-cortex-235707.firebaseapp.com",
            databaseURL: "https://clever-cortex-235707.firebaseio.com",
            projectId: "clever-cortex-235707",
            storageBucket: "",
            messagingSenderId: "582031120672",
            appId: "1:582031120672:web:16787f8e6535a371"
        });
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.setUid(user.uid);
            } else {
                firebase.auth().signInAnonymously().catch((error) => {
                    alert(error.message);
                });
            }
        });
    }
    setUid(value) {
        this.uid = value;
    }
    getUid() {
        return this.uid;
    }
    setRef(sender, user) {
        this.messagesRef = firebase.database().ref('messages').child(sender._id).child(user._id);
        this.receiver_messagesRef = firebase.database().ref('messages').child(user._id).child(sender._id);
    }
    setChatListRef(id) {
        this.chatListRef = firebase.database().ref('messages').child(id);
    }
    // retrieve the messages from the Backend
    loadMessages(callback) {
        this.messagesRef.off();
        const onReceive = (data) => {
            const message = data.val();
            callback({
                _id: data.key,
                text: message.text,
                createdAt: new Date(message.createdAt),
                sent: message.sent,
                received: message.received,
                user: {
                    _id: message.user._id,
                    name: message.user.name,
                },
            });
        };
        // this.messagesRef.on('child_added', onReceive);
        this.messagesRef.limitToLast(50).on('child_added', onReceive);
    }
    // send the message to the Backend
    sendMessage(message) {
        for (let i = 0; i < message.length; i++) {
            this.messagesRef.push({
                text: message[i].text,
                user: message[i].user,
                sent: true,
                received: false,
                createdAt: firebase.database.ServerValue.TIMESTAMP,
            });
            this.receiver_messagesRef.push({
                text: message[i].text,
                user: message[i].user,
                sent: true,
                received: false,
                createdAt: firebase.database.ServerValue.TIMESTAMP,
            });
        }
    }
    updateMsgStatus(sender_id, user_id, msgId) {
        const ref = firebase.database().ref('messages').child(sender_id).child(user_id).child(msgId);
        ref.update({
            received: true
        });
    }
    // close the connection to the Backend
    closeChat() {
        if (this.messagesRef) {
            this.messagesRef.off();
        }
    }

    fetchChatUsers(dispatch) {
        this.chatListRef.off();
        const onReceive = (snapshot) => {
            const keys = [];
            let totalUnRead = 0;
            snapshot.forEach(function (childSnap) {
                const messages = [];
                let unRead = 0;
                childSnap.forEach(function (messageSnap) {
                    const message = messageSnap.val();
                    if (!message.received && message.user._id != snapshot.key) {
                        unRead = unRead + 1;
                    }
                    messages.push({ key: messageSnap.key, message: message });
                })
                totalUnRead = totalUnRead + unRead;
                keys.push({ key: childSnap.key, messages: messages, unRead: unRead });
            });
            // dispatch(fetchChatList({ chatList: snapshot.val(), chatListKeys: keys }));
            dispatch(fetchChatList({ chatListKeys: keys, totalUnRead: totalUnRead }));
        };
        this.chatListRef.limitToLast(50).on('value', onReceive);
    }
    closeUSersConnection() {
        if (this.chatListRef) {
            this.chatListRef.off();
        }
    }
    addChatList(sender, user) {
        const sender_ref = firebase.database().ref('users').child(sender._id).child(user._id);
        const receiver_ref = firebase.database().ref('users').child(user._id).child(sender._id);
        sender_ref.set({
            last: null,
        });
        receiver_ref.set({
            last: null,
        });
    }
}
export default new Backend();
