'use strict';
const {
  sanitizeEntity
} = require('strapi-utils');
const sqlite3 = require('sqlite3').verbose();
const dbLocation = ".tmp/data.db";
/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const checkUserHasAccess = (ctx, next) => {
  return new Promise(async (resolve, reject) => {
    let req_states = ctx.query.state ? ctx.query.state.split(',') : [];
    let req_districts = ctx.query.district ? ctx.query.district.split(',') : [];
    let userAccess = false
    const id = ctx.state.user.id
    const role = ctx.state.user.role.type

    if (role === 'admin'||role === 'readonly') {
      resolve(true)
    }
    if (role === 'public') {
      resolve(userAccess);
    }
    // open the database
    let db = new sqlite3.Database(dbLocation, (err) => {
      if (err) {
        return console.error(err.message);
      }
    });

    if (id && role === 'authenticated') {
      // Query to fetch record from DB
      let sql = "SELECT * FROM universitiesaccesses WHERE user = ? ";

      db.get(sql, [id], (err, row) => {
        if (err) {
          resolve(userAccess);
          return console.error(err.message);
        } else {
          // If query fetch record ie. user exist in strapi
          if (row) {
            let {
              states = [], districts = []
            } = JSON.parse(row.access) || {}
            // req_states = Array.from(new Set([...req_states, ...states]))
            // req_districts = Array.from(new Set([...req_districts, ...districts]))
            if (req_states.length) {
              ctx.query.state = req_states.filter(state => states.includes(state))
              ctx.query.state = ctx.query.state.join(',')
            }
            if (req_districts.length) {
              ctx.query.district = req_districts.filter(district => districts.includes(district))
              ctx.query.district = ctx.query.district.join(',')
            }
            userAccess = true;
            resolve(userAccess);
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

const getStats = (ctx, next) => {
  return new Promise(async (resolve, reject) => {
    let req_states = ctx.query.state ? ctx.query.state.split(',') : [];
    let req_districts = ctx.query.district ? ctx.query.district.split(',') : [];
    let stats = {
      "failure": 0,
      "inprogress": 0,
      "success": 0,
      "backlog": 0,
      "contacted": 0,
      "count": 0
    }
    const state = req_states[0]

    // open the database
    let db = new sqlite3.Database(dbLocation, (err) => {
      if (err) {
        return console.error(err.message);
      }
    });

    let sql = "SELECT count(name) as AGG , 'count' as 'condition'  FROM universities  where state = ? UNION SELECT count(contacted) as AGG,  'contacted' as 'condition'  FROM universities where contacted = true and state = ? UNION SELECT count(status) as AGG,  'backlog' as 'condition' from universities where status = 'backlog' and state = ? UNION SELECT count(status) as AGG, 'success' as 'condition' from universities where status = 'success' and state = ? UNION SELECT count(status) as AGG,  'inprogress' as 'condition' from universities where status = 'inprogress' and state = ? UNION SELECT count(status) as AGG, 'failure' as 'condition'  from universities where status = 'failure' and state = ?";

    db.all(sql, [state, state, state, state, state, state], (err, rows) => {
      if (err) {
        resolve(stats);
        return console.error(err.message);
      } else {
        var obj = {}
        rows.map(ag => obj[ag.condition] = ag.AGG)
        resolve(obj);
      }
    });

    // close the database connection
    db.close((err) => {
      if (err) {
        return console.error(err.message);
      }
    });

  })
}

const getStatus = (ctx, next) => {
    return new Promise(async (resolve, reject) => {
      let req_states = ctx.query.state ? ctx.query.state.split(',') : [];
      let req_districts = ctx.query.district ? ctx.query.district.split(',') : [];
      let stats = []
      const state = req_states[0]
  
      // open the database
      let db = new sqlite3.Database(dbLocation, (err) => {
        if (err) {
          return console.error(err.message);
        }
      });
  
      let sql = "SELECT * FROM universities LEFT JOIN tasks ON universities.id=tasks.university";
  
      db.all(sql, [], (err, rows) => {
        if (err) {
          resolve(stats);
          return console.error(err.message);
        } else {
            console.log(rows)
          resolve(rows);
        }
      });
  
      // close the database connection
      db.close((err) => {
        if (err) {
          return console.error(err.message);
        }
      });
  
    })
  }

module.exports = {
  async find(ctx) {
    let entities;
    let userAccess = true;
    let query = ctx.query
    console.log(ctx.query)
    try {
      userAccess = await checkUserHasAccess(ctx);
    } catch (err) {
      console.log(err)
    }
    console.log(ctx.query)
    if (!userAccess) {
      return ctx.throw(403, ' Forbidden Error : User dont have access !!! ');
    }
    if (ctx.query._q) {
      entities = await strapi.services.universities.search(ctx.query);
    } else {
      entities = await strapi.services.universities.find(ctx.query);
    }

    return entities.map(entity => sanitizeEntity(entity, {
      model: strapi.models.universities
    }));
  },
  async stats(ctx) {
    let entities;
    let stats;
    let query = ctx.query
    console.log('in stats')
    try {
      stats = await getStats(ctx);
    } catch (err) {
      console.log(err)
    }
    return stats;
  },
  async status(ctx) {
    let entities;
    let stats;
    let query = ctx.query
    console.log('in stats')
    try {
      stats = await getStatus(ctx);
    } catch (err) {
      console.log(err)
    }
    return stats;
  },
};
