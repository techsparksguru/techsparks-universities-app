const fs = require('fs');
const async = require('async')
const dotenv = require('dotenv');
const axios = require('axios')
const path = require('path')
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const universities = require('./uni_core_ids.json')
let DATA = []

 const getGPlaceId = (name) => {
    name = escape(name)
    return axios.get(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${name}&inputtype=textquery&key=${process.env.GOOGLE_MAPS_API_KEY}`)
}


function prepareIDsJson() {

    async.eachLimit(universities, 10, function (university, callback) {
            getGPlaceId(university.NAME).then((response) => {
                DATA.push({
                    id:university.ID,
                    core: university,
                    candidates: response.data.candidates,
                    place_id: response.data.candidates.length ? response.data.candidates[0].place_id : ''
                })
                callback(); // ... so we tell async we're done
            }).catch((err) => {
                console.log('.')
                if (!(err.response && err.response.data)) {
                    console.log(err)
                }
                DATA.push({
                    id:university.ID,
                    core: university,
                    candidates: [],
                    place_id: '',
                    place_id_error: (err.response && err.response.data) ? err.response.data : 'something went wrong'
                })
                callback(); // ... so we tell async we're done
            })
        },
        function (err) {
            if (err)
                console.log(err);
            else {
                let data = JSON.stringify(DATA);
                fs.writeFileSync('./uni_core_place_ids.json', data);
                console.log(DATA.length)
            }
        });
}


prepareIDsJson()