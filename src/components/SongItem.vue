<template>
  <div class="flex justify-between items-center pb-6 p-3 pl-6 " :id="`song-id-${song.docID}`">
    <div class="flex-1">
      <router-link :to="{ name: 'song', params: { id: song.docID } }" class="font-bold block text-white">{{ song.modified_name }}</router-link>
      <span class="text-gray-300 text-sm pt-2 block">{{ song.genre }}</span>
      <router-link :to="{ name: 'UserProfile', params: { id: song.uid } }" class="song-owner">
        <span class="text-gray-500 text-sm">{{ $t('fieldNames.uploadedBy') }} <span class="text">{{ song.display_name }}</span></span>
      </router-link>      
    </div>

    <span class="ml-3 text-gray-600">
      <i class="fa fa-comments"></i>
      {{ song.comment_count }}
    </span>

    <div class="flex items-center ml-5">
      <button @click="addLike" :class="{ 'heart': liked, 'heartBeat': liked }">
        <i class="fa fa-heart" :class="{ 'text-red-500': liked, 'text-gray-500': !liked }"></i>
      </button>
      
    </div>
  </div>
</template>


<style scoped>
.heart {
  position: relative;
  animation-name: fade;
  animation-duration: 0.2s;
  animation-fill-mode: forwards;
  opacity: 1;
}



.fadeOut {
  animation-name: fade;
  animation-duration: 0.2s;
  animation-fill-mode: forwards;
  opacity: 1;
}

@keyframes fade {
  from {
    opacity: 1;
  }
  to {
    opacity: 0.5;
  }
}

.text:hover {
  color: orange;
}

.text {
  color: gray;
  transition: color 0.3s ease;
}
</style>


<script>
import { likesCollection, auth } from "@/includes/firebase";


export default {
  name: "SongItem",
  props: ["song"],
  data() {
    return {
      liked: false
    };
  },
  async created() {
    await this.checkUserLike();
  },
  mounted() {
    auth.onAuthStateChanged(async (user) => {
      if (!user) {
        this.liked = false;
      } else {
        await this.checkUserLike();
      }
    });
  },
  methods: {

    async checkUserLike() {
      const user = auth.currentUser;

      if (user) {
        // Проверяем, лайкнул ли пользователь эту песню
        const existingLike = await likesCollection
          .where("songId", "==", this.song.docID)
          .where("userId", "==", user.uid)
          .get();

        if (existingLike.size > 0) {
          this.liked = true;
        } else {
          this.liked = false;
        }
      } else {
        this.liked = false;
      }
    },
    async addLike() {
      const user = auth.currentUser;

      if (!user) {
        alert("Please sign in to like songs.");
        return;
      }

      if (this.liked) {
        // Удалить лайк, если пользователь уже лайкнул эту песню
        const existingLike = await likesCollection
          .where("songId", "==", this.song.docID)
          .where("userId", "==", user.uid)
          .get();

        existingLike.forEach(async (likeDoc) => {
          await likeDoc.ref.delete();
          this.liked = false;
        });
      } else {
        // Добавить новый лайк, если пользователь еще не лайкнул эту песню
        const like = {
          songId: this.song.docID,
          userId: user.uid,
          userName: user.displayName,
          songName: this.song.modified_name
        };

        await likesCollection.add(like);
        this.liked = true;
      }
    }
  }
};
</script>




