// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IST {
    
    function name() external view returns(string memory);
    function symbol() external view returns(string memory);
    function buy(uint8 accessLevel) external payable;
    function decimals() external pure returns(uint8);
    function minAccessLevel() external pure returns(uint8);
    function maxAccessLevel() external view returns(uint8);
    function updatePermission(address client, uint8 accessLevel) external;
    function currentAccessLevel(address client) external view returns(uint8);
    function amountToPayForLevel(uint8 lvl) external view returns(uint);
}