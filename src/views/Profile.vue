<template>
    <div class="container mx-auto px-4">
      <div class="flex justify-center py-8">
        <div class="w-full md:w-3/4 lg:w-1/2">
          <div class="bg-white shadow-md rounded p-8">
            <div class="text-center">
              <img
                :src="user.photoURL || 'https://via.placeholder.com/150'"
                alt="User Profile Picture"
                class="w-24 h-24 mx-auto rounded-full mb-4"
              />
              <h2 class="text-2xl font-bold">{{ $t("profile.hello") }}, {{ NameUser }}</h2>
            </div>
            <hr class="my-6" />
            <div>
              <h3 class="text-xl font-bold mb-4">{{ $t("profile.likes") }}</h3>
              <ul>
                <li v-for="(song, i) in likedSongs" :key="i" class="mb-2">
                  <router-link :to="{ name: 'song', params: { id: song.docID } }" class="text-blue-500 hover:text-blue-700">{{ song.modified_name }}</router-link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
import { auth, likesCollection, songsCollection } from "@/includes/firebase";

export default {
  data() {
    return {
      user: {},
      songs: [],
      likedSongs: [],
      unsubscribeAuth: null,
    };
  },
  created() {
    this.unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        this.NameUser = user.displayName;
        this.fetchLikedSongs();
      } else {
        this.$router.push({ name: "Home" });
      }
    });
  },
  methods: {
    async fetchLikedSongs() {
      const userId = auth.currentUser.uid;
      const likesSnapshot = await likesCollection.where("userId", "==", userId).get();

      // Создайте массив промисов для запросов песен
      const songPromises = likesSnapshot.docs.map((likeDoc) => {
        const likeData = likeDoc.data();
        return songsCollection.doc(likeData.songId).get();
      });

      const songSnapshots = await Promise.all(songPromises);

      songSnapshots.forEach((songSnapshot) => {
        // Проверьте, существует ли песня, прежде чем добавлять ее в массив
        if (songSnapshot.exists) {
          const songData = songSnapshot.data();
          this.likedSongs.push({
            ...songData,
            docID: songSnapshot.id,
          });
        }
      });
    },
  },
};
</script>
  
  
  <style scoped>
  .container {
    max-width: 1024px;
  }

  ul li {
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 8px 12px;
    margin-bottom: 8px;
  }
  
  ul li:hover {
    background-color: #f3f3f3;
  }
  </style>
  