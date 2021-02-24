import universities from "@/assets/universities.json";
import states from "@/assets/states.json";
import districts from "@/assets/districts.json";
import { latLng, latLngBounds, geoJSON, Browser } from "leaflet";

const columns = [
  {
    title: "First Name",
    dataIndex: "first_name",
    key: "first_name",
    // sorter: true,
    //fixed: "left",
    width: 150,
  },
  {
    title: "Last Name",
    dataIndex: "last_name",
    key: "last_name",
    // sorter: true,
    width: 150,
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
    // sorter: true,
    width: 250,
  },
  {
    title: "Created",
    dataIndex: "created_on",
    key: "created_on",
    // sorter: true,
    width: 150,
    scopedSlots: {
      customRender: "created",
    },
  },
  {
    title: "Role",
    dataIndex: "role.name",
    key: "role.name",
    width: 150,
    scopedSlots: {
      customRender: "role",
    },
  },
  {
    title: "Actions",
    dataIndex: "action",
    width: 100,
    scopedSlots: {
      customRender: "actions",
    },
    fixed: "right",
  },
];
import moment from "moment";
export default {
  name: "Users",
  data() {
    return {
      profile:false,
      map_type: 'state',
      states,
      districts,
      saving_user:false,
      allstates: [],
      zoom: 4,
      center: latLng(22.15, 79.081),
      fillColor: "#e4ce7f",
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      mapOptions: {
        minZoom: 4,
        maxZoom: 7,
        maxBounds: latLngBounds(
          latLng(23.63936, 68.14712),
          latLng(28.20453, 97.34466)
        ),
        maxBoundsViscosity: 1.0,
      },
      theme: {
        StateBorderColor: "#afbbe0",
        StateFillColor: "#e4e9f2",
        StateBorderWidth: "2",
        hoveredStateBorderColor: "#3366ff",
        hoveredStateFillColor: "#c9d6ef",
        hoveredStateBorderWidth: "2",
      },
      selectedStateNames: [],
      selectedDistrictNames:[],
      selectedStates: [],
      selectableUniversities: [],
      selectedUniversities: [],
      stateLayers: [],
      columns,
      data: [],
      roles: [],
      selectedUserId: null,
      pagination: {
        pageSize: 10,
        total: 0,
        current: 1,
      },
      filters: [],
      sorter: {
        field: null,
        order: null,
      },
      tableWidth: columns.reduce((a, b) => a + b.width, 0),
      loading: false,
      loading_universities: false,
      cachePayload: null,
      search_term: "",
      visible: false,
      errors: {
        user_roles: [],
      },

      user_roles: [],
      payload_access: {
        id: null,
        access: { states: [], districts: [], universities },
        user: null,
      },
      payload_user: {
        id: null,
        first_name: null,
        last_name: null,
        username: null,
        email: null,
        blocked: false,
        confirmed: true,
        role: null,
      },
      access: {
        can_read: true,
        can_write: true,
        can_update: true,
        can_delete: true,
      },
    };
  },
  watch: {},
  computed: {
    options() {
      return {
        onEachFeature: this.onEachFeature,
      };
    },
    styleFunction() {
      var that = this;
      // const fillColor = that.theme.StateFillColor; // important! need touch fillColor in computed for re-calculate when change fillColor
      const fillColor = this.fillColor; // important! need touch fillColor in computed for re-calculate when change fillColor
      return () => {
        return {
          weight: that.theme.StateBorderWidth,
          color: that.theme.StateBorderColor,
          opacity: 1,
          fillColor: that.theme.StateFillColor,
          fillOpacity: 1,
        };
      };
    },
    onEachFeatureFunction() {
      if (!this.enableTooltip) {
        return () => {};
      }
      return (feature, layer) => {
        layer.bindTooltip(`<b><div>${this.map_type==='state'?'State :':'District :'} </b>` + feature.properties[this.map_type==='state'?'ST_NM':'DISTRICT'] + ` <br> <b>Universities: </b>${feature.properties.count}` + "</div>", {
          permanent: false,
          sticky: true,
        });
      };
    },
  },
  // beforeRouteEnter(to, from, next) {
  //   const allowedPages = JSON.parse(localStorage.getItem("allowedPages"));
  //   const profile = JSON.parse(localStorage.getItem("profile"));
  //   const to_route = to.meta.type;
  //   const nextPage = profile.is_admin
  //     ? {
  //         can_read: true,
  //         can_write: true,
  //         can_update: true,
  //         can_delete: true
  //       }
  //     : allowedPages.filter(role => role.page.frontend_url === to_route).pop();
  //   next(vm => (vm.access = nextPage));
  // },
  // beforeRouteUpdate(to, from, next) {
  //   const allowedPages = JSON.parse(localStorage.getItem("allowedPages"));
  //   const profile = JSON.parse(localStorage.getItem("profile"));
  //   const to_route = to.meta.type;
  //   const nextPage = profile.is_admin
  //     ? {
  //         can_read: true,
  //         can_write: true,
  //         can_update: true,
  //         can_delete: true
  //       }
  //     : allowedPages.filter(role => role.page.frontend_url === to_route).pop();
  //   this.access = nextPage;
  //   next();
  // },
  async mounted() {
    await this.fetchRoles();
    await this.fetch();
    this.setUpMapLayers()
  },
  created(){
    this.profile = JSON.parse(localStorage.getItem("profile"));
  },
  methods: {
    setUpMapLayers(){
      this.allstates = (this.map_type==='state'?this.states:this.districts).features.map((s) => s.properties[this.map_type==='state'?'ST_NM':'DISTRICT'])
    },
    moment,
    onEachFeature(feature, layer) {
      var that = this;
      layer.on({
        mouseover: (e) => that.highlightFeature(e.target),
        mouseout: (e) => that.moveout(e.target),
        click: (e) => {
          console.log(e.target);
          that.selectFeature(e.target);
          that.refreshUniversities();
        },
      });
      layer.bindTooltip(`<div><b>${this.map_type==='state'?'State :':'District : '}</b>` + feature.properties[this.map_type==='state'?'ST_NM':'DISTRICT'] + ` <br> <b>Universities: </b>${feature.properties.count}` + "</div>", {
        permanent: false,
        sticky: true,
      });
    },
    reRenderMap() {
      this.setUpMapLayers()
      setTimeout(() => {
        let allstates = this.findFeatureLayerByStateName(this.allstates);
        let selectedStates = this.findFeatureLayerByStateName(
          this.map_type==='state'?this.selectedStateNames:this.selectedDistrictNames
        );
        allstates.map((featureLayer) => {
          featureLayer.setStyle({
            weight: this.theme.StateBorderWidth,
            color: this.theme.StateBorderColor,
            opacity: 1,
            fillColor: this.theme.StateFillColor,
            fillOpacity: 1,
          });
        });
        selectedStates.map((featureLayer) => {
          featureLayer.setStyle({
            weight: this.theme.hoveredStateBorderWidth,
            fillColor: this.theme.hoveredStateFillColor,
            color: this.theme.hoveredStateBorderColor,
          });
  
          if (!Browser.ie && !Browser.opera12 && !Browser.edge) {
            featureLayer.bringToFront();
          }
        });
        this.refreshUniversities();
      }, 100);
    },
    filterOption(input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      );
    },
    refreshUniversities() {
      this.loading_universities=true
      let states = [...(this.map_type==='state'?this.selectedStateNames:this.selectedDistrictNames)];
      if(!states.length) return;
      let params = {};
      states.map((s, i) => {
        params[`_where[${this.map_type}][${i}]`] = s;
      });
      this.$Services.universities
        .retrive({
          resource: `${this.$Services.universities.api}`,
          page: 1,
          page_size: 10000,
          params,
        })
        .then(({ data }) => {
          this.loading_universities=false
          this.selectableUniversities = data.results;
        })
        .catch((err) => {
          this.loading_universities=false
          console.log(err);
        });
    },
    highlightFeature(featureLayer) {
      var that = this;
      if (featureLayer) {
        featureLayer.setStyle({
          weight: that.theme.hoveredStateBorderWidth,
          fillColor: that.theme.hoveredStateFillColor,
          color: that.theme.hoveredStateBorderColor,
        });

        if (!Browser.ie && !Browser.opera12 && !Browser.edge) {
          featureLayer.bringToFront();
        }
      }
    },
    moveout(featureLayer) {
      var that = this;
      if (!that.selectedStates.includes(featureLayer)) {
        that.resetHighlight(featureLayer);

        // When countries have common border we should highlight selected State once again
        that.selectedStates.map((selectedState) =>
          that.highlightFeature(selectedState)
        );
      }
    },
    resetHighlight(featureLayer) {
      var that = this;
      if (featureLayer) {
        featureLayer.setStyle({
          weight: that.theme.StateBorderWidth,
          color: that.theme.StateBorderColor,
          opacity: 1,
          fillColor: that.theme.StateFillColor,
          fillOpacity: 1,
        });
        if(that.map_type==='state'){
          that.selectedStateNames = that.selectedStateNames.filter(
            (name) => name != featureLayer.feature.properties[that.map_type==='state'?'ST_NM':'DISTRICT']
          );
        }
        else{
          that.selectedDistrictNames = that.selectedDistrictNames.filter(
            (name) => name != featureLayer.feature.properties['DISTRICT']
          );
        }
        that.selectedStates = that.selectedStates.filter(
          (stateLayer) => stateLayer != featureLayer
        );
      }
    },
    selectFeature(featureLayer) {
      var that = this;
      if (!that.selectedStates.includes(featureLayer)) {
        that.highlightFeature(featureLayer);
        that.selectedStates.push(featureLayer);
        if(that.map_type==='state'){
          if (
            !that.selectedStateNames.includes(
              featureLayer.feature.properties[that.map_type==='state'?'ST_NM':'DISTRICT']
            )
          )
            that.selectedStateNames.push(featureLayer.feature.properties[that.map_type==='state'?'ST_NM':'DISTRICT']);
        }else{
          if (
            !that.selectedDistrictNames.includes(
              featureLayer.feature.properties[that.map_type==='state'?'ST_NM':'DISTRICT']
            )
          )
            that.selectedDistrictNames.push(featureLayer.feature.properties[that.map_type==='state'?'ST_NM':'DISTRICT']); 
        }
      } else {
        console.log("reset");
        that.resetHighlight(featureLayer);
      }
    },
    findFeatureLayerByStateName(names = []) {
      const layers = this.$refs.leaflet.$children[1].mapObject._layers;
      let keys = Object.keys(layers);
      const featureLayers = keys
        .filter((key) => {
          return names.includes(layers[key].feature.properties[this.map_type==='state'?'ST_NM':'DISTRICT']);
        })
        .map((key) => layers[key]);
      return featureLayers;
    },

    handlePaginationChange(args) {
      this.$nextTick(() => {
        this.fetch({
          results: this.pagination.pageSize,
          page: this.pagination.current,
          sortField: this.sorter.field,
          sortOrder: this.sorter.order,
          ...this.filters,
        });
      });
    },
    handleTableChange(pagination, filters, sorter) {
      this.filters = filters;
      this.sorter = sorter;
      this.pagination = {
        pageSize: 10,
        total: 0,
        current: 1,
      };
      this.fetch({
        results: this.pagination.pageSize,
        page: this.pagination.current,
        sortField: this.sorter.field,
        sortOrder: this.sorter.order,
        ...this.filters,
      });
    },
    resetUserAccess() {
      this.payload_access = {
        id: null,
        access: { states: [], districts: [] },
        user: null,
      };
    },
    fetchUserAccesses(params = {}) {
      var that = this;
      this.$Services.userAccesses
        .list({
          resource: `${this.$Services.userAccesses.api}`,
          page: params.page,
          page_size: 10000,
          params: { user: this.payload_user.id },
        })
        .then(({ data }) => {
          if (data[0]) {
            let access = data[0];
            this.payload_access = {
              id: access.id,
              access: access.access || {
                states: [],
                districts: [],
                universities: [],
              },
              user: access.user.id,
            };
            this.selectedStateNames = this.payload_access.access.states || [];
            this.selectedDistrictNames = this.payload_access.access.districts || [];
            console.log(access);
            let selectedStates = that.findFeatureLayerByStateName(
              that.map_type?that.selectedStateNames:that.selectedDistrictNames
            );
            console.log(this.payload_access.access.states);
            selectedStates.map((feature) => that.selectFeature(feature));
            this.selectedUniversities = [...(access.access.universities || [])];
            this.refreshUniversities();
          } else {
            this.payload_access = {
              id: null,
              access: { states: [], districts: [], universities: [] },
              user: this.payload_user.id,
            };
            this.selectedStateNames = []
            this.selectedDistrictNames = []
            this.selectedUniversities = []
          }
        })
        .catch((err) => {
          console.log(err);
          this.loading = false;
        });
    },
    fetchRoles(params = {}) {
      console.log("params:", params);
      let og_params = {};
      // if (this.search_term) {
      //     og_params.search = this.search_term;
      // }
      this.loading = true;
      this.$Services.roles
        .list({
          resource: `${this.$Services.roles.api}`,
          page: params.page,
          page_size: 10000,
          params: og_params,
        })
        .then(({ data }) => {
          // const pagination = {
          //   ...this.pagination
          // };
          // // Read total count from server
          // pagination.total = data.count;
          // this.loading = false;
          this.roles = data.roles;
          // this.pagination = pagination;
        })
        .catch((err) => {
          console.log(err);
          this.loading = false;
        });
    },
    fetch(params = {}) {
      console.log("params:", params);
      let og_params = {};
      if (this.search_term) {
        og_params.search = this.search_term;
      }
      const dict_obj = {
        descend: "-",
        ascend: "",
      };
      if (params.sortField) {
        og_params.order_by =
          params.sortField && params.sortOrder
            ? `${dict_obj[params.sortOrder]}${params.sortField}`
            : "";
      }
      this.loading = true;
      this.$Services.users
        .retrive({
          resource: `${this.$Services.users.api}`,
          page: params.page,
          pageSize: params.results || this.pagination.pageSize,
          params: og_params,
        })
        .then(({ data }) => {
          const pagination = {
            ...this.pagination,
          };
          // Read total count from server
          pagination.total = data.count;
          this.loading = false;
          this.data = data.results;
          this.pagination = pagination;
        })
        .catch((err) => {
          console.log(err);
          this.loading = false;
        });
    },
    resetErrors() {
      this.errors = {
        user_roles: [],
      };
    },
    resetPayload() {
      this.selectedStateNames = [];
      this.selectedDistrictNames = [];
      this.selectedStates = [];
      this.payload_access = {
        id: null,
        access: { states: [], districts: [] },
        user: null,
      };
      this.payload_user = {
        id: null,
        first_name: null,
        last_name: null,
        username: null,
        email: null,
        blocked: false,
        confirmed: true,
        role: null,
      };
    },
    addUserRole() {
      this.user_roles.push({
        id: null,
        client: null,
        user: null,
        role: null,
      });
      this.areValidUserRoles();
    },
    delUserRole(index) {
      this.user_roles.splice(index, 1);
      this.areValidUserRoles();
    },
    async createPayload(user) {
      this.resetPayload();
      this.loading = true;
      if (user) {
        try {
          this.payload_user = JSON.parse(JSON.stringify(user));
          this.payload_user.role = this.payload_user.role.id;
          this.fetchUserAccesses();
          this.loading = false;
          this.cachePayload = JSON.stringify(this.payload_user);
        } catch (err) {
          console.log(err);
          this.$Services.noty.error(err);
          this.loading = false;
        }
      } else {
        this.loading = false;
        this.cachePayload = JSON.stringify(this.payload);
      }
    },
    areValidUserRoles() {
      this.errors.user_roles = [];
      const userroles = this.user_roles;
      if (userroles.length <= 1) {
        if (userroles.length === 1) {
          let len_role = userroles.filter((r) => r.role != null);
          if (len_role.length == 1) {
            return true;
          } else {
            this.errors.user_roles[0] = "Please select atleast one role";
          }
        }
      } else {
        const duplicates = (userroles) => {
          let seen = new Set();
          let store = new Array();
          let ids = userroles.map((a) => a.client);
          let indexes = [];
          userroles.filter(
            ({ client }, index) =>
              seen.size === seen.add(client).size &&
              !store.includes(client) &&
              store.push(client) &&
              indexes.push(index)
          );
          return indexes;
        };
        let duplicate_user_roles = duplicates(userroles);
        duplicate_user_roles.map((i) => {
          this.errors.user_roles[i] = "Role for this client already exists";
        });
        console.log(duplicate_user_roles.length);
        return duplicate_user_roles.length === 0;
      }
    },
    isValidUser() {
      let proceed = true;
      let invalidValues = [null, undefined, ""];
      const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (invalidValues.includes(this.payload_user.email)) {
        proceed = false;
        this.errors.email = "Email is required";
      }
      if (!re.test(String(this.payload_user.email).toLowerCase())) {
        proceed = false;
        this.errors.email = "Email is invalid";
      }
      if (invalidValues.includes(this.payload_user.first_name)) {
        proceed = false;
        this.errors.first_name = "First name is required";
      }
      if (invalidValues.includes(this.payload_user.last_name)) {
        proceed = false;
        this.errors.last_name = "Last name is required";
      }
      if (invalidValues.includes(this.payload_user.role)) {
        proceed = false;
        this.errors.role = "Role is required";
      }
      if (invalidValues.includes(this.payload_user.username)) {
          proceed = false;
          this.errors.username = "username is required"
      }
      Object.values(this.errors)
        .slice(0, 3)
        .map((err) => this.$Services.noty.error({}, err));
      return proceed;
    },
    async saveUser() {
      const userUpdateMode = this.payload_user.id != null;
      const accessUpdateMode = this.payload_access.id != null;
      this.payload_user.email = this.payload_user.email.toLowerCase();
      const userPromise = userUpdateMode
        ? await this.$Services.users.update({
            resource: `${this.$Services.users.api}${this.payload_user.id}/`,
            data: this.payload_user,
          })
        : await this.$Services.users.create({
            resource: this.$Services.users.api,
            data: { ...this.payload_user, ...{ password: "Open@123" } },
          });
      console.log(userPromise)
      const userId = this.payload_access.user
        ? this.payload_access.user
        : userPromise.data.user.id;

      this.payload_access = {
        id: this.payload_access.id,
        access: {
          states: Array.from(new Set(this.selectedStateNames)),
          districts: Array.from(new Set(this.selectedDistrictNames)),
          universities: this.selectedUniversities,
        },
        user: userId,
      };

      const accessPromise = accessUpdateMode
        ? await this.$Services.userAccesses.update({
            resource: `${this.$Services.userAccesses.api}${this.payload_access.id}/`,
            data: this.payload_access,
          })
        : await this.$Services.userAccesses.create({
            resource: this.$Services.userAccesses.api,
            data: this.payload_access,
          });

      return Promise.all([userPromise, accessPromise]);
    },
    saveUserRole(user_role, id) {
      const updateMode = user_role.id != null;
      user_role.user = id;
      const promise = updateMode
        ? this.$Services.userRoles.update({
            resource: this.$Services.userRoles.api + user_role.id + "/",
            data: user_role,
          })
        : this.$Services.userRoles.create({
            resource: this.$Services.userRoles.api,
            data: user_role,
          });

      return promise;
    },
    updateTasks(id, payload) {
      return this.$Services.tasks.create({
        resource: `${this.$Services.tasks.api}access-changed/${id}`,
        data: payload,
      });
    },
    async save() {
      this.resetErrors();
      if (this.isValidUser()) {
        this.saving_user=true;
        try {
          const response = await this.saveUser();
          // await this.updateTasks(response[0].data.id,{universities: response[1].data.access.universities})
          // const response = await this.saveUser();
          this.$Services.noty.success("Updated Successfully");
          this.saving_user=false;
          this.onClose();
          this.fetch();
        } catch (err) {
          this.saving_user=false;
          console.log(err);
          this.$Services.noty.error(err, "Update Failed");
        }
      }
    },
    showDrawer(userRole) {
      this.visible = true;
      this.createPayload(userRole);
    },
    onClose() {
      this.visible = false;
    },
    onCancelBack() {
      var that = this;
      if (this.cachePayload != JSON.stringify(this.payload)) {
        this.$confirm({
          title: "Are you sure you want to leave?",
          centered: true,
          content: (h) => {
            return (
              <div>
                <p style="color:red;">
                  {/* Are you sure you want to navigate away from this page? <br></br> */}
                  Doing so will erase any information you have already entered
                  into the form Press OK to continue or Cancel to stay on the
                  current page.
                </p>
              </div>
            );
          },
          onOk() {
            that.visible = false;
          },
          onCancel() {
            console.log("Cancel");
          },
        });
      } else {
        that.visible = false;
      }
    },
    async deleteUser(id) {
      var that = this;
      // const proceed = await that.confirmNoRelations(id);
      const proceed = false;
      if (!proceed) {
        that.$confirm({
          title: "Are you sure to delete this user?",
          centered: true,
          content: (h) => {
            return (
              <div>
                <p style="color:red;">
                  There are few resources associated to this User, deleting this
                  User might cause consistency issues, Are you sure to proceed?
                </p>
                Type confirm to proceed
                <a-input
                  placeholder="confirm"
                  class="mt-2"
                  id="confirm-check"
                />
              </div>
            );
          },
          onOk() {
            const proceed =
              document.getElementById("confirm-check").value === "confirm";
            if (proceed) {
              return that.$Services.users
                .update({
                  resource: that.$Services.users.api + id + "/",
                  data: { blocked: false },
                })
                .then(() => {
                  that.$Services.noty.success("Successfully Deactivated User");
                  that.fetch();
                })
                .catch((err) => {
                  console.log(err);
                  that.$Services.noty.error(err);
                });
            } else {
              throw "Type confirm to proceed";
            }
          },
          onCancel() {
            console.log("Cancel");
          },
          class: "test",
        });
      } else {
        return that.$Services.users
          .update({
            resource: that.$Services.users.api + id,
            data: { is_active: false },
          })
          .then(() => {
            that.$Services.noty.success("Successfully Deactivated User");
            that.fetch();
          })
          .catch((err) => {
            console.log(err);
            that.$Services.noty.error(err);
          });
      }
    },
  },
};
