import { ImageManipulator } from 'expo';
export async function compressImage(uri, width, height) {
    console.log('compress');
    const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: width, height: height } }],
        { compress: 1, format: 'jpeg', base64: true }
    );
    console.log('compress after');
    return manipResult;
}