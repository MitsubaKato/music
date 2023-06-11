<template>
  <div>

  <main>
    <!-- Music Header -->
    <section class="w-full mb-8 py-14 text-center text-white relative">
      <div class="absolute inset-0 w-full h-full box-border bg-contain music-bg"
        style="background-image: url(/assets/img/song-header.png)"></div>
      <div class="container mx-auto flex items-center">
        <!-- Play/Pause Button -->
        <button type="button" class="z-50 h-24 w-24 text-3xl bg-white text-black rounded-full focus:outline-none"
          @click.prevent="newSong(song)">
          <i class="fa text-gray-500 text-xl" :class="{ 'fa-play': !playing, 'fa-pause': playing }"></i>
        </button>
        <div class="z-50 text-left ml-8">
          <!-- Song Cover -->
      <img :src="song.cover" alt="Song Cover" class="h-24 w-24 object-cover rounded-full mr-4">
          <!-- Song Info -->
          <div class="text-3xl font-bold">{{ song.modified_name }}</div>
          <div class="pt-2 block">
            <span v-for="genre in song.genre" :key="genre" class="mr-2 inline-block rounded-full bg-bgGenre px-3 py-1 text-sm font-semibold text-white">{{ genre }}</span>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Form -->
    <section class="container mx-auto mt-6" id="comments">
      <div class="bg-white rounded border border-gray-200 relative flex flex-col">
        <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-200">
          <!-- Comment Count -->
          <span class="card-title">
            {{
              $tc("song.comment_count", song.comment_count, {
                count: song.comment_count,
              })
            }}
          </span>
          <i class="fa fa-comments float-right text-green-400 text-2xl"></i>
        </div>
        <div class="">
          <div class="text-white text-center font-bold p-4 mb-4" v-if="comment_show_alert" :class="comment_alert_variant">
            {{ comment_alert_message }}
          </div>
            <vee-form :validation-schema="schema" @submit="addComment" v-if="userLoggedIn" validate-on="submit">
              <div class="flex items-center shadow-lg mx-8 mb-4"> 
                <div class="w-full bg-white rounded-lg px-4 pt-2">
                  <div class="flex flex-wrap -mx-3 mb-6">
                    <h2 class="px-4 pt-3 pb-2 text-gray-800 text-lg">{{ $t("fieldNames.addComment") }}</h2>
                    <div class="w-full md:w-full px-3 mb-2 mt-2">
                      <vee-field as="textarea" name="comment"
                      class="bg-gray-100 rounded border border-gray-400 leading-normal resize-none w-full h-20 py-2 px-3 font-medium placeholder-gray-700 focus:outline-none focus:bg-white"
                      :placeholder="$t('placeholder.text')"
                      @input="resetError">
                    </vee-field>
                    </div>
                    <div class="ml-3 mt-1">
                      <ErrorMessage v-if="formHasBeenSubmitted" class="text-red-600 block mb-3" name="comment" />
                        <button type="submit" class="bg-white text-gray-700 font-medium py-1 px-4 border border-gray-400 rounded-lg tracking-wide mr-1 hover:bg-gray-100"
                          :disabled="comment_in_submission">
                          {{ $t("fieldNames.submit") }}
                        </button>
                    </div>
                  </div>
                </div>
              </div>
            </vee-form>
          <!-- Comment Sorting -->
          <select v-model="sort"
            class="bg-white text-gray-700 font-medium py-1 px-4 border border-gray-400 rounded-lg tracking-wide mr-1 hover:bg-gray-100 my-8 ml-8">
            <option value="1">{{ $t("fieldNames.latest") }}</option>
            <option value="2">{{ $t("fieldNames.older") }}</option>
          </select>
        </div>
      </div>
    </section>
    <!-- Comments -->    
    <ul class="container mx-auto">
      <li class="p-6 bg-gray-50 " v-for="comment in sortedComments" :key="comment.docID">
        <div class="relative grid grid-cols-1 gap-4 p-4 mb-8 border rounded-lg bg-white shadow-lg">
          <div class="relative flex gap-4">
            <img :src="comment.avatar" class="relative rounded-lg -top-8 -mb-4 bg-white border h-20 w-20" alt="Comment avatar">
              <div class="flex flex-col w-full">
                  <div class="flex flex-row justify-between">
                      <p class="relative text-xl whitespace-nowrap truncate overflow-hidden">{{ comment.name }}</p>
                  </div>
                  <p class="text-gray-400 text-sm">{{ comment.datePosted }}</p>
              </div>
          </div>
          <p class="-mt-4 text-gray-500">{{ comment.content }}</p>
      </div>
      </li>
    </ul>
  </main>
  <app-player :songe="song" />
</div>

</template>

<script>
import { songsCollection, auth, commentsCollection, usersCollection } from "@/includes/firebase";
import { mapState, mapActions, mapGetters } from "vuex";
import AppPlayer from "../components/Player.vue";

export default {
  name: "Song",
  components: {
    AppPlayer,
  },
  data() {
    return {
      song: {},
      songPlaying: false,
      schema: {
        comment: "required|min:3"
      },
      comment_alert_timeout: null,
      formHasBeenSubmitted: false,
      comment_in_submission: false,
      comment_show_alert: false,
      comment_alert_variant: "bg-blue-500",
      comment_alert_message: this.$t("comment.submitted"),
      comments: [],
      sort: "1",
    };
  },

  beforeRouteLeave(to, from, next) {
    this.stopAudio(); // Остановка аудио при переходе на другую страницу
    next();
  },
  computed: {
    ...mapState({
      userLoggedIn: (state) => state.auth.userLoggedIn,
    }),
    ...mapGetters(["playing"]),
    sortedComments() {
      return this.comments.slice().sort((a, b) => {
        if (this.sort === "1") {
          return new Date(b.datePosted) - new Date(a.datePosted);
        }

        return new Date(a.datePosted) - new Date(b.datePosted);
      });
    },
  },
  async beforeRouteEnter(to, from, next) {
    const docSnapshot = await songsCollection.doc(to.params.id).get();

    next((vm) => {
      if (!docSnapshot.exists) {
        vm.$router.push({ name: "home" });
        return;
      }

      const { sort } = vm.$route.query;

      // eslint-disable-next-line no-param-reassign
      vm.sort = sort === "1" || sort === "2" ? sort : "1";

      // eslint-disable-next-line no-param-reassign
      vm.song = docSnapshot.data();
      vm.getComments();
    });
  },
  methods: {
    resetError() {
  this.comment_show_alert = false;
},
    ...mapActions(["newSong", "stopAudio"]),
    async addComment(values, { resetForm }) {
      this.comment_in_submission = true;
      this.comment_show_alert = true;
      this.formHasBeenSubmitted = true;
      console.log('addComment function is called');
      this.comment_alert_timeout = setTimeout(() => {
  this.comment_show_alert = false;
}, 3000);
      this.comment_alert_variant = "bg-blue-500";
      this.comment_alert_message =
        this.$t("comment.submitted")

      const comment = {
        content: values.comment,
        datePosted: new Date().toString(),
        sid: this.$route.params.id,
        name: auth.currentUser.displayName,
        uid: auth.currentUser.uid,
        avatar: auth.currentUser.photoURL
      };

      await commentsCollection.add(comment);

      this.song.comment_count += 1;
      await songsCollection.doc(this.$route.params.id).update({
        comment_count: this.song.comment_count,
      });

      this.getComments();

      this.comment_in_submission = false;
      this.comment_alert_variant = "bg-green-500";
      this.comment_alert_message = this.$t("comment.added");

      resetForm();
      this.formHasBeenSubmitted = false;

      this.comment_alert_timeout = setTimeout(() => {
        this.comment_show_alert = false;
      }, 3000);
    },
    async getComments() {
  const snapshots = await commentsCollection
    .where("sid", "==", this.$route.params.id)
    .get();

  const promises = snapshots.docs.map(async (doc) => {
    let commentData = doc.data();
    let userSnapshot = await usersCollection.doc(commentData.uid).get();
    let userData = userSnapshot.data();

    return {
      docID: doc.id,
      ...commentData,
      avatar: userData.photoURL
    };
  });

  this.comments = await Promise.all(promises);
}
  },
  watch: {
    sort(newVal) {
      if (newVal === this.$route.query.sort) {
        return;
      }

      this.$router.push({
        query: {
          sort: newVal,
        },
      });
    },
  },

  beforeUnmount() {
    clearTimeout(this.comment_alert_timeout);
  },
};
</script>
