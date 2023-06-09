import { createRouter, createWebHistory } from 'vue-router';
import store from '@/store';

const Home = () => import('@/views/Home.vue');
const Manage = () => import(/* webpackChunkName: "groupedChunk" */'@/views/Manage.vue');
const Song = () => import(/* webpackChunkName: "groupedChunk" */'@/views/Song.vue');
const NotFound = () => import('@/views/NotFound.vue');
const Profile = () => import('@/views/Profile.vue'); 
const UserProfile = () => import('@/views/UserProfile.vue'); 


const routes = [
  {
    name: 'home',
    path: '/', // example.com/
    component: Home,
  },
  {
    name: 'manage',
    // alias: '/manage',
    path: '/manage-music',
    meta: {
      requiresAuth: true,
    },
    component: Manage,
    beforeEnter: (to, from, next) => {
      next();
    },
  },
  {
    name: 'profile', 
    path: '/profile',
    meta: {
      requiresAuth: true,
    },
    component: Profile,
  },
  {
    path: '/user/:id',
    name: 'UserProfile',
    component: UserProfile,
    props: true
  },
  {
    path: '/manage',
    redirect: { name: 'manage' },
  },
  {
    name: 'song',
    path: '/song/:id',
    component: Song,
  },
  {
    path: '/:catchAll(.*)*',
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  linkExactActiveClass: 'text-yellow-500',
});

router.beforeEach((to, from, next) => {
  if (!to.matched.some((record) => record.meta.requiresAuth)) {
    next();
    return;
  }

  if (store.state.auth.userLoggedIn) {
    next();
  } else {
    next({ name: 'home' });
  }
});

export default router;
