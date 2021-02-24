import {
  API_URL
} from "@/config"
export default {
  name: "Account",
  components: {
  },
  data() {
    return {
      showLable: true,
      API_URL,
      errors: {},
      payload: {
        id: null,
        email: null,
        first_name: null,
        last_name: null,
        default_color: null,
        picture: {
          url: null
        }
      },
      is_loading: false,
      loading: false
    };
  },
  created() {
    this.getProfile()
  },
  methods: {
    customRequest(evt) {
      var formData = new FormData();
      formData.append('files', evt.file);
      formData.append('refId', this.payload.id);
      formData.append('ref', 'user');
      formData.append('source', 'users-permissions');
      formData.append('field', 'picture');
      this.loading = true
      this.$Services.assets
        .create({
          data: formData
        })
        .then(data => {
          console.log(data)
          this.getProfile()
          this.loading = false
        }).catch(err => {
          this.loading = false
        })
    },
    getProfile() {
      const that = this;
      this.$Services.users.list({
        resource: this.$Services.users.api + 'me/',
      }).then(({
        data
      }) => {
        console.log(data)
        localStorage.setItem("profile", JSON.stringify(data));
        let payload = JSON.parse(localStorage.getItem("profile"));
        Object.keys(this.payload).map(key => {
          this.payload[key] = payload[key] || null
        })
      });
    },
    updateProfile() {
      const that = this;
      this.errors = {}
      if (this.validateProfile()) {
        this.is_loading = true;
        this.$Services.users
          .update({
            resource: this.$Services.users.api + 'me/',
            data: this.payload
          })
          .then(
            () => {
              that.$Services.noty.success("Profile Updated Successfully");
              that.is_loading = false;
              that.getProfile();
            },
            (err) => {
              that.$Services.noty.error(err);
              that.is_loading = false;
            }
          );
      }
    },
    validateProfile() {
      const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

      let proceed = true;
      if ([null, undefined, ''].includes(this.payload.email)) {
        proceed = false;
        this.errors.email = 'Email is required'
      }
      if (!re.test(String(this.payload.email).toLowerCase())) {
        proceed = false;
        this.errors.email = 'Email is invalid'
      }
      if ([null, undefined, ''].includes(this.payload.first_name)) {
        proceed = false;
        this.errors.first_name = 'First name is required'
      }
      if ([null, undefined, ''].includes(this.payload.last_name)) {
        proceed = false;
        this.errors.last_name = 'Last name is required'
      }
      return proceed;
    }
  }
};