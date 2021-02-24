const { parseMultipartData, sanitizeEntity } = require('strapi-utils');
'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async create(ctx) {
        let entity;
        if (ctx.is('multipart')) {
          const { data, files } = parseMultipartData(ctx);
          entity = await strapi.services.message.create(data, { files });
        } else {
        let msg  = ctx.request.body
        msg.user = ctx.state.user.id
          entity = await strapi.services.message.create(msg);
        }
        return sanitizeEntity(entity, { model: strapi.models.message });
      },
};
