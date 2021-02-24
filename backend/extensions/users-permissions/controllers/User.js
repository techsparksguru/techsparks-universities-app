"use strict";

const _ = require("lodash");
const { sanitizeEntity } = require("strapi-utils");
const emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const Axios = require('axios')

const sanitizeUser = (user) =>
  sanitizeEntity(user, {
    model: strapi.query("user", "users-permissions").model,
  });

const formatError = (error) => [
  { messages: [{ id: error.id, message: error.message, field: error.field }] },
];

module.exports = {
  async updateme(ctx) {
    const advancedConfigs = await strapi
      .store({
        environment: "",
        type: "plugin",
        name: "users-permissions",
        key: "advanced",
      })
      .get();

    const { id } = ctx.state.user;
    const { email, username, password } = ctx.request.body;

    const user = await strapi.plugins["users-permissions"].services.user.fetch({
      id,
    });
    if (_.has(ctx.request.body, "email") && !email) {
      return ctx.badRequest("email.notNull");
    }

    if (_.has(ctx.request.body, "username") && !username) {
      return ctx.badRequest("username.notNull");
    }

    if (
      _.has(ctx.request.body, "password") &&
      !password &&
      user.provider === "local"
    ) {
      return ctx.badRequest("password.notNull");
    }

    if (_.has(ctx.request.body, "username")) {
      const userWithSameUsername = await strapi
        .query("user", "users-permissions")
        .findOne({
          username,
        });

      if (userWithSameUsername && userWithSameUsername.id != id) {
        return ctx.badRequest(
          null,
          formatError({
            id: "Auth.form.error.username.taken",
            message: "username.alreadyTaken.",
            field: ["username"],
          })
        );
      }
    }

    if (_.has(ctx.request.body, "email") && advancedConfigs.unique_email) {
      const userWithSameEmail = await strapi
        .query("user", "users-permissions")
        .findOne({
          email: email.toLowerCase(),
        });

      if (userWithSameEmail && userWithSameEmail.id != id) {
        return ctx.badRequest(
          null,
          formatError({
            id: "Auth.form.error.email.taken",
            message: "Email already taken",
            field: ["email"],
          })
        );
      }
      ctx.request.body.email = ctx.request.body.email.toLowerCase();
    }

    let updateData = {
      ...ctx.request.body,
    };

    if (_.has(ctx.request.body, "password") && password === user.password) {
      delete updateData.password;
    }

    const data = await strapi.plugins["users-permissions"].services.user.edit(
      {
        id,
      },
      updateData
    );

    ctx.send(sanitizeUser(data));
  },

  async me(ctx) {
    const { id } = ctx.state.user;
    let user = await strapi.plugins["users-permissions"].services.user.fetch({
      id,
    });

    if (!user) {
      return ctx.badRequest(null, [
        { messages: [{ id: "No authorization header was found" }] },
      ]);
    }

    ctx.body = sanitizeUser(user);
  },

  async create(ctx) {
    const pluginStore = await strapi.store({
      environment: "",
      type: "plugin",
      name: "users-permissions",
    });

    const settings = await pluginStore.get({
      key: "advanced",
    });

    if (!settings.allow_register) {
      return ctx.badRequest(
        null,
        formatError({
          id: "Auth.advanced.allow_register",
          message: "Register action is currently disabled.",
        })
      );
    }

    const params = {
      ..._.omit(ctx.request.body, ["confirmed", "resetPasswordToken"]),
      provider: "local",
    };

    // Password is required.
    if (!params.password) {
      return ctx.badRequest(
        null,
        formatError({
          id: "Auth.form.error.password.provide",
          message: "Please provide your password.",
        })
      );
    }

    // Captcha is required.
    if (process.env.USE_CAPTCHA==='true'&&!params.captcha) {
      return ctx.badRequest(
        null,
        formatError({
          id: "Auth.form.error.captcha.provide",
          message: "Please provide your Captcha.",
        })
      );
    }

    // Captcha is valid.
    if (process.env.USE_CAPTCHA==='true'&&params.captcha) {
        const res = await Axios.post(
          `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_SECRETKEY}&response=${params.captcha}`, {}, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
            },
          }
        );
        success = res.data.success;
        if (!success) {
          message = res.data['error-codes'].join(' ');
          return ctx.badRequest(
            null,
            formatError({
              id: "Auth.form.error.captcha.provide",
              message,
            })
          );
        }

    }

    // Email is required.
    if (!params.email) {
      return ctx.badRequest(
        null,
        formatError({
          id: "Auth.form.error.email.provide",
          message: "Please provide your email.",
        })
      );
    }

    // Throw an error if the password selected by the user
    // contains more than two times the symbol '$'.
    if (
      strapi.plugins["users-permissions"].services.user.isHashed(
        params.password
      )
    ) {
      return ctx.badRequest(
        null,
        formatError({
          id: "Auth.form.error.password.format",
          message:
            "Your password cannot contain more than three times the symbol `$`.",
        })
      );
    }

    const role = await strapi
      .query("role", "users-permissions")
      .findOne({ type: settings.default_role }, []);

    if (!role) {
      return ctx.badRequest(
        null,
        formatError({
          id: "Auth.form.error.role.notFound",
          message: "Impossible to find the default role.",
        })
      );
    }

    // Check if the provided email is valid or not.
    const isEmail = emailRegExp.test(params.email);

    if (isEmail) {
      params.email = params.email.toLowerCase();
    } else {
      return ctx.badRequest(
        null,
        formatError({
          id: "Auth.form.error.email.format",
          message: "Please provide valid email address.",
        })
      );
    }

    params.role = params.role || role.id;
    params.password = await strapi.plugins[
      "users-permissions"
    ].services.user.hashPassword(params);
    const mdColors = [
      "#F44336",
      "#FFEBEE",
      "#FFCDD2",
      "#EF9A9A",
      "#E57373",
      "#EF5350",
      "#F44336",
      "#E53935",
      "#D32F2F",
      "#C62828",
      "#B71C1C",
      "#FF8A80",
      "#FF5252",
      "#FF1744",
      "#D50000",
      "#E91E63",
      "#FCE4EC",
      "#F8BBD0",
      "#F48FB1",
      "#F06292",
      "#EC407A",
      "#E91E63",
      "#D81B60",
      "#C2185B",
      "#AD1457",
      "#880E4F",
      "#FF80AB",
      "#FF4081",
      "#F50057",
      "#C51162",
      "#9C27B0",
      "#F3E5F5",
      "#E1BEE7",
      "#CE93D8",
      "#BA68C8",
      "#AB47BC",
      "#9C27B0",
      "#8E24AA",
      "#7B1FA2",
      "#6A1B9A",
      "#4A148C",
      "#EA80FC",
      "#E040FB",
      "#D500F9",
      "#AA00FF",
      "#673AB7",
      "#EDE7F6",
      "#D1C4E9",
      "#B39DDB",
      "#9575CD",
      "#7E57C2",
      "#673AB7",
      "#5E35B1",
      "#512DA8",
      "#4527A0",
      "#311B92",
      "#B388FF",
      "#7C4DFF",
      "#651FFF",
      "#6200EA",
      "#3F51B5",
      "#E8EAF6",
      "#C5CAE9",
      "#9FA8DA",
      "#7986CB",
      "#5C6BC0",
      "#3F51B5",
      "#3949AB",
      "#303F9F",
      "#283593",
      "#1A237E",
      "#8C9EFF",
      "#536DFE",
      "#3D5AFE",
      "#304FFE",
      "#2196F3",
      "#E3F2FD",
      "#BBDEFB",
      "#90CAF9",
      "#64B5F6",
      "#42A5F5",
      "#2196F3",
      "#1E88E5",
      "#1976D2",
      "#1565C0",
      "#0D47A1",
      "#82B1FF",
      "#448AFF",
      "#2979FF",
      "#2962FF",
      "#03A9F4",
      "#E1F5FE",
      "#B3E5FC",
      "#81D4FA",
      "#4FC3F7",
      "#29B6F6",
      "#03A9F4",
      "#039BE5",
      "#0288D1",
      "#0277BD",
      "#01579B",
      "#80D8FF",
      "#40C4FF",
      "#00B0FF",
      "#0091EA",
      "#00BCD4",
      "#E0F7FA",
      "#B2EBF2",
      "#80DEEA",
      "#4DD0E1",
      "#26C6DA",
      "#00BCD4",
      "#00ACC1",
      "#0097A7",
      "#00838F",
      "#006064",
      "#84FFFF",
      "#18FFFF",
      "#00E5FF",
      "#00B8D4",
      "#009688",
      "#E0F2F1",
      "#B2DFDB",
      "#80CBC4",
      "#4DB6AC",
      "#26A69A",
      "#009688",
      "#00897B",
      "#00796B",
      "#00695C",
      "#004D40",
      "#A7FFEB",
      "#64FFDA",
      "#1DE9B6",
      "#00BFA5",
      "#4CAF50",
      "#E8F5E9",
      "#C8E6C9",
      "#A5D6A7",
      "#81C784",
      "#66BB6A",
      "#4CAF50",
      "#43A047",
      "#388E3C",
      "#2E7D32",
      "#1B5E20",
      "#B9F6CA",
      "#69F0AE",
      "#00E676",
      "#00C853",
      "#8BC34A",
      "#F1F8E9",
      "#DCEDC8",
      "#C5E1A5",
      "#AED581",
      "#9CCC65",
      "#8BC34A",
      "#7CB342",
      "#689F38",
      "#558B2F",
      "#33691E",
      "#CCFF90",
      "#B2FF59",
      "#76FF03",
      "#64DD17",
      "#CDDC39",
      "#F9FBE7",
      "#F0F4C3",
      "#E6EE9C",
      "#DCE775",
      "#D4E157",
      "#CDDC39",
      "#C0CA33",
      "#AFB42B",
      "#9E9D24",
      "#827717",
      "#F4FF81",
      "#EEFF41",
      "#C6FF00",
      "#AEEA00",
      "#FFEB3B",
      "#FFFDE7",
      "#FFF9C4",
      "#FFF59D",
      "#FFF176",
      "#FFEE58",
      "#FFEB3B",
      "#FDD835",
      "#FBC02D",
      "#F9A825",
      "#F57F17",
      "#FFFF8D",
      "#FFFF00",
      "#FFEA00",
      "#FFD600",
      "#FFC107",
      "#FFF8E1",
      "#FFECB3",
      "#FFE082",
      "#FFD54F",
      "#FFCA28",
      "#FFC107",
      "#FFB300",
      "#FFA000",
      "#FF8F00",
      "#FF6F00",
      "#FFE57F",
      "#FFD740",
      "#FFC400",
      "#FFAB00",
      "#FF9800",
      "#FFF3E0",
      "#FFE0B2",
      "#FFCC80",
      "#FFB74D",
      "#FFA726",
      "#FF9800",
      "#FB8C00",
      "#F57C00",
      "#EF6C00",
      "#E65100",
      "#FFD180",
      "#FFAB40",
      "#FF9100",
      "#FF6D00",
      "#FF5722",
      "#FBE9E7",
      "#FFCCBC",
      "#FFAB91",
      "#FF8A65",
      "#FF7043",
      "#FF5722",
      "#F4511E",
      "#E64A19",
      "#D84315",
      "#BF360C",
      "#FF9E80",
      "#FF6E40",
      "#FF3D00",
      "#DD2C00",
      "#795548",
      "#EFEBE9",
      "#D7CCC8",
      "#BCAAA4",
      "#A1887F",
      "#8D6E63",
      "#795548",
      "#6D4C41",
      "#5D4037",
      "#4E342E",
      "#3E2723",
      "#9E9E9E",
      "#FAFAFA",
      "#F5F5F5",
      "#EEEEEE",
      "#E0E0E0",
      "#BDBDBD",
      "#9E9E9E",
      "#757575",
      "#616161",
      "#424242",
      "#212121",
      "#607D8B",
      "#ECEFF1",
      "#CFD8DC",
      "#B0BEC5",
      "#90A4AE",
      "#78909C",
      "#607D8B",
      "#546E7A",
      "#455A64",
      "#37474F",
      "#263238",
      "#000000",
      "#FFFFFF",
    ];
    params.default_color = _.sample(mdColors);
    console.log(params.default_color);
    const user = await strapi.query("user", "users-permissions").findOne({
      email: params.email,
    });

    if (user && user.provider === params.provider) {
      return ctx.badRequest(
        null,
        formatError({
          id: "Auth.form.error.email.taken",
          message: "Email is already taken.",
        })
      );
    }

    if (user && user.provider !== params.provider && settings.unique_email) {
      return ctx.badRequest(
        null,
        formatError({
          id: "Auth.form.error.email.taken",
          message: "Email is already taken.",
        })
      );
    }

    try {
      if (!settings.email_confirmation) {
        params.confirmed = true;
      }

      const user = await strapi
        .query("user", "users-permissions")
        .create(params);

      const jwt = strapi.plugins["users-permissions"].services.jwt.issue(
        _.pick(user.toJSON ? user.toJSON() : user, ["id"])
      );

      if (settings.email_confirmation) {
        const settings = await pluginStore
          .get({ key: "email" })
          .then((storeEmail) => {
            try {
              return storeEmail["email_confirmation"].options;
            } catch (error) {
              return {};
            }
          });

        settings.message = await strapi.plugins[
          "users-permissions"
        ].services.userspermissions.template(settings.message, {
          URL: `${getAbsoluteServerUrl(strapi.config)}/auth/email-confirmation`,
          USER: _.omit(user.toJSON ? user.toJSON() : user, [
            "password",
            "resetPasswordToken",
            "role",
            "provider",
          ]),
          CODE: jwt,
        });

        settings.object = await strapi.plugins[
          "users-permissions"
        ].services.userspermissions.template(settings.object, {
          USER: _.omit(user.toJSON ? user.toJSON() : user, [
            "password",
            "resetPasswordToken",
            "role",
            "provider",
          ]),
        });

        try {
          // Send an email to the user.
          await strapi.plugins["email"].services.email.send({
            to: (user.toJSON ? user.toJSON() : user).email,
            from:
              settings.from.email && settings.from.name
                ? `${settings.from.name} <${settings.from.email}>`
                : undefined,
            replyTo: settings.response_email,
            subject: settings.object,
            text: settings.message,
            html: settings.message,
          });
        } catch (err) {
          return ctx.badRequest(null, err);
        }
      }

      const sanitizedUser = sanitizeEntity(user.toJSON ? user.toJSON() : user, {
        model: strapi.query("user", "users-permissions").model,
      });
      if (settings.email_confirmation) {
        ctx.send({
          user: sanitizedUser,
        });
      } else {
        ctx.send({
          jwt,
          user: sanitizedUser,
        });
      }
    } catch (err) {
      const adminError = _.includes(err.message, "username")
        ? {
            id: "Auth.form.error.username.taken",
            message: "Username already taken",
          }
        : { id: "Auth.form.error.email.taken", message: "Email already taken" };

      ctx.badRequest(null, formatError(adminError));
    }
  },
};
