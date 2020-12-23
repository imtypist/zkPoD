const { initialize } = require('zokrates-js/node');
const fs = require('fs');

initialize().then((zokratesProvider) => {
    const source = fs.readFileSync("zkPoD.zok", "utf8");
    console.log(source);

    // compilation
    const artifacts = zokratesProvider.compile(source);

    // GenParam
    console.time("GenParam");
    const keypair = zokratesProvider.setup(artifacts.program);
    console.timeEnd("GenParam");

    // ProveData
    var args = ["14897476871502190904409029696666322856887678969656209656241038339251270171395", 
    "16668832459046858928951622951481252834155254151733002984053501254009901876174",
     "1997011358982923168928344992199991480689546837621580239342656433234255379025"]
    const data_length = 10
    for (var i = 1; i <= data_length; i++) {
    	args.push(i.toString());
    }
    console.log(args);
    console.time("ProveData");
    const { witness, output } = zokratesProvider.computeWitness(artifacts, args);
    const proof = zokratesProvider.generateProof(artifacts.program, witness, keypair.pk);
    console.timeEnd("ProveData");

    // VerifyProof
    console.time("VerifyProof");
    const verifier = zokratesProvider.verify(keypair.vk, proof);
    console.timeEnd("VerifyProof");
});