import firebase from 'firebase';

class Backend {
    uid = '';
    messagesRef = null;
    receiver_messagesRef = null;
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
    // retrieve the messages from the Backend
    loadMessages(callback) {
        this.messagesRef.off();
        const onReceive = (data) => {
            const message = data.val();
            callback({
                _id: data.key,
                text: message.text,
                createdAt: new Date(message.createdAt),
                user: {
                    _id: message.user._id,
                    name: message.user.name,
                },
            });
        };
        this.messagesRef.limitToLast(20).on('child_added', onReceive);
    }
    // send the message to the Backend
    sendMessage(message) {
        for (let i = 0; i < message.length; i++) {
            this.messagesRef.push({
                text: message[i].text,
                user: message[i].user,
                createdAt: firebase.database.ServerValue.TIMESTAMP,
            });
            this.receiver_messagesRef.push({
                text: message[i].text,
                user: message[i].user,
                createdAt: firebase.database.ServerValue.TIMESTAMP,
            });
        }
    }
    // close the connection to the Backend
    closeChat() {
        if (this.messagesRef) {
            this.messagesRef.off();
        }
    }
}
export default new Backend();