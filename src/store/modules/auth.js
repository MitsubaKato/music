import { auth, usersCollection } from "@/includes/firebase";

export default {
  state: {
    authModalShow: false,
    userLoggedIn: false,
  },
  mutations: {
    toggleAuthModal: (state) => {
      state.authModalShow = !state.authModalShow;
    },
    toggleAuth(state) {
      state.userLoggedIn = !state.userLoggedIn;
    },
  },
  actions: {
    async register({ commit }, payload) {
      const userSnapshot = await usersCollection.where('name', '==', payload.name).get();
      if (!userSnapshot.empty) {
        throw new Error('Пользователь с таким именем уже существует');
      }
    
      const userCred = await auth.createUserWithEmailAndPassword(
        payload.email,
        payload.password
      );
    
      await usersCollection.doc(userCred.user.uid).set({
        name: payload.name,
        email: payload.email,
      });
    
      await userCred.user.updateProfile({
        displayName: payload.name,
      });
    
      commit("toggleAuth");
    },

    async resetPassword(_, email) {
      await auth.sendPasswordResetEmail(email);
    },
    
    async login({ commit }, payload) {
      await auth.signInWithEmailAndPassword(payload.email, payload.password);
  
      // Получение URL фотографии из Firestore и обновление photoURL текущего пользователя
      const userDoc = await usersCollection.doc(auth.currentUser.uid).get();
      const userData = userDoc.data();
      await auth.currentUser.updateProfile({ photoURL: userData.photoURL });
  
      commit("toggleAuth");
    },
    init_login({ commit }) {
      const user = auth.currentUser;

      if (user) {
        commit("toggleAuth");
      }
    },
    async signout({ commit }) {
      await auth.signOut();

      commit("toggleAuth");
    },

    
  },
};
