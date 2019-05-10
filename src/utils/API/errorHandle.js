import { Alert } from 'react-native';
export function errorAlert(errorMessage) {
    Alert.alert(
        'Connection failed',
        errorMessage,
        [
            { text: 'OK', onPress: () => console.log('click OK'), style: 'destructive' },
        ],
        { cancelable: true }
    )
}
