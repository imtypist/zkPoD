const snarkjs = require("snarkjs");
const fs = require("fs");

exports.Prove = async function (witness) {
	const { proof, publicSignals } = await snarkjs.groth16.fullProve(witness, "./build/circuit.wasm", "./build/circuit_final.zkey");

    console.log("Proof: ");
    console.log(JSON.stringify(proof, null, 1));

    console.log("Public input/output: ");
    console.log(JSON.stringify(publicSignals, null, 1));

    // fs.writeFileSync("./build/proof.json", JSON.stringify(proof));
    // fs.writeFileSync("./build/publicSignals.json", JSON.stringify(publicSignals));

    return {proof, publicSignals};
}