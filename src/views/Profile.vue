<template>
<main class="profile-page">
<section class="relative block h-500-px">
  <div @click="triggerBgUpload" class="absolute top-0 w-full h-full bg-center bg-cover" :style="`background-image: url('${user.backgroundURL || '../assets/img/user-header.png'}');`">
        <input type="file" ref="bgInput" @change="handleBgUpload" style="display: none" />
    <span id="blackOverlay" class="w-full h-full absolute opacity-50 bg-black"></span>
  </div>
  <div class="top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden h-70-px" style="transform: translateZ(0px)">
    <svg class="absolute bottom-0 overflow-hidden" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" version="1.1" viewBox="0 0 2560 100" x="0" y="0">
      <polygon class="text-blueGray-200 fill-current" points="2560 0 2560 100 0 100"></polygon>
    </svg>
  </div>
</section>
<section class="relative py-16 bg-blueGray-200">
  <div class="container mx-auto px-4">
    <div class="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg -mt-64">
      <div class="px-6">
        <div class="flex flex-wrap justify-center">
          <div class="w-full lg:w-3/12 px-4 lg:order-2 flex justify-center">
              <input type="file" ref="fileInput" @change="handleFileUpload" style="display: none" />              
              <img alt="..." :src="user.photoURL || 'https://via.placeholder.com/150'" @click="triggerFileUpload" class="w-40 h-40 rounded-full border-4 
              border-green-400 object-cover -m-20 opacity-100 transition duration-300 ease-in-out hover:opacity-90">
          </div>
          <div class="w-full lg:w-4/12 px-4 lg:order-3 lg:text-right lg:self-center">
          </div>
          <div class="w-full lg:w-4/12 px-4 lg:order-1">
            <div class="flex justify-center py-4 lg:pt-4 pt-8">
              <div class="mr-4 p-3 text-center">
                <span class="text-xl font-bold block uppercase tracking-wide text-blueGray-600">{{ userLikes }}</span>
                <span class="text-sm text-blueGray-400">{{$t("profile.like")}}</span>
            </div>
            <div class="mr-4 p-3 text-center">
                <span class="text-xl font-bold block uppercase tracking-wide text-blueGray-600">{{ userUploads }}</span>
                <span class="text-sm text-blueGray-400">{{$t("profile.uploads")}}</span>
            </div>
            <div class="lg:mr-4 p-3 text-center">
                <span class="text-xl font-bold block uppercase tracking-wide text-blueGray-600">{{ userComments }}</span>
                <span class="text-sm text-blueGray-400">{{$t("profile.comments")}}</span>
            </div>
            </div>
          </div>
        </div>
        <div class="text-center mt-12">
          <h3 class="text-4xl font-semibold leading-normal mb-2 text-blueGray-700 mb-2">
            {{ NameUser }}
          </h3>
        </div>
        <div class="mt-10 py-10 border-t border-blueGray-200 text-center">
        </div>
        <div class="text-center"> 
          <h3 class="text-xl font-semibold mb-4">{{ $t("profile.likes") }} <i class="fa fa-heart pl-2 text-red-500"></i></h3> 
        </div>
        
        <ul class="flex flex-col p-4">
          <li v-for="(song, i) in likedSongs" :key="i" class="flex flex-row mb-2">
            <router-link :to="{ name: 'song', params: { id: song.docID } }" class="block w-full">
              
              <div class="select-none cursor-pointer bg-gradient-to-l from-teal-200 via-sky-400 to-emerald-400  rounded-md flex flex-1 items-center p-4 transition duration-500 ease-in-out transform hover:-translate-y-1 hover:shadow-lg">
                
                <img :src="song.cover || 'https://via.placeholder.com/150'" class="rounded-md w-10 h-full justify-center items-center mr-4"/>

                <div class="flex-1 pl-1 mr-16">
                  <div>{{ song.modified_name }}</div>
                  <div class="pt-2 block">
                    <span v-for="genre in song.genre" :key="genre" class="mr-2 inline-block rounded-full bg-bgGenre px-3 py-1 text-sm font-semibold text-white">{{ genre }}</span>
                  </div>
                </div>
                <span class="inline-block bg-bgName  rounded-full px-3 py-1 text-sm font-semibold text-white cursor-pointer">{{ song.display_name }}</span>
              </div>

            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </div>
</section>
</main>
</template>
  
<script>
import { auth, likesCollection, songsCollection, storage, usersCollection, commentsCollection } from "@/includes/firebase";

export default {
  data() {
    return {
      user: {},
      songs: [],
      likedSongs: [],
      unsubscribeAuth: null,
      NameUser: "",
      selectedFile: null,
      userLikes: 0,
      userComments: 0,
      userUploads: 0,
    };
  },
  beforeUnmount() {
  if (this.unsubscribeProfileListener) {
    this.unsubscribeProfileListener(); // Отмена слушателя изменений аватара пользователя
  }
},
  created() {
    this.unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        this.NameUser = user.displayName;
        this.fetchUserProfile();
        this.fetchLikedSongs();
        this.fetchUserStats();
      } else {
        this.$router.push({ name: "home" });
      }
    });
  },

  methods: {
    async fetchUserStats() {
    const userId = auth.currentUser.uid;

    // Получить количество лайков
    const likesSnapshot = await likesCollection.where("userId", "==", userId).get();
    this.userLikes = likesSnapshot.docs.length;

    // Получить количество комментариев
    const commentsSnapshot = await commentsCollection.where("uid", "==", userId).get();
    this.userComments = commentsSnapshot.docs.length;

    // Получить количество загруженных треков
    const songsSnapshot = await songsCollection.where("uid", "==", userId).get();
    this.userUploads = songsSnapshot.docs.length;
},
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

    triggerBgUpload() {
    this.$refs.bgInput.click(); // Trigger the file input click
  },

  handleBgUpload(event) {
    this.selectedBgFile = event.target.files[0]; // Get the selected file
    this.uploadBackgroundPicture(); // Upload the background picture
  },

  async uploadBackgroundPicture() {
    const userId = auth.currentUser.uid;
    const storageRef = storage.ref();

    // Создание ссылки на файл в хранилище
    const fileRef = storageRef.child(`users/${userId}/background-picture/${this.selectedBgFile.name}`);

    // Загрузка файла
    await fileRef.put(this.selectedBgFile);

    // Получение URL файла
    const backgroundURL = await fileRef.getDownloadURL();

    // Обновление URL фотографии в Firestore
    await usersCollection.doc(userId).update({ backgroundURL });

    // Обновление локального состояния
    this.user.backgroundURL = backgroundURL;
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

  // Получение информации о пользователе
  const userSnapshot = await usersCollection.doc(userId).get();
  const userData = userSnapshot.data();

  // Обновление локального состояния аватара пользователя
  this.user = {
    ...userData,
    uid: userId,
  };
  // Слушатель изменений аватара пользователя в Firestore
  this.unsubscribeProfileListener = usersCollection.doc(userId).onSnapshot((snapshot) => {
    const updatedData = snapshot.data();

    // Обновление локального состояния аватара пользователя при изменениях
    this.user.photoURL = updatedData.photoURL;
  });
    },
  },
};
</script>
  
  
<style scoped>
@import url('https://demos.creative-tim.com/notus-js/assets/styles/tailwind.css');
@import url('https://demos.creative-tim.com/notus-js/assets/vendor/@fortawesome/fontawesome-free/css/all.min.css');
.container {
  max-width: 1024px;
}

ul li:hover {
  background-color: transparent; /* Это уберет фон при наведении */
}

ul li:hover a {
  color: inherit; /* Это уберет изменение цвета текста при наведении */
}

</style>


  