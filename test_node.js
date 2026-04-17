const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

async function test() {
    const form = new FormData();
    form.append('image', fs.createReadStream('sample_leaf.jpg'));
    try {
        const res = await axios.post('http://127.0.0.1:8000/predict', form, { headers: form.getHeaders() });
        console.log(res.data);
    } catch (e) {
        console.log("ERROR STATUS:", e.response ? e.response.status : "NO RESPONSE");
        console.log("ERROR DATA:", e.response ? e.response.data : e.message);
    }
}
test();
