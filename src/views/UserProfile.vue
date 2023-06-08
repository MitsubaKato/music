<template>
  <main class="profile-page">
  <section class="relative block h-500-px">
    <div class="absolute top-0 w-full h-full bg-center bg-cover" style="
            background-image: url('https://images.unsplash.com/photo-1499336315816-097655dcfbda?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=crop&amp;w=2710&amp;q=80');
          ">
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
                  <span class="text-xl font-bold block uppercase tracking-wide text-blueGray-600">22</span><span class="text-sm text-blueGray-400">{{$t("profile.like")}}</span>
                </div>
                <div class="mr-4 p-3 text-center">
                  <span class="text-xl font-bold block uppercase tracking-wide text-blueGray-600">10</span><span class="text-sm text-blueGray-400">{{$t("profile.uploads")}}</span>
                </div>
                <div class="lg:mr-4 p-3 text-center">
                  <span class="text-xl font-bold block uppercase tracking-wide text-blueGray-600">89</span><span class="text-sm text-blueGray-400">{{$t("profile.comments")}}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="text-center mt-12">
            <h3 class="text-4xl font-semibold leading-normal mb-2 text-blueGray-700 mb-2">
              {{ user.name }}
            </h3>
          </div>
          <div class="mt-10 py-10 border-t border-blueGray-200 text-center">
            <div class="flex flex-wrap justify-center">
              <div class="w-full lg:w-9/12 px-4">
                <p class="mb-4 text-lg leading-relaxed text-blueGray-700">
                  An artist of considerable range, Jenna the name taken by
                  Melbourne-raised, Brooklyn-based Nick Murphy writes,
                  performs and records all of his own music, giving it a
                  warm, intimate feel with a solid groove structure. An
                  artist of considerable range.
                </p>
              </div>
            </div>
          </div>
          <div class="text-center"> 
            <h3 class="text-xl font-semibold mb-4">{{ $t("profile.uploads") }} <i class="fa fa-upload pl-2 text-blue-500"></i></h3> 
          </div>
          
          <ul class="flex flex-col p-4">
            <li v-for="(song, i) in songs" :key="i" class="flex flex-row mb-2">
              <router-link :to="{ name: 'song', params: { id: song.docID } }" class="block w-full">
                <div class="select-none cursor-pointer bg-green-300 rounded-md flex flex-1 items-center p-4 transition duration-500 ease-in-out transform hover:-translate-y-1 hover:shadow-lg">
                  <div class="flex flex-col rounded-md w-10 h-10 bg-gray-300 justify-center items-center mr-4">?</div>
                  <div class="flex-1 pl-1 mr-16">
                    <div>{{ song.modified_name }}</div>
                    <div class="text-gray-600 text-sm">200ml</div>
                  </div>
                  <div class="text-gray-600 text-xs">6:00 AM</div>
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
import { auth, usersCollection, songsCollection } from "@/includes/firebase";

export default {
  data() {
    return {
      user: {},
      songs: [],
      unsubscribeAuth: null
    };
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  created() {
    this.unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // User is logged in
        const userSnapshot = await usersCollection.doc(this.id).get();
        this.user = userSnapshot.data();
        const songsSnapshot = await songsCollection.where('uid', '==', this.id).get();
        this.songs = songsSnapshot.docs.map(doc => {
          return {
            ...doc.data(),
            docID: doc.id,
          }
        });
      } else {
        // User is logged out, redirect to Home
        this.$router.push({ name: "home" });
      }
    });
  },
  beforeDestroy() {
    // Clean up the listener when the component is destroyed
    this.unsubscribeAuth();
  }
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