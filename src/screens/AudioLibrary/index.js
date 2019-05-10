import React, { Component } from 'react';
import { StatusBar, TouchableOpacity, Animated, View, Image, Alert } from 'react-native';
import { Container, Content, ListItem, Left, Body, Right, Icon, CheckBox } from 'native-base';
import Spinner from 'react-native-loading-spinner-overlay';
import { connect } from 'react-redux';
import { withApollo } from 'react-apollo';
import { SwipeListView } from 'react-native-swipe-list-view';

import { styles } from './style';
import { TextView } from '../../components/textView';
import { Background } from '../../components/background';
import { HeaderContainer } from '../../components/header';
import { PRIMARYCOLOR } from '../../constants/style';
import images from '../../../assets';
import MusicPlayer from '../../utils/Audio';
import { updateProgressFlag } from '../../actions';
import { USER_MOMENT_QUERY } from '../../utils/Apollo/Queries/moment';
import { calDiffDays } from '../../utils/Date';
import { deleteMoment } from '../../utils/API/moment';

const RenderRecords = (props) => {
    return (
        props.records.map((record, index) => {
            return (
                <ListItem key={index} icon button={true}>
                    <Left>
                        <CheckBox checked={record.value} color={PRIMARYCOLOR.ORANGE} onPress={() => props.actionOnRow(record, props.name, index)} />
                    </Left>
                    <Body>
                        <TextView value={record.title} />
                    </Body>
                    <Right>
                        <TouchableOpacity onPress={() => props.onTapPlayRow(record.play, props.name, index)}>
                            <Icon name={record.play ? 'play' : 'pause'} type='FontAwesome' style={{ color: record.play ? PRIMARYCOLOR.ORANGE : 'grey' }} />
                        </TouchableOpacity>
                    </Right>
                </ListItem>
            )
        })
    )


}

class AudioLibrary extends Component {
    MusicPlayer = null;
    constructor(props) {
        super(props);
        this.state = {
            records: [],
            diffs: [],
            playing: false,
        };
        this.rowSwipeAnimatedValues = {};

    }
    async componentWillMount() {
        this.getMoments();
        this.MusicPlayer = new MusicPlayer();
    }
    componentWillUnmount() {
    }
    getMoments = () => {
        console.log('<<<<<<<<<', this.props.auth.user._id);
        this.props.dispatch(updateProgressFlag(true));
        this.props.client.query({ query: USER_MOMENT_QUERY, fetchPolicy: 'network-only', variables: { id: this.props.auth.user._id } }).then(
            (res) => {
                this.props.dispatch(updateProgressFlag(false));
                let data = res.data.moments;
                data.sort((d1, d2) => new Date(d2.createdAt).getTime() - new Date(d1.createdAt).getTime());
                let temp = [];//{ key: `${i}`, title: item.title, item: item.item, play: false }
                data.map((item, i) => {
                    let diff = calDiffDays(item.createdAt);
                    let t = {
                        key: `${i}`,
                        diff: diff,
                        value: false,
                        play: false,
                        title: item.title,
                        item: item,
                        id: item._id
                    };
                    temp.push(t);
                });
                let result = temp.reduce(function (r, a) {
                    r[a.diff] = r[a.diff] || [];
                    r[a.diff].push(a);
                    return r;
                }, Object.create(null));

                Array(temp.length).fill('').forEach((_, i) => {
                    this.rowSwipeAnimatedValues[`${i}`] = new Animated.Value(0);
                });

                this.setState({ records: temp, diffs: Object.keys(result) });

            },
            (err) => {
                this.props.dispatch(updateProgressFlag(false));
                console.log({ err })
            }
        );
    }

    onTapItem = (item, index) => {
        console.log('onTapItem', item, index);
    }
    actionOnRow = (item, index) => {
        let temp = [...this.state.records];
        temp[index]['value'] = !temp[index]['value'];
        this.setState({ records: temp })
    }
    onTapPlayRow = (play, index) => {
        let temp = [...this.state.records];
        for (t of temp) {
            t.play = false;
        }

        temp[index]['play'] = !play;
        this.setState({ records: temp });
        if (play) {
            this.stopPlay();
            return;
        }

        let uri = temp[index]['item']['audio']['url'];
        this.startPlay(uri);

    }
    startPlay = (uri) => {
        const source = { uri: uri };
        this.MusicPlayer.startPlay(source, this.state.playing).then(() => {
            this.setState({
                playing: !this.state.playing
            })
        });
    };
    stopPlay = () => {
        this.MusicPlayer.stopPlay(this.state.playing).then(() => {
            this.setState({
                playing: !this.state.playing
            })
        });
    };
    deleteRow(rowMap, rowKey) {
        this.closeRow(rowMap, rowKey);
        const newData = [...this.state.records];
        const prevIndex = this.state.records.findIndex(item => item.key === rowKey);
        deleteMoment(this.state.records[prevIndex].id, this.props.auth.jwt)
            .then((response) => {
                console.log({ deleteMoment: response });
                newData.splice(prevIndex, 1);
                this.setState({ records: newData });
            })
            .catch((error) => {
                console.log({ deleteMomentError: error });
                let errorResponse = error.response.data;
                let errorCode = errorResponse.statusCode;
                let errorMessage = errorResponse.message;
                if (errorCode == 500) {
                    newData.splice(prevIndex, 1);
                    this.setState({ records: newData });
                    return;
                }
                Alert.alert(
                    'Connection failed',
                    errorMessage,
                    [
                        { text: 'OK', onPress: () => console.log('click OK'), style: 'destructive' },
                    ],
                    { cancelable: true }
                )
            })

    }
    closeRow(rowMap, rowKey) {
        console.log(rowMap, rowKey)
        if (rowMap[rowKey]) {
            rowMap[rowKey].closeRow();
        }
    }
    onRowDidOpen = (rowKey, rowMap) => {
        console.log('This row opened', rowKey);
    }

    onSwipeValueChange = (swipeData) => {
        const { key, value } = swipeData;
        this.rowSwipeAnimatedValues[key].setValue(Math.abs(value));
    }
    render() {
        const { flag, records } = this.state;

        return (
            <Container style={{ paddingTop: StatusBar.currentHeight }}>
                <Background start={PRIMARYCOLOR.ORANGE} end={PRIMARYCOLOR.ORANGE} />
                <Spinner
                    visible={flag}
                    textContent={""}
                />
                <HeaderContainer player={this.MusicPlayer} title={'Audio Library'} goBack={true} navigation={this.props.navigation} />
                <Content contentContainerStyle={styles.contentStyle}>
                    {
                        records.length == 0 ? null
                            :
                            <SwipeListView
                                useFlatList
                                data={records}
                                renderItem={(data, rowMap) => (
                                    <ListItem icon button={true} style={styles.rowFront}>
                                        <Left>
                                            <Icon name={'menu'} type='Feather' style={{ color: 'grey' }} />
                                        </Left>
                                        <Body>
                                            <TextView value={data.item.title} />
                                        </Body>
                                        <Right>
                                            <TouchableOpacity onPress={() => this.onTapPlayRow(data.item.play, data.item.key)}>
                                                <Icon name={data.item.play ? 'play' : 'pause'} type='FontAwesome' style={{ color: data.item.play ? PRIMARYCOLOR.ORANGE : 'grey' }} />
                                            </TouchableOpacity>
                                        </Right>
                                    </ListItem>
                                )}
                                renderHiddenItem={(data, rowMap) => (
                                    <View style={styles.rowBack}>
                                        <TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnRight]} onPress={_ => this.deleteRow(rowMap, data.item.key)}>
                                            <Animated.View
                                                style={[
                                                    styles.trash,
                                                    {

                                                        transform: [
                                                            {
                                                                scale: this.rowSwipeAnimatedValues[data.item.key].interpolate({
                                                                    inputRange: [45, 90],
                                                                    outputRange: [0, 1],
                                                                    extrapolate: 'clamp',
                                                                }),
                                                            }
                                                        ],
                                                    }
                                                ]}
                                            >
                                                <Image source={images.trash} style={styles.trash} />
                                            </Animated.View>
                                        </TouchableOpacity>
                                    </View>
                                )}
                                disableRightSwipe={true}
                                rightOpenValue={-75}
                                previewRowKey={'0'}
                                previewOpenValue={-40}
                                previewOpenDelay={3000}
                                onRowDidOpen={this.onRowDidOpen}
                                onSwipeValueChange={this.onSwipeValueChange}
                            />
                    }

                </Content>
            </Container>
        )
    }
}
const mapStateToProps = (state) => ({
    auth: state.auth
})
export default withApollo(connect(mapStateToProps)(AudioLibrary))