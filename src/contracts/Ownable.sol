// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./Context.sol";

abstract contract Ownable is Context {
    address private mOwner;

    constructor() {
        mOwner = msgSender();
    }

    function owner() internal view virtual returns(address) {
        return mOwner;
    }

    function isOwner() public view returns(bool) {
        return owner() == msgSender();
    }

    modifier onlyOwner() {
        require(isOwner(), "[Ownable]: caller is not the owner");
        _;
    }

}
