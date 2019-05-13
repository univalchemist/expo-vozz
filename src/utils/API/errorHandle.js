import { Alert } from 'react-native';
export const errorAlert = (errorMessage) => {
    return (
        Alert.alert(
            'Connection failed',
            errorMessage,
            [
                { text: 'OK', onPress: () => console.log('click OK'), style: 'destructive' },
            ],
            { cancelable: true }
        )
    )

}
