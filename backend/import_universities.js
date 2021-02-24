const _ = require("lodash");
const request = require("request");
const parse = require("csv-parse");
var strapi = require("strapi")();
var fs = require("fs");
const StreamArray = require("stream-json/streamers/StreamArray");
const through2 = require("through2");
// const remoteLink = "..."
const localFile = "./data/universities.json";
async function fetchData() {
  return new Promise((resolve) => {
    data = [];
    header = null;
    // source = request(remoteLink)
    source = fs.createReadStream(localFile);
    resolve(source);
  });
}
async function initStrapi() {
  await strapi.load();
  //   await strapi.runBootstrapFunctions();
  return strapi;
}
async function main() {
  console.log("Started importing json file.\n\n\n");
  var [strapi, stream] = await Promise.all([initStrapi(), fetchData()]);
  stream
    .pipe(StreamArray.withParser())
    .pipe(
      through2.obj(async function (row, enc, callback) {
        try{
          if(typeof(row.value.established)==='string'&&row.value.established.length){
            let year = parseInt(row.value.established.split(' '))
            row.value.established = isNaN(year) ? null : year
          }
          let res = await strapi.services.universities.create(row.value);
          this.push(res);
        }
        catch(err){
          console.log(err)
          console.log('Error inserting row - ',row.value.id)
        }
        callback();
      })
    )
    .on("data", async (row) => {
      // console.log(`inserted row - ${row.id}`);
    })
    .on("error", (err) => {console.log(err)})
    .on("end", () => {
      console.log("json file imported successfully");
      strapi.stop();
    });
}
main();