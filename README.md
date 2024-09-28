# Sample Hardhat Project Demo

This project demonstrates a basic Hardhat use case. It comes with some sample contract, some test for that contract, and a Hardhat Ignition module that deploys that contract.

This project is annotated in both Chinese and English for ease of study

### how to delopy contract on hardhat

1. A built-in node that runs the hardhat network locally on your machine

```shell
npx hardhat node
```

The node port is 8545 (http://127.0.0.1:8545/)

2. Deploy the contract to the local network

```shell
npx hardhat run scripts/deploy.ts --network localhost
```

### Other common commands that may be useful:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
npx hardhat run scripts/deploy.js --network localhost
```
