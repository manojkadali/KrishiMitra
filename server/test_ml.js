const fs = require('fs');
const https = require('https');
const FormData = require('form-data');
const axios = require('axios');

async function downloadAndTest() {
    const file = fs.createWriteStream("test_leaf.jpg");
    https.get("https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Leaf_1_web.jpg/300px-Leaf_1_web.jpg", function(response) {
        response.pipe(file);
        file.on('finish', async function() {
            file.close();
            console.log("Image downloaded. Sending to ML Service...");
            
            const form = new FormData();
            form.append('image', fs.createReadStream('test_leaf.jpg'), {
                filename: 'test_leaf.jpg',
                contentType: 'image/jpeg'
            });
            
            try {
                const res = await axios.post('http://127.0.0.1:8000/predict', form, { 
                    headers: form.getHeaders() 
                });
                console.log("SUCCESS:", res.data);
            } catch (e) {
                console.log("PYTHON ERROR MESSAGE =>", e.response ? e.response.data : e.message);
            }
        });
    });
}
downloadAndTest();
