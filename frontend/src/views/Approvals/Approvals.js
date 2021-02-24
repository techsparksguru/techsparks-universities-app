import notes from "@/components/Notes";
const universityColumns = [
  
  {
    "title": "User",
    "dataIndex": "user.username",
    fixed: "left",
    width: 250
  },
  {
    "title": "University name",
    "dataIndex": "university.name",
    width: 250
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
    title: "International phone number",
    dataIndex: "university.international_phone_number",
    width: 250,
  },
  {
    "title": "Established",
    "dataIndex": "university.established",
    width: 250
  },
  {
    "title": "Specialization",
    "dataIndex": "university.specialization",
    width: 250
  },
  {
    "title": "Formatted address",
    "dataIndex": "university.formatted_address",
    width: 250
  },
  {
    "title": "Website",
    "dataIndex": "university.website",
    scopedSlots: {
      customRender: "website"
    },
    width: 250
  },
  {
    "title": "University type",
    "dataIndex": "university.university_type",
    width: 250
  },
  {
    "title": "Status",
    "dataIndex": "status",
    fixed: "right",
    scopedSlots: {
      customRender: "status"
    },
    width: 200
  },
  {
    "title": "Actions",
    fixed: "right",
    scopedSlots: {
      customRender: "actions"
    },
    width: 100
  },
];

export default {
  name:"Approvals",
  async created() {
    this.profile = JSON.parse(localStorage.getItem("profile"));
  },
  mounted() {
    this.fetch()
  },
  data() {
    return {
      profile:false,
      tableWidth: universityColumns.reduce((a, b) => a + b.width, 0),
      universityColumns,
      data: [],
      pagination: {
        pageSize: 10,
        total: 0,
        current: 1
      },
      search_term: '',

      colors: {
        'done': 'green',
        'inprogress': 'blue',
        'ready_for_review': 'cyan',
        'backlog': 'orange'
      },
      loading: false,

      commentsDrawer: false,
      selectedUniversity: null,
      // current:0,
    };
  },
  computed: {
  },
  components:{
    notes
  },
  methods: {
    openComments(record) {
      this.selectedUniversity = record;
      this.commentsDrawer = true
    },
    closeComments() {
      this.selectedUniversity = null;
      this.commentsDrawer = false
    },

    fetch(params = {}) {
      console.log("params:", params);
      let og_params = {status:'ready_for_review'};
      const dict_obj = {
        descend: "-",
        ascend: ""
      };
      if (params.sortField) {
        og_params.order_by =
          params.sortField && params.sortOrder ?
          `${dict_obj[params.sortOrder]}${params.sortField}` :
          "";
      }
      this.loading = true;
      this.$Services.tasks
        .retrive({
          resource: `${this.$Services.tasks.api}`,
          page: params.page,
          // pageSize: params.results || this.pagination.pageSize,

          params: og_params
        })
        .then(({
          data
        }) => {
          const pagination = {
            ...this.pagination
          };
          // Read total count from server
          pagination.total = data.count;
          this.loading = false;
          this.data = data.results;
          console.log(data)
          this.pagination = pagination;
        })
        .catch(err => {
          console.log(err);
          this.loading = false;
        });
    },
    updateUniversity(id, payload) {
      this.$Services.tasks.update({
          resource: `${this.$Services.tasks.api}${id}/`,
          data: payload
        }).then(() => {
          this.$Services.noty.success("Updated Successfully");
          this.fetch()
        })
        .catch((err) => {
          console.log(err);
          this.$Services.noty.error(err, "Update Failed");
        })
    },
  }
};