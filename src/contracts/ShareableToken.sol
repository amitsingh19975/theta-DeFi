// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./interfaces/IST.sol";
import "./Context.sol";
import "./Payable.sol";

contract ShareableToken is Context, IST, Payable {
    // 0 -> No access
    uint8 private immutable mMaxLevel;
    uint[] internal _prices;
    
    // Client Address => Access Level
    mapping(address => uint8) private mAccessLevels;

    string private mName; // name of the shareable token
    string private mSymbol; // name of the shareable token

    constructor(string memory _name, string memory _symbol, uint8 _maxLevel /* 0 <= maxLevel < 255*/) {
        mName = _name;
        mSymbol = _symbol;
        mMaxLevel = _maxLevel;
        _prices = new uint[](mMaxLevel);
    }

    function minAccessLevel() public pure override returns(uint8) {
        return 0;
    }

    function maxAccessLevel() public view override returns(uint8) {
        return mMaxLevel - 1;
    }

    function decimals() public pure override returns(uint8) {
        return 18;
    }

    function currentAccessLevel(address client) public view override returns(uint8) {
        return mAccessLevels[client];
    }

    function _amountToPay(uint amtForNewLevel, uint amtForOldLevel) internal pure returns(uint) {
        unchecked {
            return (amtForNewLevel > amtForOldLevel ? amtForNewLevel - amtForOldLevel : 0);
        }
    }

    function amountToPayForLevel(uint8 lvl) public view override returns(uint) {
        uint8 currLevel = currentAccessLevel(msgSender());
        require(currLevel < lvl && lvl <= maxAccessLevel(), 
            "[ShareableToken(amountToPayForLevel)]: new access level must be greater than current access level"
        );

        return _amountToPay(_prices[lvl], _prices[currLevel]);
    }

    modifier cost(uint8 lvl) {
        uint price = amountToPayForLevel(lvl);
        require(msgValue() >= price, "[ShareableToken(buy)]: insufficient amount paid");
        _;
        acceptSpecificAmount(msgSender(), msgValue(), price);
    }

    function symbol() public view override returns(string memory) {
        return mSymbol;
    }
    
    function name() public view override returns(string memory) {
        return mName;
    }

    function buy(uint8 accessLevel) public override payable cost(accessLevel) {
        mAccessLevels[msgSender()] = accessLevel;
    }

    function updatePermission(address client, uint8 accessLevel) public override onlyOwner {
        mAccessLevels[client] = accessLevel;
    }
}