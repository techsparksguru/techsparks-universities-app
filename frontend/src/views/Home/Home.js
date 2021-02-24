import states from "@/assets/states.json";
import districts from "@/assets/districts.json";
import moment from "moment";
import { latLng, latLngBounds, geoJSON, Browser } from "leaflet";
const taskColumns = [
  {
    title: "University name",
    dataIndex: "university.name",
    fixed: "left",
    width: 300,
  },
  {
    title: "User",
    dataIndex: "user.first_name",
    fixed: "left",
    width: 250,
  },
  {
    title: "Map url",
    dataIndex: "university.map_url",
    width: 250,
    scopedSlots: {
      customRender: "map_url",
    },
  },
  {
    title: "Formatted address",
    dataIndex: "university.formatted_address",
    width: 250,
  },
  {
    title: "International phone number",
    dataIndex: "university.international_phone_number",
    width: 250,
  },
  {
    title: "Website",
    dataIndex: "university.website",
    scopedSlots: {
      customRender: "website"
    },
    width: 250,
  },
  {
    title: "University type",
    dataIndex: "university.university_type",
    width: 250,
  },
  {
    title: "Status",
    dataIndex: "status",
    fixed: "right",
    scopedSlots: {
      customRender: "status",
    },
    width: 150,
  },
];

const universityColumns = [
  {
    title: "University name",
    dataIndex: "name",
    fixed: "left",
    width: 300,
  },
  {
    title: "Map url",
    dataIndex: "map_url",
    width: 250,
    scopedSlots: {
      customRender: "map_url",
    },
  },
  {
    title: "Id",
    dataIndex: "id",
    width: 250,
  },
  {
    title: "Established",
    dataIndex: "established",
    width: 250,
  },
  {
    title: "Specialization",
    dataIndex: "specialization",
    width: 250,
  },
  {
    title: "Formatted address",
    dataIndex: "formatted_address",
    width: 250,
  },
  {
    title: "International phone number",
    dataIndex: "international_phone_number",
    width: 250,
  },
  {
    title: "Website",
    dataIndex: "website",
    scopedSlots: {
      customRender: "website"
    },
    width: 250,
  },
  {
    title: "University type",
    dataIndex: "university_type",
    width: 250,
  },
  {
    title: "Actions",
    fixed: "right",
    scopedSlots: {
      customRender: "actions",
    },
    width: 100,
  },
];

import notes from "@/components/Notes";
export default {
  name: "Home",
  async created() {
    // this.layers = [this.createGeoJsonLayer(states)];
    this.fetchUserAccesses();
    this.setMapLayers()
  },
  mounted() {
    this.fetch();
    this.$nextTick(() => {
      this.selectFeature(
        this.findFeatureLayerByStateName(this.selectedStateName)
      );
    });
  },
  components: {
    notes,
  },
  watch: {
    selectedStateName(value) {
      if (value) {
        this.fetch();
      }
    },
  },
  data() {
    return {
      map_type:'ST_NM',
      states,
      districts,
      taskColumns,
      tableWidth: universityColumns.reduce((a, b) => a + b.width, 0),
      data: [],
      pagination: {
        pageSize: 10,
        total: 0,
        current: 1,
      },
      search_term: "",

      colors: {
        done: "green",
        inprogress: "blue",
        ready_for_review: "cyan",
        failure: "red",
        backlog: "orange",
      },
      universityColumns,
      filteredUniversities: [],
      layers: [],
      loading: false,
      show: true,
      enableTooltip: true,
      zoom: 4,
      center: latLng(22.15, 79.081),
      geojson: [],
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
      selectedState: null,
      selectedStateName: "Gujarat",
      mapData: {
        series: [
          {
            name: "Count",
            data: [0, 0, 0, 0, 0, 0],
          },
        ],
        chartOptions: {
          chart: {
            type: "bar",
            height: 350,
          },
          plotOptions: {
            bar: {
              horizontal: true,
            },
          },
          dataLabels: {
            enabled: false,
          },
          xaxis: {
            categories: [
              "Total",
              "Contacted",
              "Success",
              "In progress",
              "Rejected",
              "Backlog",
            ],
          },
        },
      },

      userRole: null,
      selectedClient: null,
      stats: {
        users: 0,
        clients: 0,
        candidates: 0,
        joborders: 0,
        pipelines: 0,
        tasks: 0,
        events: 0,
        taskactivities: 0,
      },

      commentsDrawer: false,
      tasksDrawer: false,
      selectedUniversity: null,
      tasks: [],
      users: [],
      value: "",
      submitting: false,
      profile: JSON.parse(localStorage.getItem("profile")),
      // current:0,
    };
  },
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
        layer.bindTooltip(`<div><b>${this.map_type==='ST_NM'?'State :':'District :'} </b>` + feature.properties[this.map_type==='ST_NM'?'ST_NM':'DISTRICT'] + ` <br> <b>Universities: </b>${feature.properties.count}` + "</div>", {
          permanent: false,
          sticky: true,
        });
      };
    },
  },
  methods: {
    moment,
    setMapLayers(){
      if(this.map_type==='ST_NM'){
        this.layers = [this.createGeoJsonLayer(states)];
      }
      else{
        this.layers = [this.createGeoJsonLayer(districts)]
      }
    },
    changeUser(id) {
      this.selectedUserId = this.selectedUserId === id ? null : id;
      this.fetchTasks();
    },
    fetchUserAccesses(params = {}) {
      var that = this;
      this.$Services.userAccesses
        .list({
          resource: `${this.$Services.userAccesses.api}`,
          page: params.page,
          page_size: 10000,
          params: {
            user: this.profile.id,
          },
        })
        .then(({ data }) => {
          if (data[0]) {
            let access = data[0];
            this.payload_access = {
              id: access.id,
              access: access.access || {
                states: [],
                districts: [],
              },
              user: access.user,
            };
            this.selectedStateNames = this.payload_access.access.states || [];
          } else {
            this.payload_access = {
              id: null,
              access: {
                states: [],
                districts: [],
              },
              user: this.profile.id,
            };
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },

    openTasks(record) {
      this.selectedUniversity = record;
      this.$Services.users
        .retrive({
          resource: `${this.$Services.users.api}`,
          page: 1,
          page_size: 10000,
        })
        .then(({ data }) => {
          this.users = data.results;
        });
      this.fetchTasks();
      this.tasksDrawer = true;
    },
    openComments(record) {
      this.selectedUniversity = record;
      this.commentsDrawer = true;
    },
    closeTasks() {
      this.selectedUniversity = null;
      this.tasksDrawer = false;
    },
    closeComments() {
      this.selectedUniversity = null;
      this.commentsDrawer = false;
    },
    fetchTasks(params = {}) {
      var that = this;
      this.$Services.tasks
        .list({
          resource: `${this.$Services.tasks.api}`,
          page: params.page,
          page_size: 10000,
          params: {
            university: this.selectedUniversity.id,
            user: this.selectedUserId,
          },
        })
        .then(({ data }) => {
          this.tasks = data;
        })
        .catch((err) => {
          console.log(err);
        });
    },

    fetch(params = {}) {
      console.log("params:", params);
      let og_params = {};
      if (this.selectedStateName) {
        og_params[this.map_type==='ST_NM'?'state':'district'] = this.selectedStateName;
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
      this.$Services.universities
        .retrive({
          resource: `${this.$Services.universities.api}`,
          page: params.page,
          page_size: 100000,
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
          console.log(data);
          this.pagination = pagination;
        })
        .catch((err) => {
          console.log(err);
          this.loading = false;
        });
    },
    createGeoJsonLayer(cords) {
      var that = this;
      return geoJSON(cords, {
        style: () => ({
          weight: that.theme.StateBorderWidth,
          fillColor: that.theme.StateFillColor,
          fillOpacity: 1,
          color: that.theme.StateBorderColor,
          opacity: 1,
        }),
        onEachFeature: (f, l) => {
          that.onEachFeature(f, l);
        },
      });
    },
    onEachFeature(feature, layer) {
      var that = this;
      layer.on({
        mouseover: (e) => that.highlightFeature(e.target),
        mouseout: (e) => that.moveout(e.target),
        click: (e) => that.selectFeature(e.target),
      });
      layer.bindTooltip(`<div><b>${that.map_type==='ST_NM'?'State :':'District :'} </b>` + feature.properties[this.map_type==='ST_NM'?'ST_NM':'DISTRICT'] + ` <br> <b>Universities: </b>${feature.properties.count}` + "</div>", {
        permanent: false,
        sticky: true,
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
      if (featureLayer !== that.selectedState) {
        that.resetHighlight(featureLayer);

        // When countries have common border we should highlight selected State once again
        that.highlightFeature(that.selectedState);
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
      }
    },
    selectFeature(featureLayer) {
      var that = this;
      if (featureLayer !== that.selectedState) {
        that.resetHighlight(that.selectedState);
        that.highlightFeature(featureLayer);
        that.selectedState = featureLayer;
        that.selectedStateName = featureLayer.feature.properties[this.map_type];
      }
    },
    findFeatureLayerByStateName(name) {
      const layers = this.$refs.leaflet.$children[1].mapObject._layers;
      let keys = Object.keys(layers);
      const featureLayer = keys.filter((key) => {
        return layers[key].feature.properties[this.map_type] === name;
      })[0];
      return featureLayer ? layers[featureLayer] : null;
    },
    updateUniversity(id, payload) {
      this.$Services.universities
        .update({
          resource: `${this.$Services.universities.api}${id}/`,
          data: payload,
        })
        .then(() => {
          this.$Services.noty.success("Updated Successfully");
          this.fetch();
        })
        .catch((err) => {
          console.log(err);
          this.$Services.noty.error(err, "Update Failed");
        });
    },
  },
};
