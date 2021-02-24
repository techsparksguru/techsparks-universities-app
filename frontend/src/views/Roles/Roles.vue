<template>
  <div class="pr-3 pt-3 pb-2 d-flex flex-column" style="height: 100%;">
    <div class="pb-3 d-flex justify-content-between">
      <a-input-search
        v-model="search_term"
        @pressEnter="fetch()"
        @search="fetch()"
        :allowClear="true"
        placeholder="Input Search Text"
        style="width:250px"
      />
      <div>
        <a-tooltip placement="bottom">
          <template slot="title">
            <span>Refresh</span>
          </template>
          <a-button type="link" @click="fetch" class="refetch-button mr-3" icon="reload" :loading="loading"></a-button>
        </a-tooltip>
        <a-button
          type="primary"
          v-if="access.can_write"
          icon="plus"
          @click="showDrawer()"
          >Role</a-button
        >
      </div>
    </div>
    <a-drawer
      :title="payload_role.id === null ? 'Create a new Role' : 'Update Role'"
      :width="720"
      @close="onClose"
      :visible="visible"
      :wrapStyle="{
        overflow: 'auto',
        paddingBottom: '108px'
      }"
    >
      <a-form>
        <a-row>
          <a-col :span="24">
            <a-form-item
              class="px-3 required-field"
              label="Name"
              :labelCol="{ span: 4 }"
              :wrapperCol="{ span: 20 }"
              :validate-status="errors.name ? 'error' : 'success'"
              :help="errors.name"
            >
              <a-input v-model="payload_role.name" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item
              class="px-3 required-field"
              label="Description"
              :labelCol="{ span: 4 }"
              :wrapperCol="{ span: 20 }"
              :validate-status="errors.description ? 'error' : 'success'"
              :help="errors.description"
            >
              <a-input v-model="payload_role.description" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-row
              v-for="(rolePage, index) in payload_role.rolePages"
              :key="index"
              class="mt-3"
              style="background-color:#80808045"
            >
              <div class="p-3">
                <h3>
                  {{
                    rolePage.page.id
                      ? pages_dict[rolePage.page.id]
                      : pages_dict[rolePage.page]
                  }}
                </h3>
                <a-col :span="24">
                  <a-row>
                    <a-col :span="6">
                      <a-form-item
                        label="Can read"
                        :labelCol="{ span: 16 }"
                        :wrapperCol="{ span: 8 }"
                      >
                        <a-checkbox v-model="rolePage.can_read" />
                      </a-form-item>
                    </a-col>
                    <a-col
                      :span="6"
                      v-if="
                        (rolePage.page.id
                          ? pages_dict[rolePage.page.id]
                          : !['Home','Reports'].includes(pages_dict[rolePage.page]))
                      "
                    >
                      <a-form-item
                        label="Can write"
                        :labelCol="{ span: 16 }"
                        :wrapperCol="{ span: 8 }"
                      >
                        <a-checkbox v-model="rolePage.can_write" />
                      </a-form-item>
                    </a-col>
                    <a-col
                      :span="6"
                      v-if="
                        (rolePage.page.id
                          ? pages_dict[rolePage.page.id]
                          : !['Home','Reports'].includes(pages_dict[rolePage.page]))
                      "
                    >
                      <a-form-item
                        label="Can update"
                        :labelCol="{ span: 16 }"
                        :wrapperCol="{ span: 8 }"
                      >
                        <a-checkbox v-model="rolePage.can_update" />
                      </a-form-item>
                    </a-col>
                    <a-col
                      :span="6"
                      v-if="
                        (rolePage.page.id
                          ? pages_dict[rolePage.page.id]
                          : !['Home','Reports'].includes(pages_dict[rolePage.page]))
                      "
                    >
                      <a-form-item
                        label="Can delete"
                        :labelCol="{ span: 16 }"
                        :wrapperCol="{ span: 8 }"
                      >
                        <a-checkbox v-model="rolePage.can_delete" />
                      </a-form-item>
                    </a-col>
                  </a-row>
                </a-col>
              </div>
            </a-row>
          </a-col>
        </a-row>
      </a-form>
      <div
        :style="{
          position: 'absolute',
          left: 0,
          bottom: 0,
          width: '100%',
          borderTop: '1px solid #e9e9e9',
          padding: '10px 16px',
          background: '#fff',
          textAlign: 'right'
        }"
      >
        <a-button :style="{ marginRight: '8px' }" @click="onClose"
          >Cancel</a-button
        >
        <a-button @click="saveRole" :loading="loading" type="primary">Submit</a-button>
      </div>
    </a-drawer>
    <div class="card-container m-0 flex-grow-1 card p-0">
      <a-table
        :columns="columns"
        :rowKey="record => record.name"
        :dataSource="data"
        :pagination="false"
        style= "overflow-y:inherit"
        :loading="loading"
        @change="handleTableChange"
      >
        <template slot="expandedRowRender" slot-scope="record">
          <a-row v-for="rolePage in record.pages" :key="rolePage.id">
            <div>
              <h3>{{ rolePage.page.name }}</h3>
              <a-col :span="24">
                <a-row>
                  <a-col :span="6">
                    <a-form-item
                      label="Can read"
                      :labelCol="{ span: 16 }"
                      :wrapperCol="{ span: 8 }"
                    >
                      <a-checkbox disabled v-model="rolePage.can_read" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="6" v-if="!['Home','Reports'].includes(rolePage.page.name)">
                    <a-form-item
                      label="Can write"
                      :labelCol="{ span: 16 }"
                      :wrapperCol="{ span: 8 }"
                    >
                      <a-checkbox disabled v-model="rolePage.can_write" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="6" v-if="!['Home','Reports'].includes(rolePage.page.name)">
                    <a-form-item
                      label="Can update"
                      :labelCol="{ span: 16 }"
                      :wrapperCol="{ span: 8 }"
                    >
                      <a-checkbox disabled v-model="rolePage.can_update" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="6" v-if="!['Home','Reports'].includes(rolePage.page.name)">
                    <a-form-item
                      label="Can delete"
                      :labelCol="{ span: 16 }"
                      :wrapperCol="{ span: 8 }"
                    >
                      <a-checkbox disabled v-model="rolePage.can_delete" />
                    </a-form-item>
                  </a-col>
                </a-row>
              </a-col>
            </div>
          </a-row>
        </template>
        <template slot="actions" slot-scope="status, record">
          <a @click="showDrawer(record.id)" v-if="access.can_update">Edit</a>
          <a-divider type="vertical" />
          <a
            @click="deleteRole(record.id)"
            class="ant-dropdown-link"
            v-if="access.can_delete"
            >Delete</a
          >
        </template>
      </a-table>
    </div>
  </div>
</template>
<script>

const columns = [
  {
    title: "Name",
    dataIndex: "name",
    sorter: true,
    key: "name"
  },
  {
    title: "Description",
    dataIndex: "description",
    sorter: true,
    key: "description"
  },
  {
    title: "Actions",
    dataIndex: "action",
    scopedSlots: { customRender: "actions" },
    width: "20%"
  }
];
export default {
  name: "Roles",
  data() {
    return {
      columns,
      data: [],
      pages: [],
      pages_dict: {},
      pagination: {},
      loading: false,
      search_term: "",
      visible: false,
      errors: {},
      payload_role: {
        id: null,
        name: null,
        description: null,
        rolePages: []
      },
      access: {
        can_read: true,
        can_write: true,
        can_update: true,
        can_delete: true
      }
    };
  },
  beforeRouteEnter(to, from, next) {
    const allowedPages = JSON.parse(localStorage.getItem("allowedPages"));
    const profile = JSON.parse(localStorage.getItem("profile"));
    const to_route = to.meta.type;
    const nextPage = profile.is_admin
      ? {
          can_read: true,
          can_write: true,
          can_update: true,
          can_delete: true
        }
      : allowedPages.filter(role => role.page.frontend_url === to_route).pop();
    next(vm => (vm.access = nextPage));
  },
  beforeRouteUpdate(to, from, next) {
    const allowedPages = JSON.parse(localStorage.getItem("allowedPages"));
    const profile = JSON.parse(localStorage.getItem("profile"));
    const to_route = to.meta.type;
    const nextPage = profile.is_admin
      ? {
          can_read: true,
          can_write: true,
          can_update: true,
          can_delete: true
        }
      : allowedPages.filter(role => role.page.frontend_url === to_route).pop();
    this.access = nextPage;
    next();
  },
  async mounted() {
    await this.fetchPages();
    await this.fetch();
  },
  watch: {},
  methods: {
    fetchPages(params = {}) {
      this.$Services.pages
        .retrive({
          resource: `${this.$Services.pages.api}`,
          page: 1
        })
        .then(({ data }) => {
          this.pages = data.results;
          this.pages.map(page => {
            this.pages_dict[page.id] = page.name;
          });
        })
        .catch(err => {
          console.log(err);
        });
    },
    resetErrors() {
      this.errors = {};
    },
    resetPayload() {
      this.payload_role = {
        id: null,
        name: null,
        description: null,
        status: true,
        rolePages: this.pages.map(({ id }) => ({
          id: null,
          role: null,
          page: id,
          can_read: false,
          can_write: false,
          can_update: false,
          can_delete: false,
          status: true
        }))
      };
    },
    isValidRole() {
      let proceed = true;
      let invalidValues = [null, undefined, ""];
      if (invalidValues.includes(this.payload_role.name)) {
        proceed = false;
        this.errors.name = "Name is required";
      }
      if (invalidValues.includes(this.payload_role.description)) {
        proceed = false;
        this.errors.description = "Description is required";
      }
      this.errors = JSON.parse(JSON.stringify(this.errors));
      return proceed;
    },
    async createPayload(id) {
      this.loading = true;
      if (id) {
        try {
          let data1 = await this.$Services.roles.retrive({
            resource: this.$Services.roles.api + id,
            page_size: 10000
          });
          let role = data1.data;
          let had_pages = {};
          role.pages.map(page => {
            let id = page.page.id;
            had_pages[id] = page;
          });
          role.rolePages = this.pages.map(page => {
            if (had_pages[page.id] != undefined) return had_pages[page.id];
            else
              return {
                id: null,
                role: role.id,
                page: page.id,
                can_read: false,
                can_write: false,
                can_update: false,
                can_delete: false,
                status: true
              };
          });
          this.payload_role = role;
          console.log(this.payload_role.rolePages);
          this.loading = false;
        } catch (err) {
          console.log(err);
          this.$Services.noty.error(err);
          this.loading = false;
        }
      } else {
        this.resetPayload();
        this.loading = false;
      }
    },
    saveRolePages(role) {
      const promises = this.payload_role.rolePages.map(rolePage => {
        const updateMode = rolePage.id != null;
        if (updateMode) {
          rolePage.role = rolePage.role.id;
          rolePage.page = rolePage.page.id;
        } else {
          rolePage.role = role.data.id;
        }
        return updateMode
          ? this.$Services.rolePages.update({
              resource: `${this.$Services.rolePages.api}${rolePage.id}/`,
              data: rolePage
            })
          : this.$Services.rolePages.create({
              resource: this.$Services.rolePages.api,
              data: rolePage
            });
      });

      return Promise.all(promises);
    },
    saveRoleModel() {
      const updateMode = this.payload_role.id != null;

      const promise = updateMode
        ? this.$Services.roles.update({
            resource: this.$Services.roles.api + this.payload_role.id + "/",
            data: this.payload_role
          })
        : this.$Services.roles.create({
            resource: this.$Services.roles.api,
            data: this.payload_role
          });

      return promise;
    },
    async saveRole() {
      if (this.isValidRole()) {
        this.loading = true;
        try {
          const role = await this.saveRoleModel();
          await this.saveRolePages(role);
          this.$Services.noty.success("Role saved Successfully");
          this.loading = false;
          this.onClose();
          this.fetch();
        } catch (err) {
          console.log(err);
          this.$Services.noty.error(err,"Role saving Failed");
          this.loading = false;
        }
      }
      else {
        this.$Services.noty.error({}, "Please fill all manditory fields")
      }
    },
    showDrawer(id) {
      this.visible = true;
      this.createPayload(id);
    },
    onClose() {
      this.visible = false;
    },
    handleTableChange(pagination, filters, sorter) {
      console.log(pagination);
      const pager = { ...this.pagination };
      pager.current = pagination.current;
      this.pagination = pager;
      this.fetch({
        results: pagination.pageSize,
        page: pagination.current,
        sortField: sorter.field,
        sortOrder: sorter.order,
        ...filters
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
        ascend: ""
      };
      if (params.sortField) {
        og_params.order_by =
          params.sortField && params.sortOrder
            ? `${dict_obj[params.sortOrder]}${params.sortField}`
            : "";
      }
      this.loading = true;
      this.$Services.roles
        .retrive({
          resource: `${this.$Services.roles.api}`,
          page: params.page,
          page_size: 10000,
          params: og_params
        })
        .then(({ data }) => {
          const pagination = { ...this.pagination };
          // Read total count from server
          pagination.total = data.count;
          this.loading = false;
          this.data = data.results;
          this.pagination = pagination;
        })
        .catch(err => {
          console.log(err);
          this.loading = false;
        });
    },
    async deleteRole(id) {
      var that = this;
      // const proceed = await that.confirmNoRelations(id);
      const proceed = false;
      if (!proceed) {
        that.$confirm({
          title: "Are you sure to delete this Role?",
          centered: true,
          content: h => {
            return (
              <div>
                <p style="color:red;">
                  There are few resources associated to this Role, deleting this
                  Role might cause consistency issues, Are you sure to proceed?
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
            return that.$Services.roles
                .destroy({
                  resource: that.$Services.roles.api + id
                })
                .then(() => {
                  that.$Services.noty.success("Successfully Deleted Role");
                  that.fetch();
                })
                .catch(err => {
                  console.log(err);
                  that.$Services.noty.error(err);
                })
            } else {
              throw "Type confirm to proceed";
            }
          },
          onCancel() {
            console.log("Cancel");
          },
          class: "test"
        });
      } else {
        return that.$Services.roles
          .destroy({
            resource: that.$Services.roles.api + id
          })
          .then(() => {
            that.$Services.noty.success("Successfully Deleted Role");
            that.fetch();
          })
          .catch(err => {
            console.log(err);
            that.$Services.noty.error(err);
          })
      }
    }
  }
};
</script>
<style lang="stylus" scoped></style>
