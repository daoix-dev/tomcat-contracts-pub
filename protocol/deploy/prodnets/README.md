# PRODNET Deploy Scripts

## 1/ Mainnet

```bash
# ALREADY DONE
# yarn hardhat run --network mainnet deploy/prodnets/mainnet/01-tcMav.ts
# ALREADY DONE
# yarn hardhat run --network mainnet deploy/prodnets/mainnet/02-tomcat-launch-vault.ts

# STILL NEED TO DO THE `Setup LZ for tcMAV` STEP
yarn hardhat run --network mainnet deploy/prodnets/mainnet/99-post-deploy.ts
```

## 2/ zkSync Era

```bash
yarn hardhat deploy-zksync --network zkSyncMainnet --script deploy/prodnets/zkSyncMainnet/02-tcMav.ts
yarn hardhat deploy-zksync --network zkSyncMainnet --script deploy/prodnets/zkSyncMainnet/03-tomcat-launch-vault.ts
yarn hardhat deploy-zksync --network zkSyncMainnet --script deploy/prodnets/zkSyncMainnet/99-post-deploy.ts
```

## 3/ Link up Layer Zero permissions

```bash
yarn hardhat run --network mainnet deploy/prodnets/mainnet/100-lz-post-deploy.ts
yarn hardhat deploy-zksync --network zkSyncMainnet --script deploy/prodnets/zkSyncMainnet/100-lz-post-deploy.ts
```
