<template>
  <div class="select-none cursor-pointer bg-gradient-to-r from-gray-800 to-gray-700 rounded-md flex flex-1 items-center p-4 mb-3 transition duration-500 ease-in-out transform hover:-translate-y-1 hover:shadow-lg " :id="`song-id-${song.docID}`">
    
    <div>
        <img :src="song.cover || 'https://via.placeholder.com/150'" class="w-20 h-full rounded-md" alt="">
    </div>

    <div class="flex-grow pl-4">
        <router-link :to="{ name: 'song', params: { id: song.docID } }" class="font-bold block text-white">{{ song.modified_name }}</router-link>
        
        <div class="pt-2 block">
          <span v-for="genre in song.genre" :key="genre" class="mr-2 inline-block rounded-full bg-bgGenre px-3 py-1 text-sm font-semibold text-white">{{ genre }}</span>
        </div>
        
        <span class="song-owner block pt-2" @click="checkAuth">
          <span class="inline-block rounded-l-lg bg-bgUploadBy px-3 py-1 text-sm font-semibold text-white">{{ $t('fieldNames.uploadedBy') }}</span> 
          <span class="inline-block bg-bgName rounded-r-lg px-3 py-1 text-sm font-semibold text-white cursor-pointer">{{ song.display_name }}</span>
        </span>
    </div>

    <div class="flex items-center ml-5">
      <span class="ml-3 text-white">
        <i class="fa fa-comments text-white"></i>
        {{ song.comment_count }}
      </span>

      <button @click="addLike" :class="{ 'heart': liked, 'heartBeat': liked }">
        <i class="fa fa-heart ml-4" :class="{ 'text-red-700': liked, 'text-gray-500': !liked }"></i>
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
    checkAuth() {
      if (!auth.currentUser) {
        this.$emit('showAuthModal');
      } else {
        this.$router.push({ name: 'UserProfile', params: { id: this.song.uid } });
      }
    },

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
        alert("Please sign in to like songs."); // перевод
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




