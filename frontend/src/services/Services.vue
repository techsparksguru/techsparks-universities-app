<script>
import Vue from "vue";
import axios from "axios";
import { notification } from "ant-design-vue";
import config from "../config";

/* eslint class-methods-use-this: "error" */
class REST {
  pageSize = 20;
  API_URL = config.API_URL;

  // eslint-disable-next-line
  get token() {
    return localStorage.getItem("Token");
  }

  // eslint-disable-next-line
  get token_title() {
    return "Bearer";
  }

  list({ resource = null, params = {}, page = 1, page_size = null }) {
    let parameters = params;
    parameters.limit = page_size === null ? this.pageSize : page_size;
    let limit = parameters.limit;

    parameters._start = (page - 1) * limit;
    delete parameters.start;
    parameters._limit = limit;
    delete parameters.limit;

    let resourceUrl = resource;
    if (resourceUrl === null) {
      resourceUrl = this.api;
    }
    return axios.get(resourceUrl, {
      params
    });
  }

  download({ resource = null, params = {}, pageSize = null }) {
    const parameters = params;
    let resourceUrl = resource;
    if (resourceUrl === null) {
      resourceUrl = this.api;
    }
    parameters.limit = pageSize === null ? this.pageSize : pageSize;
    return axios.get(resourceUrl, {
      params: parameters
    });
  }

  retrive({ resource = null, params = {}, page = 1, page_size = null }) {
    let parameters = params;
    parameters.limit = page_size === null ? this.pageSize : page_size;
    let limit = parameters.limit;

    parameters._start = (page - 1) * limit;
    delete parameters.start;
    parameters._limit = limit;
    delete parameters.limit;

    let promises = [
      axios.get(resource, {
        params: parameters
      }),
      axios.get(resource + "count/", {
        params: parameters
      })
    ];
    return Promise.all(promises).then(([resultsData, countData]) => ({
      data: { results: resultsData.data, count: countData.data }
    }));
    // return axios.get(resourceUrl, {
    //   params: {
    //     _limit: parameters.limit,
    //     _start: (page-1)*parameters.limit
    //   }
    // });
  }

  create({ resource = null, params = {}, data = {} }) {
    const parameters = params;
    let resourceUrl = resource;
    if (resourceUrl === null) {
      resourceUrl = this.api;
    }
    return axios({
      method: "post",
      url: resourceUrl,
      data,
      params: parameters
    });
  }

  update({ resource = null, params = {}, data = {} }) {
    const parameters = params;
    let resourceUrl = resource;
    if (resourceUrl === null) {
      resourceUrl = this.api;
    }
    return axios({
      method: "put",
      url: resourceUrl,
      data,
      params: parameters
    });
  }

  patch({ resource = null, params = {}, data = {} }) {
    const parameters = params;
    let resourceUrl = resource;
    if (resourceUrl === null) {
      resourceUrl = this.api;
    }
    return axios({
      method: "patch",
      url: resourceUrl,
      data,
      params: parameters
    });
  }

  destroy({ resource = null, params = {} }) {
    const parameters = params;
    let resourceUrl = resource;
    if (resourceUrl === null) {
      resourceUrl = this.api;
    }
    return axios({
      method: "delete",
      url: resourceUrl,
      params: parameters
    });
  }
}

// Authentication
class Authentication {
  // To set the token in localstorage
  API_URL = config.API_URL;
  noty = new Noty();
  setToken = token => {
    localStorage.setItem("Token", token);
  };

  getToken = () => localStorage.getItem("Token") || "";

  getCurrentUser = () => localStorage.getItem("profile") || {};

  // To remove the token from localstorage
  removeLocalStorage = () => {
    localStorage.clear();
  };

  // To check user is authenticated
  // To validate the token
  isAuthenticated = (to, from, next) => {
    if (localStorage.getItem("Token")) {
      next();
    } else {
      window.location.href = "/auth/";
    }
  };

  // To signup using email & password
  signup(payload) {
    delete payload.captcha;
    payload.email = payload.email.toLowerCase();
    localStorage.setItem("API_DOMAIN", this.API_URL);
    return axios.post(`${this.API_URL}signup/`, payload);
  }

  // To login using email & password
  login(email, password, captcha) {
    email = email.toLowerCase();
    localStorage.setItem("API_DOMAIN", this.API_URL);
    // Validate creds
    const creds = {
      identifier: email,
      password,
      captcha
    };
    return axios.post(`${this.API_URL}auth/local/`, creds);
  }

  // To remove the token from server & localstorage
  logout() {
    let keys = Object.keys(localStorage);
    console.log(keys);
    let local_keys = [
      "API_DOMAIN",
      "Token",
      "loglevel:webpack-dev-server",
      "profile"
    ];
    for (let i in local_keys) {
      localStorage.removeItem(local_keys[i]);
      console.log(i, "key");
    }
  }

  // send reset password link
  forgotPassword(email, captcha) {
    email = email.toLowerCase();
    return axios({
      method: "post",
      url: `${this.API_URL}auth/forgot-password/`,
      data: {
        email
      }
    });
  }

  // Check reset password link
  checkResetPasswordLink(id) {
    return axios({
      method: "post",
      url: `${this.API_URL}check-password/${id}/`
    });
  }

  // Check & Reset Password
  ResetPassword(id, password) {
    return axios({
      method: "post",
      url: `${this.API_URL}auth/reset-password/`,
      data: {
        code:id,
        password,
        passwordConfirmation:password
      }
    });
  }
}

// Profile
class Profile extends REST {
  api = `${this.API_URL}profile/`;
  changePassword(data) {
    return axios({
      method: "put",
      url: `${this.API_URL}/change-password/`,
      data
    });
  }

  changeProfile(data) {
    return axios({
      method: "post",
      url: `${this.API_URL}/change-password/`,
      data
    });
  }

  list() {
    return axios.get(this.api, {});
  }
}

// Assets
class Assets extends REST {
  api = `${this.API_URL}upload/`;
  getHeaders() {
    let token = localStorage.getItem("Token");
    return {
      Authorization: `JWT ${token}` || ""
    };
  }
}

// Messages
class Messages extends REST {
  api = `${this.API_URL}messages/`;
}

// Roles
class Roles extends REST {
  api = `${this.API_URL}users-permissions/roles/`;
}

// Users
class Users extends REST {
  api = `${this.API_URL}users/`;
}

// User accesses
class UserAccesses extends REST {
  api = `${this.API_URL}universitiesaccesses/`;
}

// Tasks
class Tasks extends REST {
  api = `${this.API_URL}tasks/`;
}

// Accounts
class Accounts extends REST {
  api = `${this.API_URL}accounts/`;
}

// Universities
class Universities extends REST {
  api = `${this.API_URL}universities/`;
}

// Noty
class Noty {
  // eslint-disable-next-line
  success(message, title = "Success") {
    notification.success({
      message: title,
      description: message
    });
  }
  // eslint-disable-next-line
  warning(message, title = "Warning") {
    notification.warning({
      message: title,
      description: message
    });
  }
  // eslint-disable-next-line
  errorBackUp(message, title = "Attention Required") {
    notification.error({
      message: title,
      description: message
    });
  }
  // eslint-disable-next-line
  error(
    error,
    customMessage = "Something went wrong",
    title = "Attention Required"
  ) {
    let { status, data = {}, message = "" } = error.response || {};
    if (status === 402) {
      message = "Resource limit exceeded, Please contact your administrator";
    } else {
      let allErrors = Object.values(data);
      message = Array.isArray(allErrors[0])
        ? allErrors[0][0]
        : allErrors[0] || customMessage;
    }
    if (message.length)
      notification.error({
        message: title,
        description: message
      });
  }
  // eslint-disable-next-line
  info(message, title = "Info") {
    notification.info({
      message: title,
      description: message
    });
  }
}

export default {
  REST,
  API_URL: config.API_URL,
  profile: new Profile(),
  auth: new Authentication(),
  noty: new Noty(),
  assets: new Assets(),
  messages: new Messages(),
  accounts: new Accounts(),
  roles: new Roles(),
  tasks: new Tasks(),
  users: new Users(),
  userAccesses: new UserAccesses(),
  universities: new Universities()
};
</script>
