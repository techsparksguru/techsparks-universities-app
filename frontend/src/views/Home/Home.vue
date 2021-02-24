<template>
  <div class="content py-4 pr-3">
    <a-row type="flex" class="mb-4 card">
      <a-col :md="24">
        <a-radio-group
          v-model="map_type"
          style="position:absolute;right:5px;top:5px;z-index:1111"
          button-style="solid"
          @change="setMapLayers"
        >
          <a-radio-button value="ST_NM">
            State view
          </a-radio-button>
          <a-radio-button value="DISTRICT">
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
            v-if="show"
            :geojson="map_type === 'ST_NM' ? states : districts"
            :options="options"
            :options-style="styleFunction"
          />
        </l-map>
      </a-col>
      <!-- <a-col :md="7" style="background-color: #fff">
        <div class="d-flex justify-content-center align-items-center h-100">
          <div>
            <p class="text-muted m-0">Selected State/Region</p>
            <h3>{{ selectedStateName }}</h3>
            <apexchart
              type="bar"
              height="300"
              :options="mapData.chartOptions"
              :series="mapData.series"
            ></apexchart>
          </div>
        </div>
      </a-col> -->
    </a-row>
    <div class="card-container p-0 m-0 card">
      <a-table
        :pagination="true"
        :loading="loading"
        :rowKey="record => record.id"
        :dataSource="data"
        :columns="universityColumns"
        :scroll="{
          x: tableWidth,
          y: 'calc(100vh - (55px + 48px + 48px + 53px + 48px + 10px))'
        }"
      >
      <template slot="website" slot-scope="website">
          <a
            v-if="website"
            target="_blank"
            :href="website"
            >{{website}}</a
          >
        </template>
        <template slot="map_url" slot-scope="map_url, record">
          <a
            target="_blank"
            :href="
              `${map_url ||
                'https://www.google.com/maps/search/' +
                  record.name +
                  record.state}`
            "
            >View in maps</a
          >
        </template>
        <template slot="contacted" slot-scope="contacted, record">
          <a-checkbox
            @change="
              updateUniversity(record.id, { contacted: record.contacted })
            "
            v-model="record.contacted"
          ></a-checkbox>
        </template>
        <template slot="status" slot-scope="status, record">
          <a-tag class="mb-1 text-capitalize" :color="colors[status]">
            <a-select
              :key="`${record.id}-status`"
              class="text-capitalize transparent-select"
              style="width:100%;text-transform:capitalize;color:inherit"
              @change="updateUniversity(record.id, { status: record.status })"
              v-model="record.status"
              size="small"
            >
              <a-select-option
                v-for="(title, index) in ['backlog', 'inprogress', 'done']"
                :key="`${record.id}-${index}-${title}`"
                :value="title"
              >
                <span style="text-transform:capitalize">{{ title }}</span>
              </a-select-option>
            </a-select>
          </a-tag>
        </template>
        <span slot="actions" slot-scope="text, record">
          <a @click="openTasks(record)">
            <a-icon type="schedule" />
          </a>
          <a-divider type="vertical" />
          <a @click="openComments(record)">
            <a-icon type="message" />
          </a>
        </span>
      </a-table>
    </div>
    <a-drawer
      title="Comments"
      destroyOnClose
      :width="720"
      :visible="commentsDrawer"
      :body-style="{ paddingBottom: '80px' }"
      :wrapStyle="{
        height: '100%',
        overflow: 'auto',
        paddingBottom: '108px'
      }"
      @close="closeComments"
    >
      <notes :university="selectedUniversity"></notes>
    </a-drawer>
    <a-drawer
      title="Tasks"
      destroyOnClose
      :width="'70%'"
      :visible="tasksDrawer"
      :body-style="{ paddingBottom: '80px' }"
      :wrapStyle="{
        height: '100%',
        overflow: 'auto',
        paddingBottom: '108px'
      }"
      @close="closeTasks"
    >
      <div class="p-0">
        <div class="py-3 d-flex">
          <div v-for="user in users" :key="user.id" class="avatar-item">
            <div
              :class="user.id === selectedUserId ? 'avt-active' : 'avt'"
              @click="changeUser(user.id)"
            >
              <a-tooltip placement="bottom">
                <template slot="title"
                  >{{ user.first_name }} {{ user.last_name }}</template
                >
                <a-avatar
                  v-if="user.picture"
                  :src="
                    $Services.API_URL.slice(0, $Services.API_URL.length - 1) +
                      user.picture.url
                  "
                ></a-avatar>
                <a-avatar
                  v-else
                  :style="{ backgroundColor: user.default_color || '#fde3cf' }"
                  style="color: #fff;font-size:16px;cursor: pointer;height:32px;width:32px;line-height:32px"
                  >{{ user.first_name[0] }}</a-avatar
                >
              </a-tooltip>
            </div>
          </div>
        </div>
        <a-table
          :pagination="true"
          :rowKey="record => record.id"
          :dataSource="tasks"
          :columns="taskColumns"
          :scroll="{
            x: tableWidth,
            y: 'calc(100vh - (55px + 48px + 48px + 53px + 48px + 10px))'
          }"
        >
        <template slot="website" slot-scope="website">
          <a
            v-if="website"
            target="_blank"
            :href="website"
            >{{website}}</a
          >
        </template>
          <template slot="contacted" slot-scope="contacted, record">
            <a-checkbox
              @change="
                updateUniversity(record.id, { contacted: record.contacted })
              "
              v-model="record.contacted"
            ></a-checkbox>
          </template>
          <template slot="map_url" slot-scope="map_url, record">
            <a
              target="_blank"
              :href="
                `${map_url ||
                  'https://www.google.com/maps/search/' +
                    record.name +
                    record.state}`
              "
              >View in maps</a
            >
          </template>
          <template slot="approved" slot-scope="approved, record">
            <a-checkbox
              @change="
                updateUniversity(record.id, { approved: record.approved })
              "
              v-model="record.approved"
            ></a-checkbox>
          </template>
          <template slot="status" slot-scope="status, record">
            <a-tag class="mb-1 text-capitalize" :color="colors[status]" v-if="profile.role.type!='readonly'">
              <a-select
                :key="`${record.id}-status`"
                class="text-capitalize transparent-select"
                style="width:100%;text-transform:capitalize;color:inherit"
                @change="updateUniversity(record.id, { status: record.status })"
                v-model="record.status"
                size="small"
              >
                <a-select-option
                  v-for="(title, index) in [
                    'backlog',
                    'inprogress',
                    'ready_for_review',
                    'done'
                  ]"
                  :key="`${record.id}-${index}-${title}`"
                  :value="title"
                >
                  <span style="text-transform:capitalize">{{
                    title.split("_").join(" ")
                  }}</span>
                </a-select-option>
              </a-select>
            </a-tag>
            <a-tag class="mb-1 text-capitalize" :color="colors[status]" v-else>
              {{record.status}}
            </a-tag>
          </template>
          <span slot="actions" slot-scope="text, record">
            <a @click="openComments(record)"><a-icon type="message"/></a>
          </span>
        </a-table>
      </div>
    </a-drawer>
  </div>
</template>
<script src="./Home.js"></script>
<style src="./Home.css"></style>
<style>
.ant-progress-bg {
  -webkit-box-shadow: 0 10px 20px 0 rgba(0, 0, 0, 0.3) !important;
  box-shadow: 0 10px 20px 0 rgba(0, 0, 0, 0.3) !important;
  border-radius: 0px !important;
}

.ant-progress-inner {
  border-radius: 0px !important;
}

.actions,
.label {
  border-radius: 15px;
  -webkit-box-shadow: 0 5px 10px 0 rgba(0, 0, 0, 0.2);
  box-shadow: 0 5px 10px 0 rgba(0, 0, 0, 0.2);
  padding: 4px 10px;
  min-height: auto;
  position: relative;
  margin-right: 5px;
  margin-bottom: 5px;
  font-size: 12px;
}

.theme-bg2 {
  background: linear-gradient(-135deg, #899fd4 0%, #a389d4 100%);
}

.theme-bg {
  background: linear-gradient(-135deg, #1de9b6 0%, #1dc4e9 100%);
}

.card-event i {
  position: absolute;
  bottom: 36px;
  right: 27px;
}

.ant-table-thead > tr > th {
  background-color: #fff !important;
}

.ant-tabs-tab-active {
  color: #111 !important;
  font-weight: 600;
}
</style>