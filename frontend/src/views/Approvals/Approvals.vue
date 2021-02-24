<template>
  <div class="content py-4 pr-3">
    <div class="card-container p-0 m-0 card">
      <a-table
        :pagination="true"
        :rowKey="record => record.id"
        :dataSource="data"
        :columns="universityColumns"
        :scroll="{
          x: tableWidth,
          y: 'calc(100vh - (55px + 48px + 48px + 53px + 48px + 10px))'
        }"
      >
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
        <template slot="approved" slot-scope="approved, record">
          <a-checkbox
            @change="updateUniversity(record.id, { approved: record.approved })"
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
          <a @click="openComments(record.university)">
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
  </div>
</template>
<script src="./Approvals.js"></script>
<style src="./Approvals.css"></style>
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