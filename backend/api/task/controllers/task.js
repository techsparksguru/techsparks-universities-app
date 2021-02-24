'use strict';

const universities = require("../../universities/controllers/universities");
const _ = require('lodash');
const sqlite3 = require('sqlite3').verbose();
const dbLocation = ".tmp/data.db";
/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const getUserAccess = (ctx, next) => {
  return new Promise(async (resolve, reject) => {
    const {
      id
    } = ctx.params;
    const role = ctx.state.user.role.type
    let userAccess = false
    // open the database
    let db = new sqlite3.Database(dbLocation, (err) => {
      if (err) {
        return console.error(err.message);
      }
    });

    if (id) {
      // Query to fetch record from DB
      let sql = "SELECT * FROM universitiesaccesses WHERE user = ? ";

      db.get(sql, [id], (err, row) => {
        if (err) {
          resolve(userAccess);
          return console.error(err.message);
        } else {
          // If query fetch record ie. user exist in strapi
          if (row) {
            userAccess = JSON.parse(row.access) || {}
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


module.exports = {
  async accessChanged(ctx) {
    const {
      id
    } = ctx.params;
    let userAccess = await getUserAccess(ctx);
    
    let tasks = await strapi.services.task.find({
      user: id
    }, {});

    let req_universities = ctx.request.body.universities
    let existing_universities = userAccess.universities || []
    console.log({req_universities,existing_universities})

    let create_university_tasks = _.difference(req_universities, existing_universities)
    let close_university_tasks = _.difference(existing_universities, req_universities)
    console.log(create_university_tasks,close_university_tasks)

    let update_tasks = []
    let new_tasks = []

    create_university_tasks.map(university => {
      let index = tasks.map(t => t.university).indexOf(university)
      if (index === -1) {
        new_tasks.push({
          user: id,
          university,
          status: 'backlog',
          approved: false,
          active: true
        })
      } else {
        let task = Object.assign({}, tasks[index])
        if (!task.active) {
          task.active = true
          update_tasks.push(task)
        }
      }
    })


    close_university_tasks.map(university => {
      let index = tasks.map(t => t.university).indexOf(university)
      if (index != -1) {
        let task = Object.assign({}, tasks[index])
        if (task.active) {
          task.active = false
          update_tasks.push(task)
        }
      }
    })

    let creates = new_tasks.map(task =>
      strapi.services.task.create(task)
    )
    let updates = update_tasks.map(task =>
      strapi.services.task.update({
        id: task.id
      }, task)
    )

    return Promise.all([...creates, ...updates])
  },
};
