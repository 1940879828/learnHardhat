import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress, parseGwei } from "viem";

describe("Lock", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // 我们定义一个 fixture 以在每个测试中重用相同的设置。
  // 我们使用 loadFixture 来一次性运行此设置，快照该状态，

  // and reset Hardhat Network to that snapshot in every test.
  // 并在每个测试中重置 Hardhat 网络到该快照。
  async function deployOneYearLockFixture() {
    const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;

    const lockedAmount = parseGwei("1");
    const unlockTime = BigInt((await time.latest()) + ONE_YEAR_IN_SECS);

    // Contracts are deployed using the first signer/account by default
    // 合约默认使用第一个签名者/账户进行部署
    const [owner, otherAccount] = await hre.viem.getWalletClients();

    const lock = await hre.viem.deployContract("Lock", [unlockTime], {
      value: lockedAmount,
    });

    const publicClient = await hre.viem.getPublicClient();

    return {
      lock,
      unlockTime,
      lockedAmount,
      owner,
      otherAccount,
      publicClient,
    };
  }

  describe("Deployment", function () {
    it("Should set the right unlockTime", async function () {
      const { lock, unlockTime } = await loadFixture(deployOneYearLockFixture);

      expect(await lock.read.unlockTime()).to.equal(unlockTime);
    });

    it("Should set the right owner", async function () {
      const { lock, owner } = await loadFixture(deployOneYearLockFixture);

      expect(await lock.read.owner()).to.equal(
        getAddress(owner.account.address)
      );
    });

    it("Should receive and store the funds to lock", async function () {
      const { lock, lockedAmount, publicClient } = await loadFixture(
        deployOneYearLockFixture
      );

      expect(
        await publicClient.getBalance({
          address: lock.address,
        })
      ).to.equal(lockedAmount);
    });

    it("Should fail if the unlockTime is not in the future", async function () {
      // We don't use the fixture here because we want a different deployment
      // 我们在这里不使用 fixture，因为我们想要一个不同的部署
      const latestTime = BigInt(await time.latest());
      await expect(
        hre.viem.deployContract("Lock", [latestTime], {
          value: 1n,
        })
      ).to.be.rejectedWith("Unlock time should be in the future");
    });
  });

  describe("Withdrawals", function () {
    describe("Validations", function () {
      it("Should revert with the right error if called too soon", async function () {
        const { lock } = await loadFixture(deployOneYearLockFixture);

        await expect(lock.write.withdraw()).to.be.rejectedWith(
          "You can't withdraw yet"
        );
      });

      it("Should revert with the right error if called from another account", async function () {
        const { lock, unlockTime, otherAccount } = await loadFixture(
          deployOneYearLockFixture
        );

        // We can increase the time in Hardhat Network
        // 我们可以在 Hardhat 网络中增加时间
        await time.increaseTo(unlockTime);

        // We retrieve the contract with a different account to send a transaction
        // 我们用另一个账户检索合约以发送交易
        const lockAsOtherAccount = await hre.viem.getContractAt(
          "Lock",
          lock.address,
          { client: { wallet: otherAccount } }
        );
        await expect(lockAsOtherAccount.write.withdraw()).to.be.rejectedWith(
          "You aren't the owner"
        );
      });

      it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
        const { lock, unlockTime } = await loadFixture(
          deployOneYearLockFixture
        );

        // Transactions are sent using the first signer by default
        // 交易默认使用第一个签名者发送
        await time.increaseTo(unlockTime);

        await expect(lock.write.withdraw()).to.be.fulfilled;
      });
    });

    describe("Events", function () {
      it("Should emit an event on withdrawals", async function () {
        const { lock, unlockTime, lockedAmount, publicClient } =
          await loadFixture(deployOneYearLockFixture);

        await time.increaseTo(unlockTime);

        const hash = await lock.write.withdraw();
        await publicClient.waitForTransactionReceipt({ hash });

        // get the withdrawal events in the latest block
        // 获取最新区块中的提款事件
        const withdrawalEvents = await lock.getEvents.Withdrawal();
        expect(withdrawalEvents).to.have.lengthOf(1);
        expect(withdrawalEvents[0].args.amount).to.equal(lockedAmount);
      });
    });
  });
});
