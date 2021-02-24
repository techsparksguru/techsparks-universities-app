const fs = require('fs')
const universities = require('./uni_core_place_json.json');

function toMasterSchema(u) {
    return ({
        ID: u.id,
        SOURCE: u.core.SOURCE ||null,
        NAME: u.gfields.name || (u.place_json&&u.place_json.result)?u.place_json.result.name:null || u.core.NAME || null,
        TYPE: u.core.TYPE || null,
        ESTABLISHED: u.core.ESTABLISHED || null,
        CITY: u.gfields.city || u.core.CITY,
        STATE_UT: u.gfields.state || u.core.STATE_UT,
        WEBSITE: u.gfields.website || u.core.WEBSITE || null,
        COUNTRY: u.gfields.country || u.core.COUNTRY || null,
        PARENT_SECTION_NAME: u.core.PARENT_SECTION_NAME || null,
        OTHER: {
            ...JSON.parse(u.core.OTHER),
            district: u.gfields.district || null,
            formatted_address: u.gfields.formatted_address || null,
        },
        SPECIALIZATION: JSON.parse(u.core.OTHER).Specialization || null,
        INTERNATIONAL_PHONE_NUMBER: u.gfields.international_phone_number || null,
        PLACE_ID: u.gfields.place_id || null,
        GEOMETRY: u.gfields.geometry || null,
        PLUS_CODE: u.gfields.plus_code || null,
        MAP_URL: u.gfields.map_url || null,
    })
}

function toAppSchema(u) {
    return ({
        id: u.id,
        source: u.core.SOURCE ||null,
        name: u.gfields.name || (u.place_json&&u.place_json.result)?u.place_json.result.name:null || u.core.NAME || null,
        type: u.core.TYPE || null,
        established: u.core.ESTABLISHED || null,
        city: u.gfields.city || u.core.CITY || null,
        state: u.gfields.state || u.core.STATE_UT || null,
        website: u.gfields.website || u.core.WEBSITE || null,
        country: u.gfields.country || u.core.COUNTRY || null,
        parent_section_name: u.core.PARENT_SECTION_NAME || null,
        district: u.gfields.district || null,
        wikipedia_url: JSON.parse(u.core.OTHER).wikipedia_url||JSON.parse(u.core.OTHER)['Wiki URL'] || null,
        formatted_address: u.gfields.formatted_address || null,
        specialization: JSON.parse(u.core.OTHER).Specialization || null,
        international_phone_number: u.gfields.international_phone_number || null,
        place_id: u.gfields.place_id || null,
        geometry: u.gfields.geometry || null,
        plus_code: u.gfields.plus_code || null,
        map_url: u.gfields.map_url || null,
    })
}

function getAddressComponents(data) {
    const dict = {
        postal_code: "pincode",
        locality: "city",
        administrative_area_level_2: "district",
        administrative_area_level_1: "state",
        country: "country"
    };
    var obj = {};
    data.address_components.map(({
        types,
        long_name
    }) => {
        obj[dict[types[0]] || types[0]] = long_name || '';
    });
    if (obj.pincode) obj.pincode = parseInt(obj.pincode);

    var cleanObj = {
        name: data.name,
        formatted_address: data.formatted_address,
        geometry: data.geometry,
        map_url: data.url,
        international_phone_number: data.international_phone_number,
        website: data.website,
        place_id: data.place_id,
        plus_code: data.plus_code
    }
    Object.values(dict).map(field => cleanObj[field] = obj[field])
    return cleanObj;
}

function cleanUniversity(university) {
    university.gfields = university.place_json&&university.place_json.result?getAddressComponents(university.place_json.result):{}
    return university
  }
  
let cleaned = universities.map(u=>cleanUniversity(u))

let MASTER_DATA = cleaned.map(u=>toMasterSchema(u))
let APP_DATA = cleaned.map(u=>toAppSchema(u))
let Mdata = JSON.stringify(MASTER_DATA);
let Adata = JSON.stringify(APP_DATA);
fs.writeFileSync(`./MASTER_DATA.json`, Mdata);
fs.writeFileSync(`./APP_DATA.json`, Adata);