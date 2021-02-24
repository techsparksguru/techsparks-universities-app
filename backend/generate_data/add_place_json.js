const fs = require('fs');
const async = require('async')
const dotenv = require('dotenv');
const axios = require('axios')
const path = require('path')
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const universityIds = require('./uni_core_place_ids.json');
let DATA = []
let newRequests = 0
const cached_data = require('./cache_requests.json')

function getGPlaceJSON(id) {
    if(!id){
        let err = {error:true,response:{data:{status:'empty place id'}}}
        return Promise.reject(err)
    }
    let response;
    if(cached_data[id]){
        response = {data:cached_data[id]}
    }
    if(response){
        if(response.error||response.error_data||response.place_json_error){
            return Promise.reject(response)
        }
        else{
            return Promise.resolve(response)
        }
    }
    else{
        console.log(`notFound ${id} in cache`)
        newRequests++
        return axios.get(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${id}&fields=address_component,formatted_address,geometry,name,place_id,plus_code,url,international_phone_number,website&key=${process.env.GOOGLE_MAPS_API_KEY}`)
    }
}


function prepareCleanJson() {

    async.eachLimit(universityIds, 10, function (university, callback) {
            if (university.place_id) {
                getGPlaceJSON(university.place_id).then((response) => {
                    university.place_json = response.data
                    DATA.push(university)
                    if(university.place_json){
                        let data = JSON.stringify(university.place_json);
                        if(!cached_data[university.place_id]){
                            cached_data[university.place_id] = data
                        }
                    }else{
                        console.log(`no data found for ${university.place_id}`)
                    }
                    callback(); // ... so we tell async we're done
                }).catch((err) => {
                    console.log('.')
                    university.place_json_error = (err.response && err.response.data) ? err.response.data : {status:'something went wrong'}
                    DATA.push(university)
                    if(university.place_id){
                        let data = JSON.stringify(university.place_json_error);
                        if(!cached_data[university.place_id]){
                            cached_data[university.place_id] = data
                        }
                    }
                    callback(); // ... so we tell async we're done
                })
            } else {
                DATA.push(university)
                callback(); // ... so we tell async we're done
            }
        },
        function (err) {
            if (err)
                console.log(err);
            else {
                let data = JSON.stringify(DATA);
                fs.writeFileSync('uni_core_place_json.json', data);
                let c_data = JSON.stringify(cached_data);
                fs.writeFileSync('cache_requests.json', c_data);
                console.log({newRequests})
                console.log({DATA:DATA.length})
            }
        });
}
prepareCleanJson()