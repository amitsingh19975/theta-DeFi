// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./Ownable.sol";

abstract contract Payable is Ownable {
    
    event AmountTransferTo(address indexed to, uint indexed amount);

    function transferTo(address to, uint amt) internal onlyOwner {
        payable(to).transfer(amt);
    }

    function acceptSpecificAmount(address client, uint clientAmt, uint price) internal virtual {
        unchecked {
            if(clientAmt > price){
                transferTo(client, clientAmt - price);
            }
        }
    }

    function balance() public view onlyOwner returns(uint) {
        return address(this).balance;
    }

    modifier hasBalance() {
        require(balance() > 0, "[Payable]: balance must be greater than 0 to withdraw");
        _;
    }

    function withdraw() public onlyOwner hasBalance {
        transferTo(owner(), balance());
    }

}
