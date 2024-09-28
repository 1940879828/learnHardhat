// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

// Uncomment this line to use console.log 如果需要使用 console.log，请取消注释这行
// import "hardhat/console.sol";

// Lock 合约的主要作用是实现一个锁定机制，允许拥有者在设定的时间之后提取存入的以太币。
contract Lock {
    uint public unlockTime; // 解锁时间
    address payable public owner; // 合约拥有者的地址

    event Withdrawal(uint amount, uint when); // 提款事件

    constructor(uint _unlockTime) payable {
        require(
            block.timestamp < _unlockTime,
            "Unlock time should be in the future"
        );

        unlockTime = _unlockTime; // 设置解锁时间
        owner = payable(msg.sender); // 将合约创建者设置为拥有者
    }

    function withdraw() public {
        // Uncomment this line, and the import of "hardhat/console.sol", to print a log in your terminal
        // 如果需要在终端打印日志，请取消注释这一行，并导入 "hardhat/console.sol"
        // console.log("Unlock time is %o and block timestamp is %o", unlockTime, block.timestamp);

        require(block.timestamp >= unlockTime, "You can't withdraw yet"); // 确保尚未解锁时不能提款
        require(msg.sender == owner, "You aren't the owner"); // 只有拥有者可以提现

        emit Withdrawal(address(this).balance, block.timestamp); // 触发提现事件

        owner.transfer(address(this).balance); // 转账给拥有者
    }
}
