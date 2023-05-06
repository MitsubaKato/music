import { Howl } from 'howler';
import helper from '@/includes/helper';

export default {
  state: {
    currentSong: {},
    sound: {},
    seek: '00:00',
    duration: '00:00',
    playerProgress: '0%',
    positionUpdateInterval: null,
  },
  getters: {
    playing: (state) => {
      if (state.sound.playing) {
        return state.sound.playing();
      }

      return false;
    },
  },
  mutations: {
    newSong(state, payload) {
      state.currentSong = payload;
      state.sound = new Howl({
        src: [payload.url],
        html5: true,
      });
    },
    updatePosition(state) {
      state.seek = helper.formatTime(state.sound.seek());
      state.duration = helper.formatTime(state.sound.duration());
      state.playerProgress = `${(state.sound.seek() / state.sound.duration()) * 100}%`;
    },
    updateVolume(state, payload) {
      state.sound.volume(payload);
    },
  },
  actions: {
    async newSong({ commit, state, dispatch }, payload) {
      if (state.sound instanceof Howl) {
        state.sound.unload();
      }

      commit('newSong', payload);

      state.sound.play();

      state.sound.on('play', () => {
        requestAnimationFrame(() => {
          dispatch('progress');
        });
      });
    },
    async toggleAudio({ state, dispatch }) {
      if (!state.sound.playing) {
        return;
      }
    
      if (state.sound.playing()) {
        state.sound.pause();
      } else {
        state.sound.play();
      }
      dispatch('progress');
    },
    progress({ commit, state }) {
      if (state.positionUpdateInterval !== null) {
        clearInterval(state.positionUpdateInterval);
      }
    
      state.positionUpdateInterval = setInterval(() => {
        commit('updatePosition');
      }, 100);
    },
    updateSeek({ state, dispatch }, payload) {
      if (!state.sound.playing) {
        return;
      }
    
      const { x, width } = payload.currentTarget.getBoundingClientRect();
      const clickX = payload.clientX - x;
      const percentage = clickX / width;
      const seconds = state.sound.duration() * percentage;
    
      state.sound.seek(seconds);
      dispatch('progress');
    },
  },
};
