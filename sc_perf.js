const Web3 = require('web3');
const ganache = require("ganache-cli");
const solc = require('solc');
const fs = require('fs');
const {performance} = require('perf_hooks');

let web3 = new Web3(ganache.provider());


function compileContract(contract_name){
  let source = fs.readFileSync(contract_name, 'utf8')
  console.log('=> compiling contract ' + contract_name);

  let compiledContract;
  
  var input = {
    language: 'Solidity',
    sources: {

    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['*']
        }
      }
    }
  };

  input['sources'][contract_name] = {content: source};
  
  compiledContract = JSON.parse(solc.compile(JSON.stringify(input)));

  for (let contractName in compiledContract.contracts[contract_name]) {
    var bytecode = compiledContract.contracts[contract_name][contractName].evm.bytecode.object;
    var abi = compiledContract.contracts[contract_name][contractName].abi;
  }
  contract_info = {"abi": abi, "bytecode": bytecode};
  return contract_info;
}


function deployContract(contract_name){
  let contract_info = compileContract(contract_name);
  // console.log(contract_info)
  let bytecode = contract_info.bytecode;
  let abi = contract_info.abi;
  return new Promise((resolve, reject) => {
    web3.eth.estimateGas({data: bytecode}).then(function(gasEstimate){
      web3.eth.getAccounts().then(function(accounts){
        let myContract = new web3.eth.Contract(abi,null,{from: accounts[0], gas: gasEstimate});
        myContract.deploy({data: bytecode})
        .send({from: accounts[0], gas: gasEstimate},function(error, transactionHash){
          console.log("=> transaction hash: " + transactionHash)
        })
        .then(function(newContractInstance){
          console.log("=> contract is deployed at address: " + newContractInstance.options.address) // instance with the new contract address
          
          resolve({abi: abi, address: newContractInstance.options.address});
        });
      });
    });
  });
}

function sc_test(VerifyDataContract, data_len){
  var input = [];
  for (var i = 0; i < data_len; i++) {
    input.push(i);
  }
  return new Promise((resolve, reject) => {
    web3.eth.getAccounts().then(function(accounts){
      const st = performance.now();
      // Will call a “constant” method and execute its smart contract method in the EVM without sending any transaction
      VerifyDataContract.methods.verify(input).call({from: accounts[0]}).then(function(result){
        // console.log(result);
        const ed = performance.now();
        resolve(ed - st);
      });
    });
  });
}

async function sc_batch_test(VerifyDataContract){
  for (var data_len = 10; data_len <= 600; data_len += 10) {
    await sc_test(VerifyDataContract, data_len).then(function(content){
      console.log(data_len, content);
      try{
        fs.writeFileSync('sc_test.csv', data_len.toString() + "," + content.toString() + "\n", {flag: 'a+'});
      }catch(err){
        console.error(err);
      }
    });
  }
}


let contractObj = deployContract("VerifyData.sol");

contractObj.then(function(res){
  var VerifyDataContract = new web3.eth.Contract(res['abi'], res['address']);
  try{
    fs.writeFileSync('sc_test.csv', "data_len,sc\n", {flag: 'w+'});
  }catch(err){
    console.error(err);
  }
  sc_batch_test(VerifyDataContract);
})
