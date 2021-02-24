<template>
  <div class="content py-4 pr-3">
    <div
      class="d-flex flex-column"
      style="height:calc(100vh - ( 55px + 3rem + 29px ))"
    >
      <div class="px-3 d-flex" v-if="['admin','readonly'].includes(profile.role.type)">
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
                >{{ user.first_name?user.first_name[0]:'NA' }}</a-avatar
              >
            </a-tooltip>
          </div>
        </div>
      </div>
      <div
        class="flex justify-center bg-white p-3 pt-0 my-3  overflow-x-scroll"
        style="height: -webkit-fill-available;overflow-y:scroll"
        @scroll="onScroll"
      >
        <div
          class="d-flex eq-flex"
        >
          <div
            v-for="column in tcolumns"
            :key="column.title"
            style="position:relative;min-height: 100vh;"
            class="bg-gray-100 rounded-lg px-3 pb-3 column-width rounded mr-4"
          >
            <div
              v-if="column.title === 'Done' && !['admin','readonly'].includes(profile.role.type)"
              style="position: absolute;top: 0px;bottom: 0px;right: 0px;left: 0px;background-color: rgb(0 0 0 / 12%);"
            ></div>
            <div
              :data-title="column.title"
              style="position: sticky;top: 0;background-color: white;margin:0 -1rem;z-index: 1"
              class="text-gray-700 py-3 font-semibold  font-sans tracking-wide text-sm shadow"
            >
            <span style="margin:0 1rem">
              {{ column.title }}  <b>({{ column.count }})</b>
            </span>
            </div>
            <!-- Draggable component comes from vuedraggable. It provides drag & drop functionality -->
            <draggable
              :list="column.tasks"
              :animation="200"
              :move="move"
              @end="onEnd"
              class="h-100"
              ghost-class="ghost-card"
              group="tasks"
            >
              <!-- Each element from here will be draggable and animated. Note :key is very important here to be unique both for draggable and animations to be smooth & consistent. -->
              <task-card
                @message-open="openComments"
                v-for="task in column.tasks"
                :key="task.id"
                :task="task"
                class="mt-3 cursor-move"
              ></task-card>
              <!-- </transition-group> -->
            </draggable>
          </div>
        </div>
      </div>
    </div>
    <a-drawer
      title="Comments"
      :width="720"
      :visible="commentsDrawer"
      :body-style="{ paddingBottom: '80px' }"
      :wrapStyle="{
        height: '100%',
        overflow: 'auto',
        paddingBottom: '108px'
      }"
      @close="closeComments"
      destroyOnClose
    >
      <notes :university="selectedUniversity"></notes>
    </a-drawer>
  </div>
</template>
<script src="./Tasks.js"></script>
<style src="./Tasks.css"></style>
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