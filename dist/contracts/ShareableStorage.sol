// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ShareableToken.sol";

contract ShareableStorage is ShareableToken {
    bytes private mBlockAddress;
    uint8 public constant NO_PERM = 0;
    uint8 public constant READ_PERM = 1;
    uint8 public constant RW_PERM = 2;
    uint8 private constant PERMS = 3;

    constructor(string memory _name, bytes memory _address, uint _readPrice, uint _readWritePrice)
        ShareableToken(_name, "ShareableToken", PERMS)
    {
        mBlockAddress = _address;
        updatePermission(owner(), RW_PERM);
        _prices[NO_PERM] = 0;
        _prices[READ_PERM] = _readPrice;
        _prices[RW_PERM] = _readWritePrice;
    }

    function updatePrices(uint _readPrice, uint _readWritePrice) public onlyOwner {
        _prices[READ_PERM] = _readPrice;
        _prices[RW_PERM] = _readWritePrice;
    }

    modifier canReadData() {
        require(myAccessLevel() > NO_PERM, "[ShareableStorage]: does not have read permission");
        _;
    }

    modifier canWriteData() {
        require(hasRWPerm(), "[ShareableStorage]: does not have write permission");
        _;
    }

    function getBlockAddress() public view canReadData returns(bytes memory){
        return mBlockAddress;
    }
    
    function updateBlockAddress(bytes memory _address) public canWriteData{
        mBlockAddress = _address;
    }

    function myAccessLevel() public view returns(uint8) {
        return currentAccessLevel(msgSender());
    }

    function hasNoPerm() public view returns(bool) {
        return myAccessLevel() == NO_PERM;
    }

    function hasRPerm() public view returns(bool) {
        return myAccessLevel() == READ_PERM;
    }

    function hasRWPerm() public view returns(bool) {
        return myAccessLevel() == RW_PERM;
    }

    function getPrices() public view returns(uint[] memory) {
        return _prices;
    }

}