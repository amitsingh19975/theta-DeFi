// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

abstract contract Context {
    function msgSender() internal view virtual returns(address){
        return msg.sender;
    }
    
    function msgValue() internal view virtual returns(uint){
        return msg.value;
    }
    
    function msgData() internal view virtual returns(bytes calldata){
        return msg.data;
    }
}
