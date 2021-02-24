<template>
  <div ref="app" id="app">
    <div class="impersonate" v-if="impersonate">
      You're viewing this as user {{ impersonate }}
      <a-icon
        type="close"
        style="float:right;cursor: pointer;"
        @click="closeImpersonate"
      />
    </div>
    <a-layout
      v-if="renderComponent"
      id="components-layout-demo-side"
      style="height: 100vh"
    >
      <a-layout-sider width="220" v-model="collapsed">
        <div
          v-on:click="$router.push('/home/')"
          class="logo"
          :class="sideTheme === 'dark' ? 'dark-logo' : 'light-logo'"
          style="display: flex;align-items: center;cursor:pointer;height:50px"
        >
          <img
            style="height:32px;display:inline;z-index:999"
            src="../assets/r_i_logo_w.svg"
            alt="Universities app"
          />
          <span
            :class="'ant-btn-link'"
            v-show="!collapsed"
            style="background:#ffff;font-weight:bold;z-index:999;padding-left:8px;font-size:18px;overflow: hidden;text-overflow: ellipsis;min-width:14px;white-space: nowrap;"
          >
            Universities
            <span style="font-weight:50">App</span>
          </span>
        </div>
        <v-tour
          v-if="mtour"
          name="myTour"
          :steps="steps"
          :options="{ highlight: true }"
          :callbacks="myCallbacks"
        ></v-tour>
        <a-menu
          :theme="sideTheme"
          :defaultSelectedKeys="[$route.name]"
          mode="inline"
          :style="{ height: '99%' }"
          style="overflow-y:auto"
        >
          <a-menu-item
            v-if="['admin','readonly'].includes(profile.role.type)"
            key="Home"
            id="v-step-0"
            v-on:click="$router.push('/home/')"
          >
            <a-icon type="home" style="font-size: 20px" />
            <span>Home</span>
          </a-menu-item>

          <a-menu-item
            v-if="['admin','readonly'].includes(profile.role.type)"
            key="Users"
            v-on:click="$router.push('/users/')"
          >
            <a-icon type="team" style="font-size: 20px" />
            <span>Users</span>
          </a-menu-item>
          <a-menu-item
            key="Approvals"
            v-if="['admin','readonly'].includes(profile.role.type)"
            v-on:click="$router.push('/approvals/')"
          >
            <a-icon type="check-square" style="font-size: 20px" />
            <span>Approvals</span>
          </a-menu-item>
          <a-menu-item key="Tasks" v-on:click="$router.push('/tasks/')">
            <a-icon type="schedule" style="font-size: 20px" />
            <span>Tasks</span>
          </a-menu-item>
          <a-menu-item key="Account" v-on:click="$router.push('/account/')">
            <a-icon type="bank" style="font-size: 20px" />
            <span>Account</span>
          </a-menu-item>
        </a-menu>
      </a-layout-sider>
      <!-- content body -->
      <a-layout>
        <a-layout-header
          :class="collapsed ? 'collapsed-header' : 'normal-header'"
          style="background:#ffff;z-index:22;right:0;position:fixed;width:100%;padding: 0px 20px;line-height: 50px!important;height: auto!important;border-bottom: 1px solid #ddd;"
        >
          <div
            style="transition:all 0.3s;"
            class="d-flex hd justify-content-between"
          >
            <div class>
              <a-icon
                class="trigger"
                :type="collapsed ? 'menu-unfold' : 'menu-fold'"
                @click="() => (collapsed = !collapsed)"
              />
              <a-breadcrumb style="margin: 16px 0 16px 8px;display:inline;">
                <a-breadcrumb-item>Home</a-breadcrumb-item>
                <a-breadcrumb-item v-if="$route.name != 'Home'">{{
                  $route.name
                }}</a-breadcrumb-item>
              </a-breadcrumb>
            </div>
            <div>
              <a-dropdown
                style="float: right;cursor: pointer;margin-left:10px;"
              >
                <span>
                  <span v-if="profile">
                    <a-avatar
                      v-if="profile.picture"
                      :src="
                        config.API_URL.slice(0, config.API_URL.length - 1) +
                          profile.picture.url
                      "
                    ></a-avatar>
                    <a-avatar
                      v-else
                      :style="{
                        backgroundColor: profile.default_color || '#fde3cf'
                      }"
                      style="color: #fff;font-size:14px;cursor: pointer;margin-right:2px;height:28px;width:28px;line-height:28px"
                      >{{ profile.username[0] }}</a-avatar
                    >
                    {{ profile.username }}
                  </span>
                  <span v-if="!profile">Loading...</span>
                  <a-icon type="down" />
                </span>
                <a-menu slot="overlay">
                  <a-menu-item v-on:click="logout">
                    <span>
                      <a-icon
                        type="logout"
                        style="color:red;margin-right:10px;cursor: pointer;"
                      />Logout
                    </span>
                  </a-menu-item>
                </a-menu>
              </a-dropdown>
              <span
                style="float: right;cursor: pointer;margin-left:10px;font-size: 20px;cursor: pointer;"
              >
                <a-icon
                  :type="fullscreen ? 'fullscreen-exit' : 'fullscreen'"
                  v-on:click="toggleFullscreen()"
                />
              </span>
              <a-tooltip
                :placement="'bottom'"
                v-if="false"
                title="Report issue"
              >
                <span
                  @click="openReportmodal"
                  v-if="profile.is_admin || allowed_pagekeys['Report Issues']"
                  style="font-size:27px;cursor:pointer"
                >
                  <span class="icon-errorred"></span>
                </span>
              </a-tooltip>
              <a-modal
                title="Report issue"
                centered
                width="70vw"
                v-model="rvisible"
                @ok="report"
              >
                <a-form-item
                  label="Title"
                  :labelCol="{ span: 24 }"
                  :wrapperCol="{ span: 24 }"
                  :validate-status="errors.title ? 'error' : 'success'"
                  :help="errors.title"
                >
                  <a-input
                    placeholder="Title of the issue"
                    v-model="payload.title"
                  />
                </a-form-item>
                <a-form-item
                  label="Description"
                  :labelCol="{ span: 24 }"
                  :wrapperCol="{ span: 24 }"
                  :validate-status="errors.description ? 'error' : 'success'"
                  :help="errors.description"
                >
                  <a-textarea
                    placeholder="Detailed description of the issue"
                    v-model="payload.description"
                  />
                </a-form-item>
                <img style="width:50%;height:auto" :src="payload.output" alt />
              </a-modal>

              <span
                class="mr-3"
                style="float: right;cursor: pointer;margin-left:10px;font-size: 20px;cursor: pointer;"
                @click="themeDrawer = true"
              >
                <a-icon type="bg-colors" />
              </span>
            </div>
          </div>
        </a-layout-header>
        <a-layout-content
          style=" z-index:2;background: #f0f2f4;padding: 55px 0px 0px 30px;"
        >
          <router-view />
        </a-layout-content>
        <a-layout-footer style="text-align: center" class="py-1"
          >{{ config.APP_NAME }} © {{ config.FOOTER_TEXT }}</a-layout-footer
        >
      </a-layout>
      <a-drawer
        title="Change Theme"
        placement="right"
        :closable="false"
        @close="() => (themeDrawer = false)"
        :visible="themeDrawer"
      >
        <div :style="{ marginBottom: '24px' }">
          <h4 class="setting-drawer-index-title">Sidebar Theme</h4>

          <div class="setting-drawer-index-blockChecbox">
            <a-tooltip>
              <template slot="title"
                >Dark theme</template
              >
              <div
                class="setting-drawer-index-item"
                @click="sideTheme = 'dark'"
              >
                <img
                  src="https://gw.alipayobjects.com/zos/rmsportal/LCkqqYNmvBEbokSDscrm.svg"
                  alt="dark"
                />
                <div
                  class="setting-drawer-index-selectIcon"
                  v-if="sideTheme === 'dark'"
                >
                  <a-icon type="check" />
                </div>
              </div>
            </a-tooltip>

            <a-tooltip>
              <template slot="title"
                >Light theme</template
              >
              <div
                class="setting-drawer-index-item"
                @click="sideTheme = 'light'"
              >
                <img
                  src="https://gw.alipayobjects.com/zos/rmsportal/jpRkZQMyYRryryPNtyIC.svg"
                  alt="light"
                />
                <div
                  class="setting-drawer-index-selectIcon"
                  v-if="sideTheme !== 'dark'"
                >
                  <a-icon type="check" />
                </div>
              </div>
            </a-tooltip>
          </div>
        </div>
        <div :style="{ marginBottom: '24px' }">
          <h3 class="setting-drawer-index-title">Theme color</h3>

          <div style="height: 20px">
            <a-tooltip
              class="setting-drawer-theme-color-colorBlock mb-1"
              v-for="(item, index) in colorList"
              :key="index"
            >
              <!-- <template slot="title">
                {{ item.key }}
              </template>-->
              <a-tag :color="item.color" @click="changeColor(item.color)">
                <a-icon
                  type="check"
                  style="margin-left: -5px;margin-top:2px"
                  v-if="item.color === primaryColor"
                ></a-icon>
              </a-tag>
            </a-tooltip>
          </div>
        </div>
      </a-drawer>
    </a-layout>
  </div>
</template>
<script>
import router from "@/router";
import moment from "moment";
import config from "../config";
import { updateTheme, updateColorWeak, colorList } from "./settingConfig";
import less from "less";
export default {
  data() {
    return {
      config,
      settings: null,
      mtour: false,
      myCallbacks: {
        onSkip: this.skipTour,
        onFinish: this.finishTour
      },
      steps: [
        {
          target: "#v-step-0",
          content: `Discover <strong>Pin Job Portal Tour</strong>!`,
          params: { placement: "right" }
        },
        {
          target: "#v-step-1",
          content: `Create Client Here`,
          params: { placement: "right" }
        },
        {
          target: "#v-step-2",
          content: "Create New Role/ Update Roles here",
          params: { placement: "right" }
        },
        {
          target: "#v-step-3",
          content: "Create New User/ Update Users here",
          params: { placement: "right" }
        },
        {
          target: "#v-step-4",
          content: "Create New Job Order/ Update Job Order here",
          params: { placement: "right" }
        }
      ],
      rvisible: false,
      sideTheme: localStorage.getItem("sideTheme") || "light",
      colorList,
      primaryColor: localStorage.getItem("primaryColor") || "#1890FF",
      payload: {
        output: null,
        title: null,
        description: null
      },
      themeDrawer: false,
      errors: {},
      fullscreen: false,
      profile: false,
      collapse_option: false,
      renderComponent: true,
      options: ["list", "of", "options"],
      collapsed: true,
      permission: false,
      userRoles: [],
      userRole: null,
      clients: [],
      selectedClient: null,
      allowedPages: [],
      allowed_pagekeys: {},
      selectedUserRole: null,
      changeClientInfo: null,
      disablechangeClient: false,
      impersonate: null,
      impersonate_admin: false
    };
  },
  mounted: function() {
    if (this.myTour) {
      this.$tours["myTour"].start();
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        const presentRoute = route.name;
        const disableRoutes = ["Clients", "Roles", "Users", "Account"];
        if (disableRoutes.includes(presentRoute)) {
          this.disablechangeClient = true;
          this.changeClientInfo = `${presentRoute} does not need client selection`;
        } else {
          this.disablechangeClient = false;
          this.changeClientInfo = `Filter ${presentRoute} by Client`;
        }
      },
      deep: true,
      immediate: true
    },
    sideTheme(val) {
      localStorage.setItem("sideTheme", val);
    },
    primaryColor(val) {
      localStorage.setItem("primaryColor", val);
    }
  },

  async created() {
    this.changeColor(this.primaryColor);
    // this.getProfile();
    this.profile = JSON.parse(localStorage.getItem("profile")) || {};
  },
  methods: {
    moment,
    changeColor(color) {
      updateTheme(color);
      this.primaryColor = color;
    },
    async openReportmodal() {
      console.log("opening");
      const el = document.getElementById("app");
      console.log(el);
      const options = {
        type: "dataURL"
      };
      this.$html2canvas(el, options)
        .then(d => {
          this.payload.output = d;
          this.rvisible = true;
        })
        .catch(e => console.log(e));
    },
    report() {},
    forceRender() {
      console.log("rendering again");
      this.renderComponent = false;
      this.$nextTick(() => {
        this.renderComponent = true;
      });
    },
    fetchClients(params = {}) {
      console.log("params:", params);
      let og_params = {};
      return this.$Services.companies
        .retrive({
          resource: `${this.$Services.companies.api}`,
          page: 1,
          page_size: 10000,
          params: og_params
        })
        .then(({ data }) => {
          this.clients = data.results;
          this.$Services.mutations.setClientsDict(this.clients);
        })
        .catch(err => {
          console.log(err);
        });
    },
    fetchContacts(params = {}) {
      console.log("params:", params);
      let og_params = {};
      this.$Services.users
        .retrive({
          resource: `${this.$Services.users.api}`,
          page_size: 10000,
          params: og_params
        })
        .then(({ data }) => {
          this.$Services.mutations.setUsersDict(data.results);
        })
        .catch(err => {
          console.log(err);
          this.loading = false;
        });
    },
    skipTour() {
      this.mtour = false;
      console.log("Skip Tour---------");
    },
    finishTour() {
      this.mtour = false;
      console.log("Finish Tour---------------");
    },
    async clientChangedAsAdmin(id, initialLoad) {
      localStorage.setItem("selectedClient", this.selectedClient);
      if (Object.keys(this.$router.currentRoute.params).length) {
        const parent = this.$router.currentRoute.meta.type;
        this.$router.push(`/${parent}/`);
      } else this.forceRender();
    },
    async clientChanged(id, initialLoad) {
      try {
        if (initialLoad && this.selectedUserRole) {
          const { data } = await this.fetchUserRole();
          this.userRole = data;
        } else {
          this.userRole = id
            ? this.userRoles.filter(a => a.id === id).pop()
            : this.userRoles[0];
          this.selectedUserRole = this.userRole.id;
        }
        if (this.userRole)
          localStorage.setItem("userRole", JSON.stringify(this.userRole));

        if (this.selectedUserRole) {
          const { data } = await this.fetchallowedPages();
          this.allowedPages = data.pages;
        }
        if (this.allowedPages)
          localStorage.setItem(
            "allowedPages",
            JSON.stringify(this.allowedPages)
          );
        this.allowed_pagekeys = this.allowedPages.reduce((obj, item) => {
          obj[item.page.name] = item.can_read;
          return obj;
        }, {});
        if (initialLoad != true) {
          if (Object.keys(this.$router.currentRoute.params).length) {
            const parent = this.$router.currentRoute.meta.type;
            this.$router.push(`/${parent}/`);
          } else this.forceRender();
        }
      } catch (err) {
        console.log(err);
      }
    },
    closeImpersonate() {
      localStorage.removeItem("impersonate");
      localStorage.removeItem("impersonate_admin");
      location.reload();
    },
    fetchallowedPages(params = {}) {
      const user = this.profile;
      return this.$Services.roles.retrive({
        resource: this.$Services.roles.api + this.userRole.role.id + "/"
      });
    },
    fetchUserRoles(params = {}) {
      const user = this.profile;
      return this.$Services.userRoles
        .retrive({
          resource: this.$Services.userRoles.api,
          page_size: 10000,
          params: {
            search: user.id
          }
        })
        .then(({ data }) => {
          const pagination = {
            ...this.pagination
          };
          // Read total count from server
          pagination.total = data.count;
          this.loading = false;
          this.userRoles = data.results;
          this.pagination = pagination;
        })
        .catch(err => {
          console.log(err);
          this.loading = false;
        });
    },
    fetchUserRole(params = {}) {
      return this.$Services.userRoles.retrive({
        resource: this.$Services.userRoles.api + this.selectedUserRole + "/"
      });
    },
    logout() {
      this.$Services.noty.success("Logging out...", "Logout");
      this.$Services.auth.logout();
      router.push({
        path: "/auth/"
      });
    },
    enterFullscreen() {
      var elem = document.documentElement;
      /* View in fullscreen */
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        /* Firefox */
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) {
        /* Chrome, Safari and Opera */
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        /* IE/Edge */
        elem.msRequestFullscreen();
      }
    },
    exitFullscreen() {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        /* Firefox */
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        /* Chrome, Safari and Opera */
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        /* IE/Edge */
        document.msExitFullscreen();
      }
    },
    toggleFullscreen() {
      if (!this.fullscreen) {
        this.fullscreen = true;
        this.enterFullscreen();
      } else {
        this.fullscreen = false;
        this.exitFullscreen();
      }
    }
  }
};
</script>

<style>
.impersonate {
  position: absolute;
  top: 0;
  left: 32%;
  z-index: 9999;
  width: 500px;
  text-align: center;
  background: orange;
  color: #fdfdfd;
  padding: 8px;
  margin: auto;
  font-weight: bold;
  font-size: 15px;
}
#components-layout-demo-side .logo {
  /* color: #fff; */
  font-size: 24px;
  padding: 8px;
  padding-left: 25px;
}

#components-layout-demo-side .light-logo {
  background: #fff;
  -webkit-box-shadow: 1px 1px 0 0 #e8e8e8;
  box-shadow: 1px 1px 0 0 #e8e8e8;
}
.ant-layout-sider {
  box-shadow: 1px 2px 4px #000033;
}
/deep/ .ant-layout-sider::-webkit-scrollbar-thumb,
/deep/ .ant-layout-sider-children::-webkit-scrollbar-thumb {
  background: #3f4d67;
  border-radius: 8px;
}
/deep/ .ant-layout-sider-children {
  z-index: 999;
  /* display: block;
  -webkit-transition: all 0.3s ease-in-out;
  transition: all 0.3s ease-in-out;
  -webkit-box-shadow: 1px 0 20px 0 #3f4d67;
  box-shadow: 1px 0 20px 0 #3f4d67; */
  width: 264px;
  height: 95vh;
  top: 0;
  background-color: transparent !important;
  /* color: #a9b7d0; */
}
.ant-menu-dark {
  /* background-color: #3f4d67 !important; */
}
.ant-menu.ant-menu-dark .ant-menu-item-selected {
  /* background-color: #333f54 !important; */
}
.ant-menu.ant-menu-dark .ant-menu-item-selected:after {
  content: "";
  /* background-color: #1dc4e9; */
  position: absolute;
  left: 0;
  top: 0px;
  width: 3px;
  box-shadow: 2px 1px 0px 4px #d3d3d3;
}
.dark-logo {
  background-color: #002140;
}
.collapsed-header > .hd {
  padding-left: 80px;
}
.normal-header > .hd {
  padding-left: 220px;
}
.ant-menu-inline .ant-menu-item,
.ant-menu-inline .ant-menu-submenu-title {
  height: 44px;
}

.content-body {
  height: calc(100vh - 55px);
  overflow-y: auto;
}
.content-body::-webkit-scrollbar {
  width: 8px;
}
.content-body::-webkit-scrollbar-track {
  box-shadow: inset 0 0 4px #808080;
}
.content-body::-webkit-scrollbar-thumb {
  background: #3f4d67;
  border-radius: 8px;
}
.content-body::-webkit-scrollbar-thumb:hover {
  background: #002140;
}
.setting-drawer-index-blockChecbox {
  display: flex;
}
.setting-drawer-index-blockChecbox .setting-drawer-index-item {
  margin-right: 16px;
  position: relative;
  border-radius: 4px;
  cursor: pointer;
}
.setting-drawer-index-blockChecbox .setting-drawer-index-item img {
  width: 48px;
}
.ant-menu-light {
  font-size: 1.2rem;
}
.setting-drawer-index-blockChecbox
  .setting-drawer-index-item
  .setting-drawer-index-selectIcon {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  padding-top: 2px;
  padding-left: 14px;
  height: 100%;
  color: #1890ff;
  font-size: 1.5rem;
  font-weight: 700;
}
.setting-drawer-theme-color-colorBlock {
  width: 20px;
  height: 20px !important;
  border-radius: 2px;
  float: left;
  cursor: pointer;
  margin-right: 8px;
  padding-left: 0px;
  padding-right: 0px;
  text-align: center;
  color: #fff;
  font-weight: 700;
}
.setting-drawer-theme-color-colorBlock i {
  font-size: 14px;
}
.setting-drawer-index-handle {
  position: absolute;
  top: 240px;
  background: #1890ff;
  width: 48px;
  height: 48px;
  right: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  pointer-events: auto;
  z-index: 1001;
  text-align: center;
  font-size: 16px;
  border-radius: 4px 0 0 4px;
}
.setting-drawer-index-handle i {
  color: #ffffff;
  font-size: 20px;
}
.v-step {
  background-color: #50596c;
  position: relative;
  margin-left: 0.2rem;
  color: #fff;
  max-width: 450px;
  border-radius: 3px;
  margin-top: 0rem;
  padding: 1rem;
  text-align: center;
  z-index: 10000;
}
.v-step__button {
  background-color: #50596c;
  color: #fff;
}
.v-step__arrow {
  width: 0;
  height: 0;
  border-style: solid;
  position: absolute;
  margin: 0rem;
  border-color: #50596c;
  border-width: 0 0.5rem 0.5rem 0.5rem;
  border-left-color: transparent;
  border-right-color: transparent;
  border-top-color: transparent;
  left: -0.5rem;
  margin-top: 0;
  margin-bottom: 0;
}
.v-tour__target--highlighted {
  box-shadow: 0 0 0 99999px rgba(0, 0, 0, 0.4);
  border-block-color: #50596c;
  border-color: #000000;
}
</style>
