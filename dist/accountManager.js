"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = void 0;
const testAccounts = [
    "0x19E7E376E7C213B7E7e7e46cc70A5dD086DAff2A",
    "0x1563915e194D8CfBA1943570603F7606A3115508",
    "0x5CbDd86a2FA8Dc4bDdd8a8f69dBa48572EeC07FB",
];
class AccountManager {
    static init(web) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!web)
                return false;
            this.accounts = yield web.eth.getAccounts();
            return true;
        });
    }
    static get main() { return this.accounts[this.currentIdx]; }
}
exports.default = AccountManager;
AccountManager.accounts = testAccounts;
AccountManager.currentIdx = 0;
const getUser = () => __awaiter(void 0, void 0, void 0, function* () {
    return {
        name: 'Testing!',
        address: '0x19E7E376E7C213B7E7e7e46cc70A5dD086DAff2A'
    };
});
exports.getUser = getUser;
//# sourceMappingURL=accountManager.js.map