const snarkjs = require("snarkjs");
const fs = require("fs");

exports.Verify = async function (proof, publicSignals) {
	const vKey = JSON.parse(fs.readFileSync("./build/verification_key.json"));
	// const publicSignals = JSON.parse(fs.readFileSync("./build/publicSignals.json"));
	// const proof = JSON.parse(fs.readFileSync("./build/proof.json"));

    const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);

    if (res === true) {
        console.log("Verification OK");
        return true;
    } else {
        console.log("Invalid proof");
        return false;
    }
}