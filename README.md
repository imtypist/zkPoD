# zkPoD: zkSNARK based proof of data consensus prototype

a ZoKrates solution

## Dependencies

### micro performance

- micro_perf.py
  + ZoKrates `v0.6.3`
  + pycrypto

```sh
git clone https://github.com/Zokrates/pycrypto.git
pip install -r requirements.txt
python setup.py install
```

- sc_perf.js
  + ganache-cli
  + web3.js
  + solc

### macro performance

- macro_perf.py
  + pycrypto

### more cases

- ODcaller.py
  - ZoKrates `v0.8.2`

- ODcaller.js (Invoke different outlier detection algorithms)
  - zokrates.js
    + `npm install zokrates-js`