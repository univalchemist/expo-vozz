import React, { Component } from 'react';
import { Dimensions, StatusBar, Platform, KeyboardAvoidingView, ScrollView, RefreshControl } from 'react-native';
import { Container, View } from 'native-base';
import { connect } from 'react-redux';
import { withApollo } from 'react-apollo'

import { styles } from './style';
import { Background } from '../../components/background';
import { HeaderContainer } from '../../components/header';
import { PRIMARYCOLOR } from '../../constants/style';
import CardComment from '../../components/cardComment';
import { InputText } from '../../components/inputText';
import { updateProgressFlag } from '../../actions';
import { createComment } from '../../utils/API/comments';
import { GET_EXPERIENCE_QUERY } from '../../utils/Apollo/Queries/experience';
import { GET_ROUTE_QUERY } from '../../utils/Apollo/Queries/route';
import { getCount } from '../../utils/number';
import { errorAlert } from '../../utils/API/errorHandle';


let SCREEN_WIDTH = Dimensions.get('window').width;
class Comment extends Component {
    constructor(props) {
        super(props);

        this.state = {
            refreshing: false,
            flag: false,
            c_count: 0,
            title: '',
            route: this.props.navigation.getParam('route') ? this.props.navigation.getParam('route') : null,
            experience: this.props.navigation.getParam('experience') ? this.props.navigation.getParam('experience') : null,
            comments: [],
            comment: ''
        };
        this.getComments();
    }
    componentWillMount() {
    }
    componentWillUnmount() {
    }
    _onRefresh = () => {
        this.setState({ refreshing: true });
        setTimeout(this.setState({ refreshing: false }), 30000)
    }
    getComments = async () => {
        const { experience, route } = this.state;
        try {
            this.props.dispatch(updateProgressFlag(true));
            let res = [];
            if (route != null) {
                res = await this.props.client.query({ query: GET_ROUTE_QUERY, fetchPolicy: 'network-only', variables: { id: route } });
            } else {
                res = await this.props.client.query({ query: GET_EXPERIENCE_QUERY, fetchPolicy: 'network-only', variables: { id: experience } });
            }
            this.props.dispatch(updateProgressFlag(false));
            let story = (route != null) ? res.data.route : res.data.experience;
            const comments = story.comments;
            const c_count = getCount(comments);
            this.setState({
                comments,
                c_count,
                title: story.title
            });
        } catch (e) {
            this.props.dispatch(updateProgressFlag(false));
            console.log({ getExperienceInfo: e });
            errorAlert('Network error. Please make sure your network is connected.')
        }
    }
    onSubmitEditing = () => {
        const { comment, route, experience, c_count, comments } = this.state;
        if (comment == '') return;
        let temp_comment = {};
        if (route != null) {
            temp_comment = {
                route: route,
                user: this.props.auth.user._id,
                message: comment
            }
        } else {
            temp_comment = {
                experience: experience,
                user: this.props.auth.user._id,
                message: comment
            }
        }
        this.props.dispatch(updateProgressFlag(true));
        createComment(this.props.auth.jwt, temp_comment)
            .then((res) => {
                const c = res.data;
                this.props.dispatch(updateProgressFlag(false));
                this.setState({
                    comment: '',
                    c_count: c_count + 1,
                    comments: [...comments, c]
                });
            })
            .catch((error) => {
                this.props.dispatch(updateProgressFlag(false));
                console.log('createComment:', error);
            })
    }
    onChangeText = (comment) => {
        this.setState({ comment });
    }
    GoBack = () => {
        console.log('><><><><><><><><>');
        const { c_count } = this.state;
        this.props.navigation.state.params.onGoBack(c_count);
        this.props.navigation.goBack()
    }
    render() {
        const { title, c_count, comments, comment } = this.state;
        return (
            <Container style={{ paddingTop: StatusBar.currentHeight }}>
                <Background start={PRIMARYCOLOR.ORANGE} end={PRIMARYCOLOR.ORANGE} />
                <HeaderContainer title={title} customGoBack={true} GoBack={this.GoBack} goBack={true} navigation={this.props.navigation} right={true} rightText={c_count} />
                <View style={styles.contentStyle}>
                    <ScrollView
                        scrollEventThrottle={16}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this._onRefresh}
                            />
                        } style={{ flex: 1 }}
                        ref={ref => this.scrollView = ref}
                        onContentSizeChange={(contentWidth, contentHeight) => {
                            this.scrollView.scrollToEnd({ animated: true });
                        }}>
                        <View style={{ width: SCREEN_WIDTH, marginTop: 10, paddingHorizontal: 10 }}>
                            {/* {comments ?
                                comments.map((item, index) => (
                                    <CardComment key={index} item={item} onPress={this.onTapUser} />
                                ))
                                : null} */}
                            {comments.map((item, index) => (
                                <CardComment key={index} item={item} onPress={this.onTapUser} />
                            ))}

                        </View>
                    </ScrollView>
                    <View style={{ width: SCREEN_WIDTH, height: 55, backgroundColor: '#cccece', padding: 5 }}>
                        <InputText
                            placeholder={'The comment goes here...'}
                            style={{
                                backgroundColor: 'white',
                                borderColor: 'white',
                                borderWidth: 1,
                                borderRadius: 5
                            }}
                            onSubmitEditing={this.onSubmitEditing}
                            onChangeText={this.onChangeText}
                            value={comment}
                        />
                    </View>
                    <KeyboardAvoidingView behavior={'padding'} keyboardVerticalOffset={80} />
                </View>
            </Container>
        )
    }
}
const mapStateToProps = (state) => ({
    auth: state.auth
});
export default withApollo(connect(mapStateToProps)(Comment));