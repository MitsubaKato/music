
<template>
  <!-- Error Modal -->
  <div v-if="showErrorModal" class="fixed inset-0 flex items-center justify-center z-50" @click="showErrorModal = false">
    <div class="bg-white rounded p-8" @click.stop>
      <h2 class="text-xl font-bold mb-4">{{ $t('manage.error') }}</h2>
      <p>{{ errorMessage }}</p>
      <button class="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        @click="showErrorModal = false">{{ $t('manage.close') }}</button>
    </div>
  </div>

  <div class="bg-white rounded border border-gray-200 relative flex flex-col">
    <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-200">
      <span class="card-title">{{ $t("manage.upload") }}</span>
      <i class="fas fa-upload float-right text-green-400 text-2xl"></i>
    </div>
    <div class="p-6">
      <!-- Upload Dropbox -->
      <div
        class="w-full px-10 py-20 rounded text-center cursor-pointer border border-dashed border-gray-400 text-gray-400 transition duration-500 hover:text-white hover:bg-green-400 hover:border-green-400 hover:border-solid"
        :class="{ 'bg-green-400 border-green-400 border-solid': is_dragover }" @drag.prevent.stop=""
        @dragstart.prevent.stop="" @dragend.prevent.stop="is_dragover = false" @dragover.prevent.stop="is_dragover = true"
        @dragenter.prevent.stop="is_dragover = true" @dragleave.prevent.stop="is_dragover = false"
        @drop.prevent.stop="upload($event)">
        <h5>{{ $t("files.drop") }}</h5>
      </div>
      <label class="custom-file-upload">
        {{ $t('labels.upload') }}
        <input type="file" accept="audio/mpeg" multiple @change="upload($event)" style="display:none" />
      </label>
      <hr class="my-6" />
      <!-- Progess Bars -->
      <div class="mb-4" v-for="upload in uploads" :key="upload.name">
        <!-- File Name -->
        <div class="font-bold text-sm flex justify-between items-center" :class="upload.text_class">
          <span>
            <i :class="upload.icon"></i> {{ upload.name }}
          </span>
          <button v-if="upload.variant === 'bg-yellow-400'" class="text-red-600" @click="removeUpload(upload)">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="flex h-4 overflow-hidden bg-gray-200 rounded">
          <!-- Inner Progress Bar -->
          <div class="transition-all progress-bar" :class="upload.variant"
            :style="{ width: upload.current_progress + '%' }"></div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>

import { storage, auth, songsCollection } from "@/includes/firebase";
import firebase from "firebase/app";


export default {
  name: "Upload",
  data() {
    return {
      is_dragover: false,
      uploads: [],
      showErrorModal: false,
      errorMessage: "",
    };
  },
  props: ["addSong"],
  methods: {

    removeUpload(upload) {
      if (upload.task && upload.task.cancel) {
        upload.task.cancel();
      }
      const index = this.uploads.indexOf(upload);
      if (index !== -1) {
        this.uploads.splice(index, 1);
      }
    },
    async uploadFile(file) {
      if (file.type !== "audio/mpeg") {
        return;
      }

      if (await this.fileAlreadyUploaded(file)) {
        this.errorMessage = this.$t("manage.fileExist");
        this.showErrorModal = true;

        this.uploads.push({
          task: {},
          current_progress: 100,
          name: file.name,
          variant: "bg-yellow-400",
          icon: "fas fa-exclamation",
          text_class: "text-yellow-400",
        });

        return;
      }

      const storageRef = storage.ref();
      const songsRef = storageRef.child(`songs/${file.name}`);
      const task = songsRef.put(file);

      const uploadIndex = this.uploads.push({
        task,
        current_progress: 0,
        name: file.name,
        variant: "bg-blue-400",
        icon: "fas fa-spinner fa-spin",
        text_class: "",
      }) - 1;

      try {
        await new Promise((resolve, reject) => {
          task.on("state_changed", (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            this.uploads[uploadIndex].current_progress = progress;
          }, reject, resolve);
        });

        const song = {
          uid: auth.currentUser.uid,
          display_name: auth.currentUser.displayName,
          original_name: task.snapshot.ref.name,
          modified_name: task.snapshot.ref.name,
          genre: "",
          comment_count: 0,
          uploadTimestamp: firebase.firestore.Timestamp.fromDate(new Date()),
        };

        song.url = await task.snapshot.ref.getDownloadURL();
        const songRef = await songsCollection.add(song);
        const songSnapshot = await songRef.get();

        this.addSong(songSnapshot);

        this.uploads[uploadIndex].variant = "bg-green-400";
        this.uploads[uploadIndex].icon = "fas fa-check";
        this.uploads[uploadIndex].text_class = "text-green-400";
      } catch (error) {
        this.uploads[uploadIndex].variant = "bg-red-400";
        this.uploads[uploadIndex].icon = "fas fa-times";
        this.uploads[uploadIndex].text_class = "text-red-400";
      }
    },

    async upload($event) {
      this.is_dragover = false;

      const files = $event.dataTransfer
        ? [...$event.dataTransfer.files]
        : [...$event.target.files];

      for (const file of files) {
        await this.uploadFile(file);
      }
      $event.target.value = null;
    },
    cancelUploads() {
      this.uploads.forEach((upload) => {
        upload.task.cancel();
      });
    },

    async fileAlreadyUploaded(file) {
      const querySnapshot = await songsCollection
        .where("uid", "==", auth.currentUser.uid)
        .where("original_name", "==", file.name)
        .get();

      return !querySnapshot.empty;
    },

  },
  beforeUnmount() {
    this.uploads.forEach((upload) => {
      upload.task.cancel();
    });
  },



};
</script>

<style>
.custom-file-upload {
  display: inline-block;
  padding: 8px 16px;
  background-color: #007bff;
  color: #ffffff;
  text-align: center;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  text-decoration: none;
  transition: background-color 0.3s;
  margin-top: 20px;
}

.custom-file-upload:hover {
  background-color: #0056b3;
}

.fixed.inset-0 {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
