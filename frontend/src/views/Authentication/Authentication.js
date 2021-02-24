import router from "@/router";
import VueRecaptcha from "vue-recaptcha";
import Config from "../../config";

export default {
  components: { VueRecaptcha },
  name: "Authentication",
  data() {
    return {
      tab: "login",
      config: Config,
      hours: new Date().getHours(),
      is_loading: false,
      showLable: false,
      agreed: false,
      tvisible: false,
      payload: {
        //login fields
        email: null,
        password: null,
        //signup fields
        first_name: null,
        last_name: null,
        company_name: null,
        captcha: null
      },
      errors: {}
    };
  },
  methods: {
    onCaptchaVerified(recaptchaToken) {
      this.payload.captcha = recaptchaToken;
    },
    onCaptchaExpired() {
      this.$refs.recaptcha.reset();
      this.payload.captcha = null;
    },
    changeTab(tab) {
      this.errors = {};
      this.tab = tab;
    },
    login() {
      const that = this;
      this.errors = {};
      const proceed = this.validateLogin();
      if (proceed) {
        this.is_loading = true;
        this.$Services.auth
          .login(this.payload.email, this.payload.password, this.payload.captcha)
          .then(success => {
            console.log(success);
            this.is_loading = false;
            this.$Services.auth.setToken(success.data.jwt);
            this.profile_data = success.data.user;
            localStorage.setItem("profile", JSON.stringify(this.profile_data));
            router.push({
              path: "/account"
            });
            // this.$Services.profile.list({}).then(data => {
            //   this.$Services.noty.success(
            //     "Successfully authenticated",
            //     "Welcome"
            //   );
            //   setTimeout(() => {
            //     router.push({
            //       path: "/account"
            //     });
            //   }, 1000);
            // });
          })
          .catch(error => {
            console.log(error)
            let msg = "Something went wrong"
            try{
              msg = error.response.data.data[0].messages[0].message
            }
            catch(err){
              console.log(err)
            }
            console.log(error.response)
            this.is_loading = false;
            this.$Services.noty.error({},msg);
          });
      }
    },
    signup() {
      const that = this;
      this.errors = {};
      const proceed = this.validateSignup();
      if (proceed) {
        this.is_loading = true;
        let user = Object.assign({}, this.payload);
        delete user.password;
        this.$Services.auth
          .signup(user)
          .then(success => {
            this.is_loading = false;
            this.$Services.auth.setToken(success.data.token);
            localStorage.setItem("profile", JSON.stringify(success.data.user));
            this.$Services.noty.success(
              "Verify your email to get started",
              "Welcome"
            );
          })
          .catch(error => {
            this.is_loading = false;
            if (error.response.data.company_name) {
              this.notification = true;
              this.message = error.response.data.company_name[0]
              const h = this.$createElement;
              this.$info({
                title: 'Alert',
                content: h('div', {}, [
                  h('p', 'Company name already exists.')
                ]),
                onOk() { },
              });
            } else {
              this.$Services.noty.error(error);
            }
          });
      }
    },
    resetPassword() {
      const that = this;
      this.errors = {};
      const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

      let proceed = true;
      if (
        !re.test(String(this.payload.email).toLowerCase()) ||
        [null, undefined, ""].includes(this.payload.email)
      ) {
        proceed = false;
        this.errors.email = "Enter a valid email";
      }
      // if ([null, undefined, ""].includes(this.payload.captcha)) {
      //   proceed = false;
      //   this.errors.captcha = "Captcha is required";
      // }
      if (proceed) {
        this.is_loading = true;
        this.$Services.auth
          .forgotPassword(this.payload.email)
          .then(success => {
            this.is_loading = false;
            this.$Services.noty.success(
              "Password reset link has been sent to your email",
              "Success"
            );
          })
          .catch(error => {
            this.is_loading = false;
            this.$Services.noty.error(error);
          });
      }
    },
    // To validate the Login form
    validateLogin() {
      const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      const pass_re = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
      let proceed = true;
      if ([null, undefined, ""].includes(this.payload.email)) {
        proceed = false;
        this.errors.email = "Work email is required";
      }
      if (!re.test(String(this.payload.email).toLowerCase())) {
        proceed = false;
        this.errors.email = "Work email is invalid";
      }
      if (!pass_re.test(this.payload.password)) {
        proceed = false;
        this.errors.password =
          "Password must contain at least six characters, including uppercase, lowercase letters and numbers.";
      }
      if ([null, undefined, ""].includes(this.payload.password)) {
        proceed = false;
        this.errors.password = "Password is required";
      }
      if (this.config.USE_CAPTCHA&&[null, undefined, ""].includes(this.payload.captcha)) {
        proceed = false;
        this.errors.captcha = "Captcha is required";
      }
      return proceed;
    },
    // To validate the Signup form
    validateSignup() {
      const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

      let proceed = true;
      if ([null, undefined, ""].includes(this.payload.email)) {
        proceed = false;
        this.errors.email = "Work email is required";
      }
      if (!re.test(String(this.payload.email).toLowerCase())) {
        proceed = false;
        this.errors.email = "Work email is invalid";
      }
      if ([null, undefined, ""].includes(this.payload.company_name)) {
        proceed = false;
        this.errors.company_name = "Company name is required";
      }
      if ([null, undefined, ""].includes(this.payload.first_name)) {
        proceed = false;
        this.errors.first_name = "First name is required";
      }
      if ([null, undefined, ""].includes(this.payload.last_name)) {
        proceed = false;
        this.errors.last_name = "Last name is required";
      }
      if (this.config.USE_CAPTCHA&&[null, undefined, ""].includes(this.payload.captcha)) {
        proceed = false;
        this.errors.captcha = "Captcha is required";
      }
      if (!this.agreed) {
        proceed = false;
        this.errors.agreed = "Agree to terms and conditions to get started";
      }
      return proceed;
    }
  }
};
