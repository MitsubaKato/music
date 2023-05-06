import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import VeeValidatePlugin from "./includes/validation";
import { auth } from "./includes/firebase";
import "./assets/tailwind.css";
import "./assets/main.css";
import i18n from "./includes/i18n";
import ProgessBar from "./includes/progress-bar";
import "nprogress/nprogress.css";

ProgessBar(router);

let app;

const storedLocale = localStorage.getItem("locale");
if (storedLocale) {
  i18n.locale = storedLocale;
}

auth.onAuthStateChanged(() => {
  if (!app) {
    app = createApp(App).use(i18n);

    app.use(store);
    app.use(router);
    app.use(VeeValidatePlugin);

    app.mount("#app");
  }
});
