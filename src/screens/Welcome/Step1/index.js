import React, { Component } from 'react';
import { StatusBar, View, TouchableOpacity, AsyncStorage } from 'react-native';
import { Container, Content, Icon } from 'native-base';
import { TagSelect } from 'react-native-tag-select';
import { connect } from 'react-redux';

import { TextView } from '../../../components/textView';
import { Background } from '../../../components/background';

import { HeaderContainer } from '../../../components/header';
import { styles } from './style';
import { updateProfile } from '../../../utils/API/userAction';
import { getCategories } from '../../../utils/API/homePageAction';
import { updateUserdata, updateProgressFlag } from '../../../actions';
import { errorAlert } from '../../../utils/API/errorHandle';

class Step1 extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: this.props.auth.user,
            categories: []
        }

    }

    componentWillMount() {
        this.getcategories();
    }
    getcategories = () => {
        this.props.dispatch(updateProgressFlag(true));
        getCategories()
            .then((response) => {
                console.log('getCategories response', JSON.stringify(response));
                let data = response.data;
                this.props.dispatch(updateProgressFlag(false));
                let temp = [];
                data.map((item, index) => {
                    let temp_item = {
                        id: index + 1,
                        label: item.title,
                        _id: item.id
                    }
                    temp.push(temp_item);
                });
                this.setState({
                    categories: temp
                });
            })
            .catch((error) => {
                this.props.dispatch(updateProgressFlag(false));
                let errorResponse = error.response.data;
                console.log('getCategories error', JSON.stringify(errorResponse));
                let errorCode = errorResponse.statusCode;
                let errorMessage = errorResponse.message;
                errorAlert(errorMessage);
            })
    }
    onTapSkip = () => {
        console.log('onTapSkiponTapSkiponTapSkip');
        this.props.navigation.navigate('Step2');
    }
    onTapNext = () => {
        const { tags } = this.state;
        console.log('onTapNext', this.tag.itemsSelected);
        // let temp_categories = [];
        // this.tag.itemsSelected.map((item) => {
        //     temp_categories.push(item._id);
        // })
        let temp_categories = this.tag.itemsSelected.map(h => h._id);
        this.props.dispatch(updateProgressFlag(true));
        updateProfile(this.props.auth.user._id, this.props.auth.jwt, { categories: temp_categories })
            .then((response) => {
                this.props.dispatch(updateProgressFlag(false));
                console.log('updateTags response', JSON.stringify(response));
                this.props.dispatch(updateUserdata(response.data));
                AsyncStorage.setItem('user', JSON.stringify(response.data));
                this.props.navigation.navigate('Step2');
            })
            .catch((error) => {
                this.props.dispatch(updateProgressFlag(false));
                let errorResponse = error.response.data;
                console.log('updateTags error', JSON.stringify(errorResponse));
                let errorCode = errorResponse.statusCode;
                let errorMessage = errorResponse.message;
                errorAlert(errorMessage);
            })

    }
    render() {
        const { categories, user, flag } = this.state;
        return (
            <Container style={{ paddingTop: StatusBar.currentHeight }}>
                <Background />
                <HeaderContainer title="" navigation={this.props.navigation} goBack={true} right={true} rightText={'skip'} onTapRight={this.onTapSkip} />
                <Content contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <View style={styles.titleContainer}>
                        <TextView style={styles.txtTitle} value={`Welcome ${user.username}`} />
                    </View>
                    <View style={styles.desContainer}>
                        <TextView style={styles.txtDescription} value={'Select some your interestings so we can show you some interesting stories.'} />
                    </View>
                    <View style={styles.tagContainer}>
                        <TagSelect
                            data={categories}
                            ref={(tag) => {
                                this.tag = tag;
                            }}
                            containerStyle={styles.containerStyle}
                            itemStyle={styles.item}
                            itemLabelStyle={styles.label}
                            itemStyleSelected={styles.itemSelected}
                            itemLabelStyleSelected={styles.labelSelected}
                        />
                    </View>
                    <View style={styles.bottomView}>
                        <TouchableOpacity iconRight light style={styles.nextTapView} onPress={() => this.onTapNext()}>
                            <Icon name='arrow-right' type='FontAwesome' style={styles.iconStyle} />
                        </TouchableOpacity>
                    </View>
                </Content>
            </Container>
        );
    }
    //}
}
const mapStateToProps = (state) => ({
    auth: state.auth
});

export default connect(mapStateToProps)(Step1);