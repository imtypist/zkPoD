const Blockchain = require("./blockchain");
const uuid = require('node-uuid');

function addTransaction (blockchain) {
    let sender = uuid.v1().split('-').join("");
    let recipient = uuid.v1().split('-').join("");
    blockchain.addTransaction(sender, recipient);
}

async function main () {
    let b1 = new Blockchain();

    console.log(b1.chain);

    for (var i = 0; i < 10; i++) {
        addTransaction(b1);
    }

    await b1.newBlock();

    console.log(b1.chain);

    let b2 = new Blockchain();

    await b2.syncChain(b1.chain);

}

main().then(() => {
    process.exit(0);
});