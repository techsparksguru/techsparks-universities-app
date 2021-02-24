const sqlite3 = require('sqlite3').verbose();
const dbLocation = ".tmp/data.db";

module.exports = strapi => {
  return {
    initialize: function (cb) {
      strapi.app.use(async (ctx, next) => {
        let userAccess = false;
        if (ctx.method == 'POST' && ctx.url == '/candidates') {
          userAccess = await checkUserHasAccess(ctx, next);
        }

        // Check for user Exist or not. If user exist then return user exist error
        if (!userAccess) {
          return ctx.throw(403, ' Forbidden Error : User dont have access !!! ');
        }
        await next();
      });

      // Function to check the user exist or not
      const checkUserHasAccess = (ctx, next) => {
        console.log('checking user access...');
        return new Promise((resolve, reject) => {
          let req_states = ctx.request.params.state ? ctx.request.params.state.split(',') : [];
          let req_districts = ctx.request.params.district ? ctx.request.params.district.split(',') : [];
          let userAccess = false
          const { id, isAdmin = false } = await strapi.plugins[
            'users-permissions'
          ].services.jwt.getToken(ctx);

          // open the database
          let db = new sqlite3.Database(dbLocation, (err) => {
            if (err) {
              return console.error(err.message);
            }
          });

          if (id && !isAdmin) {
            // Query to fetch record from DB
            let sql = "SELECT * FROM universitiesaccesses WHERE user = ? ";

            db.get(sql, [email], (err, row) => {
              if (err) {
                return console.error(err.message);
              } else {
                // If query fetch record ie. user exist in strapi
                if (row) {
                  let { states, districts } = row.access
                  ctx.request.params.state = req_states.length ? req_states.filter(state => states.includes(state)) : states
                  ctx.request.params.district = req_districts.length ? req_districts.filter(district => districts.includes(district)) : districts
                  userAccess = true;
                }
                resolve(userAccess);
              }
            });
          }

          // close the database connection
          db.close((err) => {
            if (err) {
              return console.error(err.message);
            }
          });

        })
      }

      cb();
    }
  };
};