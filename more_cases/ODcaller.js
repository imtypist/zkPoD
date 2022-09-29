const { initialize } = require('zokrates-js')
const fs = require("fs");

// ecc key pair for test purpose [pk.p.x.n, pk.p.y.n, sk.fe.n]
const keys = ["14897476871502190904409029696666322856887678969656209656241038339251270171395", "16668832459046858928951622951481252834155254151733002984053501254009901876174", "1997011358982923168928344992199991480689546837621580239342656433234255379025"];

// dummy block hash (512 bits)
const blockhash = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"];

const DEBUG = false;

initialize().then((zokratesProvider) => {
    for (let DATA_LEN = 50; DATA_LEN <= 50; DATA_LEN += 50) {
        console.info("====================\nDATA_LEN: " + DATA_LEN.toString() + "\n====================");

        // dummy inputs
        let input = new Array(DATA_LEN);
        for (var i = 0; i < DATA_LEN; i++) {
            input[i] = i.toString();
        }

        let zok_file = "MP.zok";
        const source = fs.readFileSync(zok_file).toString().replaceAll("DATA_LEN", DATA_LEN.toString()).replaceAll("WINDOW_SIZE", "4").replaceAll("PROFILE_LEN", (DATA_LEN-4+1).toString());
        if (DEBUG) {
            console.log("source code:\n" + source);
        }

        // compile circuit
        console.time("compile circuit");
        const artifacts = zokratesProvider.compile(source);
        console.timeEnd("compile circuit");
        if (DEBUG) {
            console.log("compiled artifacts:\n" + artifacts.program);
        }

        // GenParam
        console.time("GenParam");
        const keypair = zokratesProvider.setup(artifacts.program);
        console.timeEnd("GenParam");

        // ProveData
        let args = [keys.slice(0,2), keys[2], input, blockhash];
        if (DEBUG) {
            console.log("args:\n" + args);
        }

        console.time("ProveData");
        const { witness, output } = zokratesProvider.computeWitness(artifacts, args);
        const proof = zokratesProvider.generateProof(artifacts.program, witness, keypair.pk);
        console.timeEnd("ProveData");
        if (DEBUG) {
            console.log("output:\n" + output);
        }

        // export solidity verifier
        // const verifier = zokratesProvider.exportSolidityVerifier(keypair.vk);
        // console.log(verifier);
        
        // VerifyProof
        console.time("VerifyProof");
        const isVerified = zokratesProvider.verify(keypair.vk, proof);
        console.timeEnd("VerifyProof");
        if (DEBUG) {
            console.log("isVerified:\n" + isVerified.toString());
        }
    }
});
