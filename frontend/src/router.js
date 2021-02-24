import Vue from "vue";
import Router from "vue-router";
import Base from "./skelton/Base.vue";
import BaseAuth from "./skelton/BaseAuth.vue";
import Authentication from "./views/Authentication/Authentication.vue";
import ResetPassword from "./views/ResetPassword/ResetPassword.vue";
import Account from "./views/Account/Account.vue";

import Roles from "./views/Roles/Roles.vue";
import Users from "./views/Users/Users.vue";
import Home from "./views/Home/Home.vue";
import Approvals from "./views/Approvals/Approvals.vue";


import Tasks from "./views/Tasks/Tasks.vue";

import Services from "@/services/Services";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/auth",
      name: "Auth",
      component: BaseAuth,
      children: [
        {
          path: "",
          name: "Authentication",
          component: Authentication
        },
        {
          path: "reset-password/",
          name: "Reset",
          component: ResetPassword
        },
        {
          path: "*",
          redirect: {
            name: "Authentication"
          }
        }
      ]
    },
    {
      path: "",
      name: "Base",
      component: Base,
      beforeEnter: Services.auth.isAuthenticated,
      children: [
        {
          path: "account/",
          name: "Account",
          component: Account
        },
        {
          path: "approvals/",
          name: "Approvals",
          component: Approvals
        },
        {
          path: "roles/",
          name: "Roles",
          component: Roles,
          // beforeEnter: Services.auth.isAuthorized,
          meta: {
            type: "roles"
          }
        },
        {
          path: "users/",
          name: "Users",
          component: Users,
          // beforeEnter: Services.auth.isAuthorized,
          meta: {
            type: "users"
          }
        },
        {
          path: "tasks/",
          name: "Tasks",
          component: Tasks,
          // beforeEnter: Services.auth.isAuthorized,
          meta: {
            type: "tasks"
          }
        },
        {
          path: "home/",
          name: "Home",
          component: Home,
          // beforeEnter: Services.auth.isAuthorized,
          meta: {
            type: "home"
          }
        },
        {
          path: "*",
          redirect: {
            name: "Account"
          }
        }
      ]
    }
  ]
});
