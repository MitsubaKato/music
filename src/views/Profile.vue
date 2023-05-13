<template>
  <div class="container mx-auto px-4">
    <div class="flex justify-center py-8">
      <div class="w-full md:w-3/4 lg:w-1/2">
        <div class="bg-white shadow-md rounded p-8">
          <div class="text-center">
            <img :src="user.photoURL || 'https://via.placeholder.com/150'" alt="User Profile Picture"
              class="w-24 h-24 mx-auto rounded-full mb-4" />
            <input type="file" ref="fileInput" @change="handleFileUpload" style="display: none" />
            <button @click="triggerFileUpload" class="btn btn-primary">Update Profile Picture</button>
            <h2 class="text-2xl font-bold">{{ $t("profile.hello") }}, {{ NameUser }}</h2>
          </div>
          <hr class="my-6" />
          <div>
            <h3 class="text-xl font-bold mb-4">{{ $t("profile.likes") }}</h3>
            <ul>
              <li v-for="(song, i) in likedSongs" :key="i" class="mb-2">
                <router-link :to="{ name: 'song', params: { id: song.docID } }"
                  class="text-blue-500 hover:text-blue-700">{{ song.modified_name }}</router-link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script>
import { auth, likesCollection, songsCollection, storage, usersCollection } from "@/includes/firebase";

export default {
  data() {
    return {
      user: {},
      songs: [],
      likedSongs: [],
      unsubscribeAuth: null,
      NameUser: "",
      selectedFile: null,
    };
  },
  created() {
    this.unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        this.NameUser = user.displayName;
        this.fetchUserProfile();
        this.fetchLikedSongs();
      } else {
        this.$router.push({ name: "home" });
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

    triggerFileUpload() {
      this.$refs.fileInput.click(); // Trigger the file input click
    },
    handleFileUpload(event) {
      this.selectedFile = event.target.files[0]; // Get the selected file
      this.uploadProfilePicture(); // Upload the profile picture
    },

    async uploadProfilePicture() {
      const userId = auth.currentUser.uid;
      const storageRef = storage.ref();

      // Создание ссылки на файл в хранилище
      const fileRef = storageRef.child(`users/${userId}/profile-picture/${this.selectedFile.name}`);

      // Загрузка файла
      await fileRef.put(this.selectedFile);

      // Получение URL файла
      const photoURL = await fileRef.getDownloadURL();

      // Обновление URL фотографии в Firestore
      await usersCollection.doc(userId).update({ photoURL });

      // Обновление локального состояния
      this.user.photoURL = photoURL;
    },

    async fetchUserProfile() {
      const userId = auth.currentUser.uid;
      const userSnapshot = await usersCollection.doc(userId).get();
      const userData = userSnapshot.data();

      this.user = {
        ...userData,
        uid: userId,
      };
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

button {
  margin-top: 10px;
  background-color: #4CAF50;
  /* Зеленый */
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #45a049;
}
</style>
  