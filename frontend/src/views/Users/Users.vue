<template>
  <div class="pr-3 pt-3 pb-2 d-flex flex-column" style="height: 100%;">
    <div class="pb-3 d-flex justify-content-between">
      <!-- <a-input-search
        v-model="search_term"
        @pressEnter="fetch()"
        @search="fetch()"
        :allowClear="true"
        placeholder="Input Search Text"
        style="width:250px"
      /> -->
      <div></div>
      <div>
        <a-tooltip placement="bottom">
          <template slot="title">
            <span>Refresh</span>
          </template>
          <a-button
            type="link"
            @click="handlePaginationChange"
            class="refetch-button mr-3"
            icon="reload"
            :loading="loading"
          ></a-button>
        </a-tooltip>
        <a-button
          type="primary"
          v-if="profile.role.type==='admin'"
          icon="plus"
          @click="showDrawer()"
          >User</a-button
        >
      </div>
    </div>

    <a-drawer
      :title="payload_user.id === null ? 'Create a new User' : 'Update User'"
      :width="720"
      destroyOnClose
      @close="onClose"
      :visible="visible"
      :wrapStyle="{
        height: '100%',
        overflow: 'auto',
        paddingBottom: '108px'
      }"
    >
      <a-form>
        <a-row>
          <a-col :span="24">
            <a-form-item
              class="px-3"
              label="First Name"
              :labelCol="{ span: 4 }"
              :wrapperCol="{ span: 20 }"
              :validate-status="errors.first_name ? 'error' : 'success'"
              :help="errors.first_name"
            >
              <a-input v-model="payload_user.first_name" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item
              class="px-3"
              label="Last Name"
              :labelCol="{ span: 4 }"
              :wrapperCol="{ span: 20 }"
              :validate-status="errors.last_name ? 'error' : 'success'"
              :help="errors.last_name"
            >
              <a-input v-model="payload_user.last_name" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item
              class="px-3"
              label="Email"
              :labelCol="{ span: 4 }"
              :wrapperCol="{ span: 20 }"
              :validate-status="errors.email ? 'error' : 'success'"
              :help="errors.email"
            >
              <a-input v-model="payload_user.email" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item
              class="px-3"
              label="Username"
              :labelCol="{ span: 4 }"
              :wrapperCol="{ span: 20 }"
              :validate-status="errors.username ? 'error' : 'success'"
              :help="errors.username"
            >
              <a-input v-model="payload_user.username" />
            </a-form-item>
          </a-col>
          <!-- 
          <a-col :span="24">
            <a-form-item
              class="px-3"
              label="Is_Staff"
              :labelCol="{ span: 4 }"
              :wrapperCol="{ span: 20 }"
              :validate-status="errors.is_staff ? 'error' : 'success'"
              :help="errors.is_staff"
            >
              <a-checkbox v-model="payload_user.is_staff" />
            </a-form-item>
          </a-col>-->
          <a-col :span="24">
            <a-form-item
              class="px-3"
              label="confirmed"
              :labelCol="{ span: 4 }"
              :wrapperCol="{ span: 20 }"
              :validate-status="errors.confirmed ? 'error' : 'success'"
              :help="errors.confirmed"
            >
              <a-checkbox v-model="payload_user.confirmed" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item
              class="px-3"
              label="Blocked"
              :labelCol="{ span: 4 }"
              :wrapperCol="{ span: 20 }"
              :validate-status="errors.blocked ? 'error' : 'success'"
              :help="errors.blocked"
            >
              <a-checkbox v-model="payload_user.blocked" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item
              class="px-3"
              label="Role"
              :labelCol="{ span: 4 }"
              :wrapperCol="{ span: 20 }"
              :validate-status="errors.role ? 'error' : 'success'"
              :help="errors.role"
            >
              <a-select style="width: 100%" v-model="payload_user.role">
                <a-select-option
                  v-for="role in roles"
                  :key="role.id"
                  :value="role.id"
                  >{{ role.name }}</a-select-option
                >
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item
              v-if="visible"
              class="px-3"
              label="Access"
              :labelCol="{ span: 4 }"
              :wrapperCol="{ span: 20 }"
            >
              <a-radio-group
                v-model="map_type"
                button-style="solid"
                @change="reRenderMap"
              >
                <a-radio-button value="state">
                  State view
                </a-radio-button>
                <a-radio-button value="district">
                  District view
                </a-radio-button>
              </a-radio-group>
              <l-map
                ref="leaflet"
                :options="mapOptions"
                :zoom="zoom"
                :center="center"
                style="height: 500px; width: 100%"
              >
                <l-tile-layer :url="url" :attribution="attribution" />
                <l-geo-json
                  :geojson="map_type === 'state' ? states : districts"
                  :options="options"
                  :options-style="styleFunction"
                />
              </l-map>
              <a-select
                v-if="map_type === 'state'"
                style="width: 100%"
                label="States"
                placeholder="States"
                v-model="selectedStateNames"
                mode="multiple"
                @change="reRenderMap"
              >
                <a-select-option
                  v-for="state in allstates"
                  :key="state"
                  :value="state"
                  >{{ state }}</a-select-option
                >
              </a-select>
              <a-select
                v-else
                style="width: 100%"
                label="Districts"
                placeholder="Districts"
                v-model="selectedDistrictNames"
                mode="multiple"
                @change="reRenderMap"
              >
                <a-select-option
                  v-for="state in allstates"
                  :key="state"
                  :value="state"
                  >{{ state }}</a-select-option
                >
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item
              class="px-3"
              label="Universities"
              :labelCol="{ span: 4 }"
              :wrapperCol="{ span: 20 }"
            >
              <a-select
                :filter-option="filterOption"
                :loading="loading_universities"
                style="width: 100%"
                v-model="selectedUniversities"
                mode="multiple"
              >
                <a-select-option
                  :filterOption="true"
                  :optionFilterProp="'name'"
                  v-for="university in selectableUniversities"
                  :key="university.id"
                  :value="university.id"
                  >{{ university.name }}</a-select-option
                >
              </a-select>
              <a
                @click="
                  selectedUniversities = selectableUniversities.map(u => u.id)
                "
                >Select all</a
              >
            </a-form-item>
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
        <a-button :style="{ marginRight: '8px' }" @click="onCancelBack"
          >Cancel</a-button
        >
        <a-button @click="save" v-if="profile.role.type==='admin'" :loading="saving_user" type="primary"
          >Save</a-button
        >
      </div>
    </a-drawer>
    <div class="card-container m-0 flex-grow-1 card p-0">
      <a-table
        :columns="columns"
        :rowKey="record => record.id"
        :dataSource="data"
        :pagination="false"
        :loading="loading"
        :scroll="{
          x: tableWidth,
          y: 'calc(100vh - (55px + 48px + 48px + 53px + 48px + 10px))'
        }"
        @change="handleTableChange"
      >
        <template slot="created" slot-scope="created_on">
          {{ moment(created_on).format("YYYY-MM-DD") }}
        </template>
        <template slot="role" slot-scope="role">
          <span class="text-capitalize">{{ role }}</span>
        </template>

        <template slot="default_color" slot-scope="default_color">
          <div
            style="width:24px;height:24px;border-radius:5px"
            :style="{ backgroundColor: default_color }"
          ></div>
        </template>
        <template slot="actions" slot-scope="status, record">
          <div class="d-flex justify-content-center">
            <a-dropdown>
              <a class="ant-dropdown-link" @click="e => e.preventDefault()">
                <a-icon type="more" />
              </a>
              <a-menu slot="overlay">
                <a-menu-item>
                  <a @click="showDrawer(record)" v-if="access.can_update">
                    <a-icon class="mr-2" type="edit" />Edit
                  </a>
                </a-menu-item>
                <!-- <a-menu-item>
                  <a
                    @click="deleteUser(record.id)"
                    class="ant-dropdown-link"
                    v-if="access.can_delete"
                  >
                    <a-icon class="mr-2" type="user-delete" />Deactivate
                  </a>
                </a-menu-item> -->
              </a-menu>
            </a-dropdown>
          </div>
        </template>
      </a-table>
      <div
        class="d-flex table-border-top justify-content-end align-items-center pt-2 pb-1"
      >
        <span class="pr-3">
          Showing {{ (pagination.current - 1) * pagination.pageSize + 1 }} to
          {{ (pagination.current - 1) * pagination.pageSize + data.length }}
          items of {{ pagination.total }}
        </span>
        <a-pagination
          showSizeChanger
          showQuickJumper
          :pageSize.sync="pagination.pageSize"
          @showSizeChange="handlePaginationChange"
          @change="handlePaginationChange"
          :total="pagination.total"
          v-model="pagination.current"
        />
      </div>
    </div>
  </div>
</template>
<style scoped>
.dynamic-delete-button {
  cursor: pointer;
  position: relative;
  top: 4px;
  font-size: 24px;
  color: #999;
  transition: all 0.3s;
}
.dynamic-delete-button:hover {
  color: #777;
}
.dynamic-delete-button[disabled] {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
<script src="./Users.js"></script>
