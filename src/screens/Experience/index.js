import React, { Component } from 'react';
import { FlatList, StatusBar, TouchableOpacity, View, Alert } from 'react-native';
import { Container, Content, List, ListItem, Left, Body, Right, CheckBox, Icon } from 'native-base';
import Spinner from 'react-native-loading-spinner-overlay';
import { connect } from 'react-redux';
import { withApollo } from 'react-apollo'

import { styles } from './style';
import { TextView } from '../../components/textView';
import { Background } from '../../components/background';
import { HeaderContainer } from '../../components/header';
import { PRIMARYCOLOR } from '../../constants/style';
import { updateProgressFlag } from '../../actions';
import { USER_MOMENT_QUERY } from '../../utils/Apollo/Queries/moment';
import { calDiffDays } from '../../utils/Date';
import { ScrollView } from 'react-native-gesture-handler';
import MusicPlayer from '../../utils/Audio';
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
class Experience extends Component {
    MusicPlayer = null;
    constructor(props) {
        super(props);

        this.state = {
            flag: false,
            records: {},
            diffs: [],
            playing: false,
        };
    }
    componentWillMount() {
        this.getMoments();
        this.MusicPlayer = new MusicPlayer();
    }
    componentWillUnmount() {
    }

    getMoments = () => {
        this.props.dispatch(updateProgressFlag(true));
        this.props.client.query({ query: USER_MOMENT_QUERY, fetchPolicy: 'network-only', variables: { id: this.props.auth.user._id } }).then(
            (res) => {
                this.props.dispatch(updateProgressFlag(false));
                let data = res.data.moments;
                data.sort((d1, d2) => new Date(d2.createdAt).getTime() - new Date(d1.createdAt).getTime());
                let temp = [];
                data.map(item => {
                    let diff = calDiffDays(item.createdAt);
                    let t = {
                        diff: diff,
                        value: false,
                        play: false,
                        title: item.title,
                        item: item
                    };
                    temp.push(t);
                });
                let result = temp.reduce(function (r, a) {
                    r[a.diff] = r[a.diff] || [];
                    r[a.diff].push(a);
                    return r;
                }, Object.create(null));
                this.setState({ records: result, diffs: Object.keys(result) })
            },
            (err) => {
                this.props.dispatch(updateProgressFlag(false));
                console.log({ err })
            }
        );
    }
    onTapNext = () => {
        let temp = [];
        this.state.diffs.map(diff => {
            for (t of this.state.records[`${diff}`]) {
                if (t.value) {
                    temp.push(t);
                }
            }
        })
        
        if (temp.length < 1) {
            Alert.alert(
                'Vozz',
                'You should choose one record at least to create the route.',
                [
                    { text: 'OK', onPress: () => console.log('Cancel Pressed'), style: 'cancel' }
                ],
                { cancelable: false }
            )
            return;
        }
        this.MusicPlayer.stopPlay()
        this.props.navigation.navigate('AddDetailExperience', { records: temp });
    }
    actionOnRow = (item, key, index) => {
        let temp = this.state.records;
        temp[`${key}`][index]['value'] = !temp[`${key}`][index]['value'];
        this.setState({ records: temp })
    }
    onTapPlayRow = (play, key, index) => {
        let temp = this.state.records;
        this.state.diffs.map(diff => {
            for (t of temp[`${diff}`]) {
                t.play = false;
            }
        })

        temp[`${key}`][index]['play'] = !play;
        this.setState({ records: temp })
        if (play) {
            this.stopPlay();
            return;
        }

        let uri = temp[`${key}`][index]['item']['audio']['url'];
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
    render() {
        const { flag, records, diffs } = this.state;
        return (
            <Container style={{ paddingTop: StatusBar.currentHeight }}>
                <Background start={PRIMARYCOLOR.ORANGE} end={PRIMARYCOLOR.ORANGE} />
                <Spinner
                    visible={flag}
                    textContent={""}
                />
                <HeaderContainer player={this.MusicPlayer} title={'Select the clips'} goBack={true} navigation={this.props.navigation} right={true} rightText={'Next'} onTapRight={this.onTapNext} />
                <Content contentContainerStyle={styles.contentStyle}>
                    <ScrollView>
                        {diffs.map(item =>
                            <View key={item}>
                                <ListItem icon itemDivider>
                                    <Left></Left>
                                    <Body>
                                        <TextView style={{ color: 'grey' }} value={item == 0?`Recent`:`${item} day ago`} />
                                    </Body>
                                    <Right></Right>
                                </ListItem>
                                <RenderRecords name={item} records={records[`${item}`]} actionOnRow={this.actionOnRow} onTapPlayRow={this.onTapPlayRow} />
                            </View>
                        )}
                    </ScrollView>
                </Content>
            </Container>
        )
    }
}
const mapStateToProps = (state) => ({
    auth: state.auth
});
export default withApollo(connect(mapStateToProps)(Experience));