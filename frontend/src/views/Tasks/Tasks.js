import draggable from "vuedraggable";
import TaskCard from "@/components/TaskCard.vue";
import notes from "@/components/Notes.vue";
import moment from "moment";
export default {
  name: "Tasks",
  components: {
    TaskCard,
    draggable,
    notes,
  },
  async created() {
    this.resetPagination();
    if (["admin","readonly"].includes(this.profile.role.type)){ await this.fetchUsers();}
    else{
      this.selectedUserId = this.profile.id
    }
    await this.fetchTasks();
  },
  mounted() {},
  data() {
    return {
      profile: JSON.parse(localStorage.getItem("profile")),
      fetching: false,
      users: [],
      selectedUserId: null,
      colsDict: {
        backlog: "Backlog",
        inprogress: "In Progress",
        ready_for_review: "Ready for review",
        done: "Done",
      },
      noItems: {
        backlog: false,
        inprogress: false,
        ready_for_review: false,
        done: false,
      },
      offset: 0,
      page: 1,
      page_size: 3,

      tcolumns: [
        {
          title: "Backlog",
          tasks: [],
        },
        {
          title: "In Progress",
          tasks: [],
        },
        {
          title: "Ready for review",
          tasks: [],
        },
        {
          title: "Done",
          tasks: [],
        },
      ],
      colors: {
        done: "green",
        inprogress: "blue",
        failure: "red",
        ready_for_review: "cyan",
        backlog: "orange",
      },
      commentsDrawer: false,
      selectedUniversity: null,
    };
  },
  computed: {},
  methods: {
    moment,
    onEnd(event) {
      const objectInverse = (object) =>
        Object.entries(object).reduce((obj, [key, value]) => {
          obj[value] = key;
          return obj;
        }, {});
      let col_title = event.to.previousElementSibling.getAttribute(
        "data-title"
      );
      console.log(col_title);
      // console.log(this.tcolumns.map((col) => col.title));
      let task = this.tcolumns.filter((col) => col.title === col_title).pop()
        .tasks[event.newDraggableIndex];
      let newStatus = objectInverse(this.colsDict)[col_title];
      console.log(col_title, newStatus, objectInverse(this.colsDict));
      if (task.status != newStatus) {
        this.updateTask({
          id: task.id,
          // pipeline: null,
          // assigned: null,
          status: newStatus,
          // due_date: null,
        });
      }
    },
    onScroll({ target: { scrollTop, clientHeight, scrollHeight } }) {
      console.log(scrollTop + clientHeight+10 , scrollHeight)
      if (scrollTop + clientHeight+10 >= scrollHeight) {
        this.fetchTasks();
      }
    },
    resetPagination() {
      this.noItems = {
        backlog: false,
        inprogress: false,
        ready_for_review: false,
        done: false,
      };
      this.tcolumns = [
        {
          title: "Backlog",
          tasks: [],
          count: 0,
        },
        {
          title: "In Progress",
          tasks: [],
          count: 0,
        },
        {
          title: "Ready for review",
          tasks: [],
          count: 0,
        },
        {
          title: "Done",
          tasks: [],
          count: 0,
        },
      ];
      this.offset = 0;
      this.page = 1;
    },
    fetchUsers() {
      return this.$Services.users
        .retrive({
          resource: `${this.$Services.users.api}`,
          page: 1,
          page_size: 10000,
        })
        .then(({ data }) => {
          this.users = data.results;
        });
    },
    move(evt) {
      if(this.profile.role.type==='readonly') return false
      console.log(evt.to.previousElementSibling);
      let col_title = evt.to.previousElementSibling.getAttribute("data-title");
      return this.profile.role.type != "admin" ? col_title !== "Done" : true;
    },

    openComments(record) {
      this.selectedUniversity = record;
      this.commentsDrawer = true;
    },
    closeComments() {
      this.selectedUniversity = null;
      this.commentsDrawer = false;
    },
    changeUser(id) {
      this.resetPagination();
      this.selectedUserId = this.selectedUserId === id ? null : id;
      this.fetchTasks();
    },
    updateTask(payload) {
      this.$Services.tasks
        .update({
          resource: this.$Services.tasks.api + payload.id + "/",
          data: payload,
        })
        .then((response) => {
          this.$Services.noty.success("Updated Task successfully");
          this.fetchTasks();
        })
        .catch((err) => {
          this.$Services.noty.error(err);
          console.log(err);
        });
    },
    fetchTasksByStatus(status) {
      let og_params = {
        user: this.selectedUserId,
        status,
        active: true,
      };
      return this.$Services.tasks
        .retrive({
          resource: this.$Services.tasks.api,
          page: this.page,
          page_size: this.page_size,
          params: og_params,
        })
        .then(({ data }) => {
          let columnIndex = this.tcolumns
            .map((c) => c.title)
            .indexOf(this.colsDict[status]);
          console.log(status, columnIndex);
          this.tcolumns[columnIndex]["tasks"].push(...data.results);
          this.tcolumns[columnIndex]["count"] = data.count;
          this.noItems[status] = this.page * this.page_size + 1 > data.count;
        });
    },

    fetchTasks() {
      if (!this.fetching) {
        this.fetching = true;
        let promises = Object.keys(this.colsDict)
          .filter((status) => !this.noItems[status])
          .map((status) => this.fetchTasksByStatus(status));
        Promise.all(promises)
          .then((data) => {
            console.log(data);
            let nextPageExists = Object.values(this.noItems).includes(false);
            if (nextPageExists) {
              this.offset += this.page_size;
              this.page++;
            }
            this.fetching = false;
          })
          .catch((err) => {
            console.log(err);
            this.$Services.noty.error(err, "Something went wrong");
            this.fetching = false;
          });
      }
    },
  },
};
