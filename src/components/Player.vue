<template>
  <!-- Player -->
  <div class="fixed bottom-0 left-0 bg-white p-5 pb-4 text-left align-top w-full h-16">
    <div class="relative flex items-center">
      <!-- Play/Pause Button -->
      <div class="w-7 h-7 leading-3">
        <button type="button" @click.prevent="toggleAudio">
          <i class="fa text-gray-500 text-xl" :class="{ 'fa-play': !playing, 'fa-pause': playing }"></i>
        </button>
      </div>
      <!-- Volume Slider -->
      <div class="w-24 h-7 leading-3 mt-1 mr-5 flex items-center">
        <input type="range" min="0" max="1" step="0.01" v-model="localVolume" @input="updateVolume" class="slider" />
      </div>
      <!-- Current Position -->
      <div class="w-14 h-7 leading-3 text-gray-400 text-lg flex items-center pl-5">
        <span class="player-currenttime">{{ seek }}</span>
      </div>
      <!-- Scrub -->
      <div class="w-1/2 h-7 leading-3 ml-3 mt-2 player-scrub flex-grow-0">
        <div class="absolute left-0 right-0 text-lg text-center mx-auto player-song-info"
          v-if="currentSong.modified_name">
          <span class="song-title">{{ currentSong.modified_name }}</span>
          <span class="song-artist">
            ({{ $t('fieldNames.uploadedBy') }} {{ currentSong.display_name }})
          </span>
        </div>
        <!-- Scrub Container  -->
        <span class="block w-full h-2 rounded m-1 mt-2 bg-gray-200 relative cursor-pointer" @click.prevent="updateSeek">
          <!-- Player Ball -->
          <span class="absolute top-neg-8 text-gray-800 text-lg" :style="{ left: playerProgress }">
            <i class="fas fa-circle"></i>
          </span>
          <!-- Player Progress Bar -->
          <span class="block h-2 rounded bg-gradient-to-r from-green-500 to-green-400"
            :style="{ width: playerProgress }"></span>
        </span>
      </div>
      <!-- Duration -->
      <div class="w-14 h-7 leading-1 text-gray-400 text-lg ml-3 flex items-center">
        <span class="player-duration">{{ duration }}</span>
      </div>
    </div>
  </div>
</template>



<script>
import { mapActions, mapGetters, mapState } from "vuex";

export default {
  name: "Player",
  data() {
    return {
      showVolumeSlider: false,
      localVolume: 0,
    };
  },
  computed: {
    ...mapGetters(["playing"]),
    ...mapState({
      seek: (state) => state.player.seek,
      duration: (state) => state.player.duration,
      playerProgress: (state) => state.player.playerProgress,
      currentSong: (state) => state.player.currentSong,
      volume: (state) => state.player.volume,
    }),
  },

  watch: {
    volume(newVolume) {
      this.localVolume = newVolume; // Обновляем локальную переменную при изменении громкости в хранилище
    },
  },

  methods: {
    ...mapActions(["toggleAudio", "updateSeek", "stopAudio"]),
    updateVolume() {
      this.$store.commit("updateVolume", this.localVolume); // Обновляем громкость в хранилище при изменении локальной переменной
    },
  },

  mounted() {
    this.localVolume = this.volume; // Устанавливаем начальное значение локальной переменной при монтировании компонента
  },

  beforeRouteLeave(to, from, next) { // Добавьте этот хук
    this.stopAudio(); // Остановите аудио при переходе на другую страницу
    next(); // Не забудьте вызвать next(), чтобы продолжить переход на другую страницу
  },
};
</script>
