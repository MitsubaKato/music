<template>
  <div class="border border-gray-200 p-3 mb-4 rounded">
    <div v-show="!showForm">
      <h4 class="inline-block text-2xl font-bold">{{ song.modified_name }}</h4>
      <button class="ml-1 py-1 px-2 text-sm rounded text-white bg-red-600 float-right" @click.prevent="deleteSong">
        <i class="fa fa-times"></i>
      </button>

      <button class="ml-1 py-1 px-2 text-sm rounded text-white bg-blue-600 float-right"
        @click.prevent="showForm = !showForm">
        <i class="fa fa-pencil-alt"></i>
      </button>

    </div>
    <div v-show="showForm">
      <div class="text-white text-center font-bold p-4 mb-4" v-if="show_alert" :class="alert_variant">
        {{ alert_message }}
      </div>
      <vee-form :validation-schema="schema" :initial-values="song" @submit="edit">
        <div class="mb-3">
          <label class="inline-block mb-2">{{ $t("edit.title") }}</label>
          <vee-field type="text" name="modified_name"
            class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
            @input="updateUnsavedFlag(true)" />
          <ErrorMessage class="text-red-600" name="modified_name" />
        </div>
        <div class="mb-3">
          <label class="inline-block mb-2">{{ $t("edit.genre") }}</label>
          <VueMultiselect
            v-model="value"
            :options="tags"
            :multiple="true"
            :close-on-select="true"
            :taggable="true"
            @tag="addTag"
            placeholder="Pick some"
            label="name"
            track-by="name"
            @input="updateUnsavedFlag(true)"
          />
         
          <ErrorMessage class="text-red-600" name="genre" />
        </div>

        <button type="submit" @click="saveTags" class="py-1.5 px-3 rounded text-white bg-green-600" :disabled="in_submission">
          {{ $t("edit.submit") }}
        </button>
        <button type="button" class="py-1.5 px-3 ml-5 rounded text-white bg-gray-600" :disabled="in_submission"
          @click.prevent="showForm = false">
          {{ $t("edit.back") }}
        </button>
      </vee-form>
    </div>
  </div>
</template>

<script>
import { songsCollection, storage, db } from "@/includes/firebase";
import { Form, Field } from 'vee-validate';
import VueMultiselect from 'vue-multiselect'


export default {
  name: "CompositionItem",
  components: {
    VeeForm: Form,
    VeeField: Field,
    VueMultiselect
  },
  props: {
    song: {
      type: Object,
      required: true,
    },
    updateSong: {
      type: Function,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    removeSong: {
      type: Function,
      required: true,
    },
    updateUnsavedFlag: {
      type: Function,
    },
  },
  data() {
    return {
      showForm: false,
      value: [],
      tags: [],
      schema: {
        modified_name: "required",
        genre: "alpha_spaces",
      },
      in_submission: false,
      show_alert: false,
      alert_variant: "bg-blue-500",
      alert_message: this.$t('alert.update'),
    };
  },
  async created() {
    const snapshot = await db.collection('tags').get();
    snapshot.forEach((doc) => {
      this.tags.push({ name: doc.id });
    });
    
    const songSnapshot = await db.collection('songs').doc(this.song.docID).get();
  const songData = songSnapshot.data();
  if (songData.genre) {
    this.value = songData.genre.map(genre => ({ name: genre }));
  }
  },
  methods: {
    async addTag(newTagName) {
      const newTag = {
        name: newTagName
      };
      await db.collection('tags').doc(newTagName).set(newTag);
      this.tags.push(newTag);
      this.value.push(newTag);
    },
    async edit(values) {
      this.in_submission = true;
      this.show_alert = true;
      this.alert_variant = "bg-blue-500";
      this.alert_message = this.$t('alert.update');

      try {
        await songsCollection.doc(this.song.docID).update(values);
      } catch (error) {
        this.in_submission = false;
        this.alert_variant = "bg-red-500";
        this.alert_message = this.$t('alert.wrong');
        return;
      }

      this.updateSong(this.index, values);
      this.updateUnsavedFlag(false);
      await this.saveTags();

      this.in_submission = false;
      this.alert_variant = "bg-green-500";
      this.alert_message = this.$t('alert.success');
    },
    async saveTags() {
      await db.collection('songs').doc(this.song.docID).update({
        genre: this.value.map(tag => tag.name)
      });
      this.updateSong(this.index, this.song);
    },
    async deleteSong() {
      const storageRef = storage.ref();
      const songRef = storageRef.child(`songs/${this.song.original_name}`);

      await songRef.delete();

      await songsCollection.doc(this.song.docID).delete();

      this.removeSong(this.index);
    },
  },
};
</script>

<style src="vue-multiselect/dist/vue-multiselect.css"></style>