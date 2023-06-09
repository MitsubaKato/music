<template>
   <!-- Header -->
   <header id="header" class="bg-gray-900">
    <nav class="container mx-auto flex justify-start items-center py-5 px-4">
      <!-- App Name -->
      <router-link class="text-white font-bold text-2xl mr-4" :to="{ name: 'home' }" exact-active-class="no-active">
        Music
      </router-link>

      <div class="flex flex-grow justify-end">
        <!-- Primary Navigation -->
        <ul class="flex flex-row mt-1 ml-auto">
          <!-- Navigation Links -->
          <li v-if="!userLoggedIn">
            <a class="px-2 text-white font-medium" href="#" @click.prevent="toggleAuthModal">
              {{ $t("header.log-reg") }}
            </a>
          </li>
          <template v-else>
            <!-- Profile Link -->

            <li>
              <router-link class="px-2 text-white font-medium" :to="{ name: 'profile' }">
                {{ $t("profile.header") }}
              </router-link>
            </li>

            <li>
              <router-link class="px-2 text-white font-medium" :to="{ name: 'manage' }">
                {{ $t("header.manage") }}
              </router-link>
            </li>

            <li>
              <a class="px-2 text-white font-medium" href="#" @click.prevent="signout">{{
                $t("header.logout")
              }}</a>
            </li>
          </template>
        </ul>
        <ul class="flex flex-row mt-1 ml-auto">
          <li>
            <a class="px-2 text-white inline-flex items-center justify-center font-medium" href="#" @click.prevent="changeLocale">
              <img :src="flagUrl" width="24" class="mr-3">
              {{ currentLocale }}
            </a>
          </li>
        </ul>
      </div>
    </nav>
  </header>
</template>

<script>

import { mapMutations, mapState } from "vuex";

export default {
  name: "Header",
  data() {
    return {

    }
  },
  computed: {
    ...mapState({
      userLoggedIn: (state) => state.auth.userLoggedIn,
    }),
    currentLocale() {
      return this.$i18n.locale === "ua" ? "Українська" : "English";
    },
    flagUrl() {
      return `https://hatscripts.github.io/circle-flags/flags/${this.$i18n.locale}.svg`;
    },
  },
  methods: {
    ...mapMutations(["toggleAuthModal"]),
    signout() {
      this.$store.dispatch("signout", {
        router: this.$router,
        route: this.$route,
      });

      if (this.$route.meta.requiresAuth) {
        this.$router.push({ name: "home" });
      }
    },
    changeLocale() {
      this.$i18n.locale = this.$i18n.locale === "ua" ? "us" : "ua";
      localStorage.setItem("locale", this.$i18n.locale);
    },
  },
};
</script>
