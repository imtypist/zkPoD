const crypto = require("crypto");
const prove = require("./prove");
const verify = require("./verify");
const uuid = require('node-uuid');

class Blockchain {
    constructor() {
        this.chain = [];
        this.pendingTransactions = [];
        this.newBlock();
        this.peers = new Set();
        this.address = uuuid.v1().split('-').join("");
    }

    /**
     * Adds a node to our peer table
     */
    addPeer(address) {
        this.peers.add(address);
    }

    /**
     * Gets peers from our peer table
     */
    getPeers() {
        return Array.from(this.peers);
    }

    /**
     * Adds a transaction to pending list
     * @param recipient can be a smart contract or external owner account
     */
    addTransaction(sender, recipient) {
        let tx = {
            timestamp: new Date().toISOString(),
            sender,
            recipient
        };

        tx.hash = Blockchain.hash(tx);

        console.log(`Added transaction ${tx.hash}`);

        this.pendingTransactions.push(tx);
    }

    /**
     * Creates a new block containing any outstanding transactions
     */
    newBlock() {
        let currentTransactions = this.mine();

        if (currentTransactions == false) {
            console.log("Not satisfy the difficulty!");
            return false;
        }

        // Give reward to miner
        let tx = {
            timestamp: new Date().toISOString(),
            sender: null,
            recipient: this.address
        };

        tx.hash = Blockchain.hash(tx);

        // Put it on the first position
        currentTransactions.unshift(tx);

        let block = {
            index: this.chain.length,
            timestamp: new Date().toISOString(),
            transactions: currentTransactions,
            previousHash: this.lastBlock.hash,
            nonce: Blockchain.nonce()
        };

        block.hash = Blockchain.hash(block);

        console.log(`Created block ${block.index}`);

        // Add the new block to the blockchain
        this.chain.push(block);

        console.log("We mined a block!")
        console.log(` - Block hash: ${Blockchain.hash(block)}`);
        console.log(` - nonce:      ${block.nonce}`);
    }

    /**
     * Generates a SHA-256 hash of the block
     */
    static hash(block) {
        const blockString = JSON.stringify(block, Object.keys(block).sort());
        return crypto.createHash("sha256").update(blockString).digest("hex");
    }

    /**
     * Returns the last block in the chain
     */
    lastBlock() {
        return this.chain.length && this.chain[this.chain.length - 1];
    }

    /**
     * Generates a random 32 byte string
     */
    static nonce() {
        return crypto.createHash("sha256").update(crypto.randomBytes(32)).digest("hex");
    }

    /**
     * Proof of Work mining algorithm
     *
     * We hash the block with random string until the hash begins with
     * a "difficulty" number of 0s.
     */
    async mine(difficulty = 4) {
        let currentTransactions = [];

        if (this.pendingTransactions.length < difficulty) return false;

        while (difficulty--) {
            let tx = this.pendingTransactions[0];
            this.pendingTransactions.shift();
            const { proof, publicSignals } = await prove.Prove({a:2,b:11});
            tx.proof = proof;
            tx.publicSignals = publicSignals;
            tx.index = currentTransactions.length;
            currentTransactions.push(tx);
        }

        return currentTransactions;
    }

    async syncBlock(block) {
        if (block.index != (this.chain.length + 1) || block.hash != this.lastBlock.hash) return false;

        for (var i = block.transactions.length - 1; i >= 0; i--) {
            var proof = block.transactions[i].proof;
            var publicSignals = block.transactions[i].publicSignals;
            res = await verify.Verify(proof, publicSignals);
            if (res == false) {
                console.log("Verify failed! Reject this block!");
                return false;
            }
        }

        this.chain.push(block);

    }
}

module.exports = Blockchain;
