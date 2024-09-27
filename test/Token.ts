import { expect } from "chai";
import {  } from "viem";
import hre from "hardhat";

describe("Token contract", function () {
  it("Deployment should assign the total supply of tokens to the owner", async function () {
    const [owner] = await hre.viem.getWalletClients();

    const hardhatToken = await hre.viem.deployContract("Token");
    const tokenContract = createCon

    const ownerBalance = await hardhatToken.balanceOf(owner.address);
    expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
  });
});