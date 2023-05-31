<template>
  <div class="text-white text-center font-bold p-4 mb-4" v-if="login_show_alert" :class="login_alert_variant">
    {{ login_alert_msg }}
  </div>
  <vee-form :validation-schema="loginSchema" @submit="login">
    <!-- Email -->
    <div class="mb-3">
      <label class="inline-block mb-2">{{ $t("login.email") }}</label>
      <vee-field v-model="email" type="email" name="email"
        class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded" />
      <ErrorMessage class="text-red-600" name="email" />
    </div>
    <!-- Password -->
    <div class="mb-3">
      <label class="inline-block mb-2">{{ $t("login.password") }}</label>
      <div class="">
        <vee-field type="password" name="password"
          class="w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded" />
        </div>
        <ErrorMessage class="text-red-600" name="password" />
        <div class="flex justify-end m-3">
          <button v-if="email" @click.prevent="resetPassword" class="text-black-600 hover:text-blue-400">
            {{ $t("login.resetPassword") }}
          </button>
        </div>
        
    </div>

    <button type="submit" :disabled="login_in_submission"
      class="block w-full bg-purple-600 text-white py-1.5 px-3 rounded transition hover:bg-purple-700">
      {{ $t("login.submit") }}
    </button>


  </vee-form>
</template>

<script>
import { auth } from "@/includes/firebase";
export default {
  name: "LoginForm",
  data() {
    return {
      loginSchema: {
        email: "required|email",
        password: "required|min:3|max:32",
      },
      email: "",
      login_in_submission: false,
      login_show_alert: false,
      login_alert_variant: "bg-blue-500",
      login_alert_msg: this.$t('alert.login'),
    };
  },
  methods: {

    async resetPassword() {
      if (this.email) {
        try {
          await auth.sendPasswordResetEmail(this.email);
          this.login_alert_variant = "bg-green-500";
          this.login_alert_msg = this.$t('alert.resetPasswordSuccess');
        } catch (error) {
          this.login_alert_variant = "bg-red-500";
          this.login_alert_msg = this.$t('alert.resetPasswordFail');
        }
        this.login_show_alert = true;
        setTimeout(() => {
          this.login_show_alert = false;
        }, 3000);
      }
    },

    async login(values) {
      this.login_in_submission = true;
      this.login_show_alert = true;
      this.login_alert_variant = "bg-blue-500";
      this.login_alert_msg = this.$t('alert.login');

      try {
        await this.$store.dispatch("login", values);
      } catch (error) {
        this.login_in_submission = false;
        this.login_alert_variant = "bg-red-500";
        this.login_alert_msg = this.$t('alert.invalid');
        setTimeout(() => {
          this.login_show_alert = false;
        }, 3000);
        return;
      }

      this.login_alert_variant = "bg-green-500";
      this.login_alert_msg = this.$t('alert.logged');
      window.location.reload();
    },
  },
};
</script>
