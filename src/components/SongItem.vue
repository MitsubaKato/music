<template>
  <div
    class="flex justify-between items-center pb-6 p-3 pl-6 cursor-pointer transition duration-400 hover:bg-gray-700"
    :id="`song-id-${song.docID}`"
  >
    <div>
      <router-link
        :to="{ name: 'song', params: { id: song.docID } }"
        class="font-bold block text-white"
      >
        {{ song.modified_name.split(".")[0] }}
      </router-link>
      <span class="text-gray-300 text-sm pt-2 block">
        {{ song.genre }}
      </span>
      <span class="text-gray-500 text-sm">
        {{ $t('uploadedBy') }} {{ song.display_name }}
      </span>      
    </div>

    <div class="text-gray-600 text-lg">
      <router-link
        custom
        :to="{ name: 'song', params: { id: song.docID }, hash: '#comments' }"
        v-slot="{ navigate }"
      >
        <span class="comments" @click="navigate">
          <i class="fa fa-comments text-gray-600"></i>
          {{ song.comment_count }}
        </span>
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: "SongItem",
  props: ["song"],
};
</script>
