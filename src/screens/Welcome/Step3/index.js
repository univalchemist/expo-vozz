import React, { Component } from 'react';
import { TouchableOpacity, StatusBar, View, Text } from 'react-native';
import { Container, Content,Icon, Card, CardItem, CheckBox } from 'native-base';

import { HeaderContainer } from '../../../components/header';
import { TextView } from '../../../components/textView';
import { Background } from '../../../components/background';
import { styles } from './style';
import { PRIMARYCOLOR } from '../../../constants/style';

class Step3 extends Component {
    constructor(props) {
        super(props);
        this.state = {
            permissions: [{ label: 'Location Permission', checked: false }, { label: 'Notification Permission', checked: true }, { label: 'Recording Permission', checked: false }],
        }
    }

    async componentWillMount() {
    }
    onTapFinsih = () => {
        console.log('onTapNext');
        this.props.navigation.navigate('Home');
        return;
    }
    actionOnRow = (item, index) => {
        console.log('tap permission', item);
    }
    render() {
        const { permissions } = this.state;
        return (
            <Container style={{ paddingTop: StatusBar.currentHeight }}>
                <Background />
                <HeaderContainer title="" navigation={this.props.navigation} goBack={true} right={false} />
                <Content contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <View style={styles.titleContainer}>
                        <TextView style={styles.txtTitle} value={'Almost there!'} />
                    </View>
                    <View style={styles.desContainer}>
                        <Text style={styles.txtDescription} value={'We need you to let Vozz to be able to know where you are to offer the best experience possible and send you notifications'} />
                    </View>
                    <View style={styles.infoContainer}>
                        <Card style={styles.cardContainer}>
                            {permissions.map((item, index) => (

                                <CardItem key={index} button={true} onPress={() => this.actionOnRow(item, index)}>
                                    <CheckBox checked={item.checked} color={PRIMARYCOLOR.PURPLE} onPress={() => this.actionOnRow(item, index)} />
                                    <TextView style={styles.textStyle} value={item.label} />
                                </CardItem>

                            ))}
                        </Card>
                    </View>
                    <View style={styles.bottomView}>
                        <TouchableOpacity iconRight light style={styles.nextTapView} onPress={() => this.onTapFinsih()}>
                            <Icon name='check' type='FontAwesome' style={styles.iconStyle} />
                        </TouchableOpacity>
                    </View>
                </Content>
            </Container>
        );
    }
    //}
}
export default Step3;