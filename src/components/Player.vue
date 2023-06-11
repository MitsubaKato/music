<template>
  <div class="fixed justify-center bottom-0 left-0 bg-white p-5 pb-4 text-left align-top w-full h-15 flex items-center">
    <!-- Control Buttons -->
    <div class="flex-shrink-0 ">
        <button type="button" @click.prevent="toggleAudio">
            <i class="fa  text-3xl" :class="{ 'faк fa-play': !playing, 'faк fa-pause': playing }"></i>
        </button>
    </div>
    <div class="w-14 h-7 leading-3 text-gray-400 text-lg flex items-center pl-5">
      <span class="player-currenttime">{{ seek }}</span>
    </div>
    <!-- Scrub -->
    <div class="flex-grow mx-3 h-2 bg-gray-300 relative cursor-pointer" @click.prevent="updateSeek">
        <!-- Player Ball -->
        <span class="absolute top-neg-8 text-gray-800 text-lg" :style="{ left: playerProgress }">
            <i class="fas fa-circle"></i>
        </span>
        <!-- Player Progress Bar -->
        <span class="block h-2 rounded bg-gradient-to-r from-green-500 to-green-300"
            :style="{ width: playerProgress }"></span>
    </div>

    <!-- Duration -->
    <div class="w-14 h-7 leading-1 text-gray-400 text-lg flex items-center ">
      <span class="player-duration">{{ duration }}</span>
  </div>

    <!-- Volume -->
    <div class="w-16 h-7 leading-3 flex items-center mr-5">
        <input type="range" min="0" max="1" step="0.01" v-model="localVolume" @input="updateVolume" class="slider w-full" />
    </div>

    <!-- Cover Art -->
    <div class="w-14 h-14 mr-3">
        <img :src="songe.cover" alt="Cover art" class="w-full h-full object-cover rounded">
    </div>
    <!-- Song Info -->
    <div class="text-lg">
        <span class="song-title">{{ songe.modified_name }}</span>
        <br/>
        <span class="song-artist">
            ({{ $t('fieldNames.uploadedBy') }} {{ songe.display_name }})
        </span>
    </div>
</div>
  
</template>



<script>
import { mapActions, mapGetters, mapState } from "vuex";

export default {
  name: "Player",
  props: ["songe"],
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
      song: {
      get() {
        return this.currentSong || this.$props.songe;
      },
      set(value) {
        this.currentSong = value;
      },
    },
    }),
  },

  watch: {
    volume(newVolume) {
      this.localVolume = newVolume; // Обновляем локальную переменную при изменении громкости в хранилище
    },
  },

  methods: {
    ...mapActions(["toggleAudio", "updateSeek", "stopAudio", "resetSong", "resetProgress"]),
  updateVolume() {
    this.$store.commit("updateVolume", this.localVolume); // Обновляем громкость в хранилище при изменении локальной переменной
  },
  },

  mounted() {
    this.localVolume = this.volume; // Устанавливаем начальное значение локальной переменной при монтировании компонента
  },

  beforeRouteLeave(to, from, next) { 
  this.stopAudio(); // Останавливаем аудио при переходе на другую страницу
  this.resetSong(); // Сбрасываем текущую песню
  this.resetProgress(); // Сбрасываем прогресс
  next(); // Продолжаем переход на другую страницу
},
};
</script>
