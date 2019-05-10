import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewPropTypes, Platform, ActionSheetIOS } from 'react-native';
import ActionSheet from 'react-native-actionsheet';
import { getLocationAsync, pickImageAsync, takePictureAsync } from '../../../constants/funcs';
import { TextView } from '../../../components/textView';

const options = [
  <TextView style={{ color: 'blue', fontSize: 18 }} value={'Choose From Library'} />,
  <TextView style={{ color: 'blue', fontSize: 18 }} value={'Take Picture'} />,
  <TextView style={{ color: 'blue', fontSize: 18 }} value={'Send Location'} />,
  <TextView style={{ color: 'blue', fontSize: 18 }} value={'Cancel'} />];
const options_ios = [
  'Choose From Library',
  'Take Picture',
  'Send Location',
  'Cancel'];
const cancelButtonIndex = options.length - 1;
const cancelButtonIndex_ios = options_ios.length - 1;

export default class CustomActions extends React.Component {

  onActionsPress = () => {
    if (Platform.OS === 'android') {
      this.ActionSheet.show()
      return;
    }
    this.showActionSheet();
  };
  showActionSheet = () => {
    ActionSheetIOS.showActionSheetWithOptions({
      options: options_ios,
      cancelButtonIndex: cancelButtonIndex_ios,
    },
      (buttonIndex) => {
        this.selectOption(buttonIndex);
      });
  };
  selectOption = (index) => {
    const { onSend } = this.props;
    switch (index) {
      case 0:
        pickImageAsync(onSend);
        return;
      case 1:
        takePictureAsync(onSend);
        return;
      case 2:
        getLocationAsync(onSend);
        return;
      default:
    }
  }

  renderIcon = () => {
    if (this.props.renderIcon) {
      return this.props.renderIcon();
    }
    return (
      <View style={[styles.wrapper, this.props.wrapperStyle]}>
        <Text style={[styles.iconText, this.props.iconTextStyle]}>+</Text>
      </View>
    );
  };

  render() {
    return (
      <TouchableOpacity style={[styles.container, this.props.containerStyle]} onPress={this.onActionsPress}>
        {this.renderIcon()}
        <ActionSheet
          ref={o => this.ActionSheet = o}
          title={<TextView style={{ color: '#000', fontSize: 18 }} value={'Options'} />}
          options={options}
          cancelButtonIndex={cancelButtonIndex}
          destructiveButtonIndex={4}
          onPress={(index) => this.selectOption(index)}
        />
      </TouchableOpacity>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 26,
    marginLeft: 10,
    marginBottom: 10,
  },
  wrapper: {
    borderRadius: 13,
    borderColor: '#b2b2b2',
    borderWidth: 2,
    flex: 1,
  },
  iconText: {
    color: '#b2b2b2',
    fontWeight: 'bold',
    fontSize: 16,
    backgroundColor: 'transparent',
    textAlign: 'center',
  },
});

CustomActions.contextTypes = {
  actionSheet: PropTypes.func,
};

CustomActions.defaultProps = {
  onSend: () => { },
  options: {},
  renderIcon: null,
  containerStyle: {},
  wrapperStyle: {},
  iconTextStyle: {},
};

CustomActions.propTypes = {
  onSend: PropTypes.func,
  options: PropTypes.object,
  renderIcon: PropTypes.func,
  containerStyle: ViewPropTypes.style,
  wrapperStyle: ViewPropTypes.style,
  iconTextStyle: Text.propTypes.style,
};
