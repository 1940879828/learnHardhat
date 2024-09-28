import hre from "hardhat";

async function main() {
  // 部署 Token 合约
  const token = await hre.viem.deployContract("Token");
  console.log("Token deployed to:", token.address);

  // 部署 MyToken 合约，初始供应量为 1,000,000
  const myToken = await hre.viem.deployContract("MyToken", [1000000n]);
  console.log("MyToken deployed to:", myToken.address);

  ;

  // 部署 Lock 合约，设置解锁时间为 未来的某个时间戳（例如：当前时间 + 1 年）
  const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
  const unlockTime = 
    BigInt((await (await hre.viem.getPublicClient()).getBlock({ blockTag: 'latest' })).timestamp) 
    + BigInt(ONE_YEAR_IN_SECS);
  const lock = await hre.viem.deployContract("Lock", [unlockTime], {
    value: 1n, // 假设传入 1 wei 的初始资金
  });
  console.log("Lock deployed to:", lock.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
