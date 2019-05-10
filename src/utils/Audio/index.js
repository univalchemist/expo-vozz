import { Alert } from "react-native";
import { Audio } from "expo";

export default class MusicPlayer {


    constructor(initialState = { speed: 1, autoPlay: false, isLooping: true }) {
        // Create new object from Expo.Audio.Sound
        this.soundObject = new Audio.Sound();
        this.initialState = initialState;
        this.playing = false;
        // Set speed value
    }

    startPlay = async (source, playing = false) => {

        // Checking if now playing music, if yes stop that
        if (this.playing) {
            await this.soundObject.stopAsync();
            await this.soundObject.unloadAsync();
            this.playing = false;
        }
        await this.soundObject.loadAsync(source, this.initialState);
        await this.soundObject.playAsync();
        this.playing = true
    };
    stopPlay = async (playing) => {

        // Checking if now playing music, if yes stop that
        if (this.soundObject != null && this.playing) {
            await this.soundObject.stopAsync();
            await this.soundObject.unloadAsync();
            this.playing=false
        }
    };

    /**
     * Play next item.
     * @return {Promise}
     */
    playNext = async () => {

        if (!this.list[this.index + 1]) {
            Alert.alert('Warning', 'There are no next');
        } else {
            const path = this.list[this.index + 1].path;
            this.index++;
            await this.soundObject.unloadAsync();
            await this.soundObject.loadAsync(path);
            await this.soundObject.playAsync();
        }
    }

    /**
     * Play previous item.
     * @return {Promise}
     */
    playPrev = async () => {
        if (!this.list[this.index - 1]) {
            Alert.alert('Warning', 'There are no prev');
        } else {
            const path = this.list[this.index - 1].path;
            this.index--;
            await this.soundObject.unloadAsync();
            await this.soundObject.loadAsync(path);
            await this.soundObject.playAsync();
        }
    }
}
