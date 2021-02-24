import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import Services from "@/services/Services.vue";
import axios from "axios";
import VueTour from "vue-tour";

import Antd from "ant-design-vue";
import "ant-design-vue/dist/antd.less";
import "@/assets/css/bootstrap-utilities.css";
import "@/assets/css/styles.css";
import "vue-swatches/dist/vue-swatches.min.css";
import Swatches from "vue-swatches";
import { LMap, LTileLayer, LMarker, LGeoJson, LControlZoom } from 'vue2-leaflet';
// Import the styles too, globally
import 'leaflet/dist/leaflet.css';
import "vue-swatches/dist/vue-swatches.min.css";

const pluginOptions = {
  /* see config reference */
  globalOptions: { currency: "USD" }
};

Vue.use(Antd);
Vue.use(VueTour);
Vue.component("Swatches", Swatches);
Vue.component('l-map', LMap);
Vue.component('l-tile-layer', LTileLayer);
Vue.component('l-marker', LMarker);
Vue.component('l-geo-json', LGeoJson);
Vue.component('l-control-zoom', LControlZoom);

Vue.prototype.$Services = Services;

Vue.config.productionTip = false;
var nonAUthRoutes = ["signup/", "https://api.unsplash.com/search/photos/", "auth/local/","auth/forgot-password/","auth/reset-password/"];
axios.interceptors.request.use(
  config => {
    console.log(!nonAUthRoutes.map(path => config.url.endsWith(path)).includes(true))
    // if (config.url.endsWith("/api/api-token-auth/") === false) {
    //   try {
    //     let impersonate = localStorage.getItem("impersonate");
    //     if (impersonate) config.params["impersonate"] = impersonate;
    //   } catch (er) {}
    // }

    if (
      !nonAUthRoutes.map(path => config.url.endsWith(path)).includes(true)
    ) {
      console.log('adding token to headers', `JWT ${localStorage.getItem("Token")}`)
      // eslint-disable-next-line
      config.headers.Authorization =
        `Bearer ${localStorage.getItem("Token")}` || "";
    }
    return config;
  },
  error => Promise.reject(error)
);

axios.interceptors.response.use(null, error => {
  if (error.config && error.response && error.response.status === 401) {
    localStorage.clear();
    window.location.href = "/login/";
  }

  return Promise.reject(error);
});

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
