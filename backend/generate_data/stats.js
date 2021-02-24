const { printTable } = require('console-table-printer');

const universities = require('./MASTER_DATA.json');
const universitiesApp = require('./APP_DATA.json');
const universitiesCore = require('./universities.json');

const data = [getStats(universitiesCore,'Core'),getStats(universities,'Final'),getStats(universitiesApp,'DB_d')]

function getStats(universities,name){
    var firstUnique = (value, index, array) => array.indexOf(value) === index;
    if(name==="Core"){
        universities.map(u=>u.OTHER=JSON.parse(u.OTHER))
    }
    // var numUnique = strArray.filter(firstUnique).length;
    // var allUnique = strArray.length === numUnique; 
    if(name === 'DB_d'){
        const stats = {
            Dataset:name,
            total:universities.length,
            // id:[universities.filter(u=>(u.id||u.id===0)).length,universities.filter(u=>!(u.id||u.id===0)).length].join('/'),
            SOURCE:[universities.filter(u=>u.source).length,universities.filter(u=>!u.source).length].join('/'),
            NAME:[universities.filter(u=>u.name).length,universities.filter(u=>!u.name).length].join('/'),
            TYPE:[universities.filter(u=>u.type).length,universities.filter(u=>!u.type).length].join('/'),
            EST:[universities.filter(u=>u.established).length,universities.filter(u=>!u.established).length].join('/'),
            CITY:[universities.filter(u=>u.city).length,universities.filter(u=>!u.city).length].join('/'),
            STATE_UT:[universities.filter(u=>u.state).length,universities.filter(u=>!u.state).length].join('/'),
            WEBSITE:[universities.filter(u=>u.website).length,universities.filter(u=>!u.website).length].join('/'),
            COUNTRY:[universities.filter(u=>u.country).length,universities.filter(u=>!u.country).length].join('/'),
            PARENT_SEC:[universities.filter(u=>u.parent_section_name).length,universities.filter(u=>!u.parent_section_name).length].join('/'),
            // other:[universities.filter(u=>u.other).length,universities.filter(u=>!u.other).length].join('/'),
            district:[universities.filter(u=>u.district).length,universities.filter(u=>!u.district).length].join('/'),
            wiki_url:[universities.filter(u=>u.wikipedia_url||u['wiki url']).length,universities.filter(u=>!(u.wikipedia_url||u['wiki url'])).length].join('/'),
            address:[universities.filter(u=>u.formatted_address).length,universities.filter(u=>!u.formatted_address).length].join('/'),
            "SPECIAL..":[universities.filter(u=>u.specialization||u['specialization']).length,universities.filter(u=>!u.specialization||u['specialization']).length].join('/'),
            PHONE:[universities.filter(u=>u.international_phone_number).length,universities.filter(u=>!u.international_phone_number).length].join('/'),
            PLACE_ID:[universities.filter(u=>u.place_id).length,universities.filter(u=>!u.place_id).length].join('/'),
            // geometry:[universities.filter(u=>u.geometry).length,universities.filter(u=>!u.geometry).length].join('/'),
            // plus_code:[universities.filter(u=>u.plus_code).length,universities.filter(u=>!u.plus_code).length].join('/'),
            MAP:[universities.filter(u=>u.map_url).length,universities.filter(u=>!u.map_url).length].join('/'),
        }
        return stats
    }
    else{

    const stats = {
        Dataset:name,
        total:universities.length,
        // ID:[universities.filter(u=>(u.ID||u.ID===0)).length,universities.filter(u=>!(u.ID||u.ID===0)).length].join('/'),
        SOURCE:[universities.filter(u=>u.SOURCE).length,universities.filter(u=>!u.SOURCE).length].join('/'),
        NAME:[universities.filter(u=>u.NAME).length,universities.filter(u=>!u.NAME).length].join('/'),
        TYPE:[universities.filter(u=>u.TYPE).length,universities.filter(u=>!u.TYPE).length].join('/'),
        EST:[universities.filter(u=>u.ESTABLISHED).length,universities.filter(u=>!u.ESTABLISHED).length].join('/'),
        CITY:[universities.filter(u=>u.CITY).length,universities.filter(u=>!u.CITY).length].join('/'),
        STATE_UT:[universities.filter(u=>u.STATE_UT).length,universities.filter(u=>!u.STATE_UT).length].join('/'),
        WEBSITE:[universities.filter(u=>u.WEBSITE).length,universities.filter(u=>!u.WEBSITE).length].join('/'),
        COUNTRY:[universities.filter(u=>u.COUNTRY).length,universities.filter(u=>!u.COUNTRY).length].join('/'),
        PARENT_SEC:[universities.filter(u=>u.PARENT_SECTION_NAME).length,universities.filter(u=>!u.PARENT_SECTION_NAME).length].join('/'),
        // OTHER:[universities.filter(u=>u.OTHER).length,universities.filter(u=>!u.OTHER).length].join('/'),
        district:[universities.filter(u=>u.OTHER.district).length,universities.filter(u=>!u.OTHER.district).length].join('/'),
        wiki_url:[universities.filter(u=>u.OTHER.wikipedia_url||u.OTHER['Wiki URL']).length,universities.filter(u=>!(u.OTHER.wikipedia_url||u.OTHER['Wiki URL'])).length].join('/'),
        address:[universities.filter(u=>u.OTHER.formatted_address).length,universities.filter(u=>!u.OTHER.formatted_address).length].join('/'),
        "SPECIAL..":[universities.filter(u=>u.SPECIALIZATION||u.OTHER['Specialization']).length,universities.filter(u=>!u.SPECIALIZATION||u.OTHER['Specialization']).length].join('/'),
        PHONE:[universities.filter(u=>u.INTERNATIONAL_PHONE_NUMBER).length,universities.filter(u=>!u.INTERNATIONAL_PHONE_NUMBER).length].join('/'),
        PLACE_ID:[universities.filter(u=>u.PLACE_ID).length,universities.filter(u=>!u.PLACE_ID).length].join('/'),
        // GEOMETRY:[universities.filter(u=>u.GEOMETRY).length,universities.filter(u=>!u.GEOMETRY).length].join('/'),
        // PLUS_CODE:[universities.filter(u=>u.PLUS_CODE).length,universities.filter(u=>!u.PLUS_CODE).length].join('/'),
        MAP:[universities.filter(u=>u.MAP_URL).length,universities.filter(u=>!u.MAP_URL).length].join('/'),
    }
    return stats
}
}

printTable(data);