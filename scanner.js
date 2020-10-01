const { FormRecognizerClient, AzureKeyCredential } = require("@azure/ai-form-recognizer");

const fs = require("fs");
const path = require("path");

const dotenv = require("dotenv");
dotenv.config();
const endpoint = process.env["FORM_RECOGNIZER_ENDPOINT"];
const apiKey = process.env["FORM_RECOGNIZER_API_KEY"];

async function processReceipt(filename) {
    const filepath = path.join(__dirname, "./public/uploads/", filename);
    const readStream = fs.createReadStream(filepath);

    const client = new FormRecognizerClient(endpoint, new AzureKeyCredential(apiKey));
    const poller = await client.beginRecognizeReceipts(readStream, {
        contentType: "image/jpeg",
        onProgress: (state) => {
            console.log(`status: ${state.status}`);
        }
    });

    const [receipt] = await poller.pollUntilDone();

    let calculatedTotal = 0;
    const items = receipt.fields["Items"];
    for (const item of items.value) {
        const name = item.value["Name"].value;
        const price = item.value["TotalPrice"].value;
        console.log(`${name} with price ${price}`)
        calculatedTotal += price
    }
    const tax = receipt.fields["Tax"].value
    console.log(`Tax: ${tax}`)
    calculatedTotal += tax

    const actualTotal = receipt.fields["Total"].value
    console.log(`Total: ${actualTotal}`)

    if (calculatedTotal === actualTotal) {
        console.log("Success!");
    } else {
        console.log("Failure :(");
    }
}

module.exports = {processReceipt}

