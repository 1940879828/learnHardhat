import hre from "hardhat";
import { assert, expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";

// A deployment function to set up the initial state
// 一个部署函数，用于设置初始状态
const deploy = async () => {
  const myToken = await hre.viem.deployContract("MyToken", [1_000_000n]);

  return { myToken };
};

describe("MyToken Contract Tests", function () {
  it("should increase supply correctly", async function () {
    // Load the contract instance using the deployment function
    // 使用部署函数加载合约实例
    const { myToken } = await loadFixture(deploy);

    // Get the initial supply
    // 获取初始供应量
    const initialSupply = await myToken.read.getCurrentSupply();

    // Increase the supply
    // 增加供应量
    await myToken.write.increaseSupply([500_000n]);

    // Get the new supply after the increase
    // 获取增加后的新供应量
    const newSupply = await myToken.read.getCurrentSupply();

    // Assert that the supply increased as expected
    // 断言供应量按预期增加
    assert.equal(initialSupply + 500_000n, newSupply);
  });

  it("should revert when increasing supply by less than 1", async function () {
    // Load the contract instance using the deployment function
    // 使用部署函数加载合约实例
    const { myToken } = await loadFixture(deploy);

    // Attempt to increase supply by 0 (which should fail)
    // 尝试增加供应量为0（应当失败）
    await expect(myToken.write.increaseSupply([0n])).to.be.rejectedWith(
      "Amount must be greater than 0"
    );
  });
});