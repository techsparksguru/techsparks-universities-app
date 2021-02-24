export default {
  name: "ResetPassword",
  data() {
    return {
      showLable: false,
      password: null,
      confirmPassword: null,
      id: this.$route.params.id,
      is_loading: false,
      errors: {}
    };
  },
  created() {
    this.id = this.$route.query.code;
    // this.isValidResetPasswordLink();
  },
  methods: {
    async isValidResetPasswordLink() {
      let response = await this.$Services.auth.checkResetPasswordLink(this.id);
      if (!response.data.valid) {
        this.$Services.noty.error({},"Reset Link is expired");
        setTimeout(() => {
          window.location.href = "/auth/";
        }, 10000);
      } else {
        this.id = response.data.id;
      }
    },
    passwordChange() {
      const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      const pass_re = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
      console.log('password')
      if(!pass_re.test(this.password)) {
        this.errors.password = 
        "Password must contain at least six characters, including uppercase, lowercase letters and numbers.";
        
      }
      else {
        this.errors.password = ''
      }
    },
    resetPassword() {
      const that = this;
      this.errors = {};
      const proceed = this.validateResetPassword();
      if (proceed) {
        this.is_loading = true;
        this.$Services.auth
          .ResetPassword(this.id, this.password)
          .then(() => {
            this.is_loading = false;
            this.$Services.noty.success(
              "Password reset Successfull",
              "Success"
            );
            setTimeout(() => {
              window.location.href = "/auth/";
            }, 1000);
          })
          .catch(error => {
            console.log(error)
            this.is_loading = false;
            this.$Services.noty.error("Something went wrong");
          });
      }
    },
    validateResetPassword() {
      const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      const pass_re = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
      let proceed = true;
      if (!pass_re.test(this.password)) {
        proceed = false;
        this.errors.password =
          "Password must contain at least six characters, including uppercase, lowercase letters and numbers.";
      }
      if ([null, undefined, ""].includes(this.password)) {
        proceed = false;
        this.errors.password = "Password name is required";
      }
      if ([null, undefined, ""].includes(this.confirmPassword)) {
        proceed = false;
        this.errors.confirmPassword = "Confirm password name is required";
      } else {
        if (this.password != this.confirmPassword) {
          proceed = false;
          this.errors.confirmPassword = "Passwords should match";
        } 
        else {
          this.errors.confirmPassword= "";
        }
      }
      return proceed;
    }
  }
};
