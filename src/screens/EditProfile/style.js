import { StyleSheet } from 'react-native';
import { FONT } from '../../constants/style';
export const styles = StyleSheet.create({
  contentStyle: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    justifyContent: 'center',
  },
  thumbNail: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  inputStyle: {
    flex: 1,
    fontSize: 16
  },
  textAreaStyle: {
    width: '100%',
    height: 80,
    padding: 5,
    fontSize: 18,
    fontFamily: FONT.MEDIUM,
    borderRadius: 5
  }
})