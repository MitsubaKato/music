<template>
  <section class="container mx-auto mt-6">
    <div class="md:grid md:grid-cols-3 md:gap-4">
      <div class="col-span-1">
        <app-upload ref="upload" :addSong="addSong" />
      </div>
      <div class="col-span-2">
        <div class="bg-white rounded border border-gray-200 relative flex flex-col">
          <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-200">
            <span class="card-title">{{ $t("manage.my_songs") }}, {{ NameUser }} </span>

            <i class="fa fa-compact-disc float-right text-green-400 text-2xl"></i>
          </div>

          <div class="p-6">
            <!-- Composition Items -->
            <composition-item v-for="(song, i) in songs" :key="song.docID" :song="song" :updateSong="updateSong"
              :index="i" :removeSong="removeSong" :updateUnsavedFlag="updateUnsavedFlag" />
          </div>

        </div>
      </div>
    </div>
  </section>
</template>

<script>
import AppUpload from "@/components/Upload.vue";
import CompositionItem from "@/components/CompositionItem.vue";
import { likesCollection, songsCollection, auth } from "@/includes/firebase";

export default {
  name: "manage",
  components: {
    AppUpload,
    CompositionItem,
  },
  data() {
    return {
      songs: [],
      likedSongs: [],
      unsavedFlag: false,
      unsubscribeAuth: null,
      NameUser: "",
    };
  },

  created() {
    this.unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        this.NameUser = user.displayName;
        this.fetchUserSongs();
        this.fetchLikedSongs();
      } else {
        this.$router.push({ name: "home" });
      }
    });
  },
  beforeUnmount() {
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
    }
  },

  methods: {
    async fetchUserSongs() {
      const userId = auth.currentUser.uid;
      const snapshot = await songsCollection.where("uid", "==", userId).get();
      this.songs = [];

      snapshot.forEach((document) => {
        const song = {
          ...document.data(),
          docID: document.id,
        };

        this.songs.push(song);
      });
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
        const songData = songSnapshot.data();
        this.likedSongs.push({
          ...songData,
          docID: songSnapshot.id,
        });
      });
    },
    updateSong(i, values) {
      this.songs[i].modified_name = values.modified_name;
      this.songs[i].genre = values.genre;
    },

    async deleteLikes(songId) {
      const likesSnapshot = await likesCollection.where("songId", "==", songId).get();
      const batch = likesCollection.firestore.batch();

      likesSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
    },

    async removeSong(i) {
      const songId = this.songs[i].docID;
      await this.deleteLikes(songId);
      await songsCollection.doc(songId).delete();
      this.songs.splice(i, 1);
    },
    addSong(document) {
      const song = {
        ...document.data(),
        docID: document.id,
      };

      this.songs.push(song);
    },
    updateUnsavedFlag(value) {
      this.unsavedFlag = value;
    },
  },
  beforeRouteLeave(to, from, next) {
    if (!this.unsavedFlag) {
      next();
    } else {
      // eslint-disable-next-line no-alert, no-restricted-globals
      const leave = confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      next(leave);
    }
  },
};
</script>
