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
              <h2 class="text-2xl font-bold">{{ user.name }}</h2>
            </div>
            <hr class="my-6" />
            <div>
              <h3 class="text-xl font-bold mb-4">{{ $t("profile.uploads") }}</h3>
              <ul>
                <li v-for="(song, i) in songs" :key="i" class="mb-2">
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