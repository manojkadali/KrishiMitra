const FormData = require('form-data');
const axios = require('axios');

// 1x1 transparent PNG Base64
const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
const buffer = Buffer.from(pngBase64, "base64");

async function test() {
    const form = new FormData();
    form.append('image', buffer, {
        filename: 'test_leaf.png',
        contentType: 'image/png'
    });
    try {
        console.log("Sending synthetic 1x1 image buffer to API...");
        const res = await axios.post('http://127.0.0.1:8000/predict', form, { headers: form.getHeaders() });
        console.log("SUCCESS:", res.data);
    } catch (e) {
        console.log("PYTHON ERROR MESSAGE =>", e.response ? e.response.data : e.message);
    }
}
test();
