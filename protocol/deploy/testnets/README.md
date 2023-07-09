# TESTNET Deploy Scripts

## 1/ Sepolia

```bash
yarn hardhat run --network sepolia deploy/testnets/sepolia/01-mav.ts
yarn hardhat run --network sepolia deploy/testnets/sepolia/02-tcMav.ts
yarn hardhat run --network sepolia deploy/testnets/sepolia/03-tomcat-launch-vault.ts
yarn hardhat run --network sepolia deploy/testnets/sepolia/99-post-deploy.ts
```

## 2/ zkSync

```bash
yarn hardhat deploy-zksync --network zkSyncTestnet --script deploy/testnets/zkSyncTestnet/01-mav.ts
yarn hardhat deploy-zksync --network zkSyncTestnet --script deploy/testnets/zkSyncTestnet/02-tcMav.ts
yarn hardhat deploy-zksync --network zkSyncTestnet --script deploy/testnets/zkSyncTestnet/03-tomcat-launch-vault.ts
yarn hardhat deploy-zksync --network zkSyncTestnet --script deploy/testnets/zkSyncTestnet/99-post-deploy.ts
```

## 3/ Link up Layer Zero permissions

```bash
yarn hardhat run --network sepolia deploy/testnets/sepolia/100-lz-post-deploy.ts
yarn hardhat deploy-zksync --network zkSyncTestnet --script deploy/testnets/zkSyncTestnet/100-lz-post-deploy.ts
```

## 4/ Test minting

```bash
yarn hardhat run --network sepolia deploy/testnets/sepolia/999-test-mint-and-stake.ts
yarn hardhat deploy-zksync --network zkSyncTestnet --script deploy/testnets/zkSyncTestnet/999-test-mint-and-stake.ts
```

## 5/ Test bridging

The testnet layer zero wasn't working for me...but it did work on prodnets...

```bash
yarn hardhat run --network sepolia deploy/testnets/sepolia/9999-test-lz-bridge.ts
```