const Web3 = require('web3');
const ganache = require("ganache-core");
const solc = require('solc');
const fs = require('fs')

let web3 = new Web3(ganache.provider());


function compileContract(contract_name){
  let source = fs.readFileSync(contract_name + ".sol", 'utf8')
  console.log('=> compiling contract ' + contract_name);
  let compiledContract;
  try{
    compiledContract = solc.compile(source);
  }catch(err){
    console.log(err);
    return -1;
  }
  for (let contractName in compiledContract.contracts) {
    var bytecode = compiledContract.contracts[contractName].bytecode;
    var abi = compiledContract.contracts[contractName].interface;
  }
  contract_info = {"abi": abi, "bytecode": bytecode};
  return contract_info;
}

function deployContract(contract_name){
  let contract_info = compileContract(contract_name);
  let bytecode = contract_info.bytecode;
  localStorage.setItem('_abi',contract_info.abi);
  let abi = JSON.parse(contract_info.abi);
  web3.eth.estimateGas({data: bytecode}).then(function(gasEstimate){
    web3.eth.getAccounts().then(function(accounts){
      let myContract = new web3.eth.Contract(abi,null,{from: accounts[0], gas: gasEstimate});
      myContract.deploy({data: bytecode})
      .send({from: accounts[0], gas: gasEstimate},function(error, transactionHash){
        console.log("=> hash: " + transactionHash)
      })
      .then(function(newContractInstance){
        console.log("=> address: " + newContractInstance.options.address) // instance with the new contract address
      });
    })
  });
}

deployContract("VerifyData");