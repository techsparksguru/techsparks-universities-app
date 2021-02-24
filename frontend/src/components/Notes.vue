<template>
  <div class="p-0">
    <a-list
      v-if="comments.length"
      :dataSource="comments"
      :header="
        `${comments.length} ${comments.length > 1 ? 'comments' : 'comment'}`
      "
      itemLayout="horizontal"
    >
      <a-list-item slot="renderItem" slot-scope="item, index">
        <a-comment
          :author="item.user.first_name + ' ' + item.user.last_name"
          :avatar="item.avatar"
          :content="item.message"
        >
          <template slot="datetime">
            {{ moment(item.created_at).format("ll h:mm a") }}
          </template>
          <template slot="avatar">
            <a-avatar
              v-if="item.user.picture"
              :src="
                $Services.API_URL.slice(0, $Services.API_URL.length - 1) +
                  item.user.picture.url
              "
            ></a-avatar>

            <a-avatar
              v-else
              :style="{
                backgroundColor: profile.default_color || '#fde3cf'
              }"
              style="color: #fff;font-size:14px;cursor: pointer;margin-right:2px;height:28px;width:28px;line-height:28px"
            >
              {{ item.user.first_name[0] }}</a-avatar
            >
          </template>
        </a-comment>
      </a-list-item>
    </a-list>
    <a-comment v-if="profile.role.type!='readonly'">
      <template slot="avatar">
        <a-avatar
          v-if="profile.picture"
          :src="
            $Services.API_URL.slice(0, $Services.API_URL.length - 1) +
              profile.picture.url
          "
        ></a-avatar>

        <a-avatar
          v-else
          :style="{
            backgroundColor: profile.default_color || '#fde3cf'
          }"
          style="color: #fff;font-size:14px;cursor: pointer;margin-right:2px;height:28px;width:28px;line-height:28px"
          >{{ profile.first_name[0] }}</a-avatar
        >
      </template>
      <div slot="content" >
        <a-form-item>
          <a-textarea :rows="4" v-model="message_payload.message"></a-textarea>
        </a-form-item>
        <a-form-item>
          <a-button
            htmlType="submit"
            :loading="messaging"
            @click="createComments"
            type="primary"
            >Add Comment
          </a-button>
        </a-form-item>
      </div>
    </a-comment>
  </div>
</template>
<script>
import moment from "moment";
export default {
  props: ["university"],
  created() {
    console.log('getting commenys')
    this.fetchComments();
  },
  mounted() {
    this.message_payload = {
      message: null,
      university: this.university
    };
  },
  data() {
    return {
      profile: JSON.parse(localStorage.getItem("profile")),
      comments: [],
      messaging: false,
      message_payload: {
        message: null,
        university: null
      }
    };
  },
  methods: {
    moment,
    fetchComments(params = {}) {
      var that = this;
      this.$Services.messages
        .retrive({
          resource: `${this.$Services.messages.api}`,
          page: params.page,
          page_size: 10000,
          params: {
            university: this.university.id
          }
        })
        .then(({ data }) => {
          this.comments = data.results;
        })
        .catch(err => {
          console.log(err);
        });
    },
    createComments(params = {}) {
      var that = this;
      this.messaging = true;
      this.$Services.messages
        .create({
          resource: `${this.$Services.messages.api}`,
          data: this.message_payload
        })
        .then(({ data }) => {
          this.messaging = false;
          this.message_payload.message='';
          console.log(data);
          this.fetchComments();
        })
        .catch(err => {
          this.messaging = false;
          console.log(err);
        });
    }
  }
};
</script>