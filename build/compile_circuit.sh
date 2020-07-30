circom circuit.circom --r1cs --wasm --sym -v

snarkjs r1cs info circuit.r1cs

snarkjs r1cs print circuit.r1cs circuit.sym

snarkjs r1cs export json circuit.r1cs circuit.r1cs.json
