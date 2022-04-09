import Web3 from 'web3';

const testAccounts = [
    "0x19E7E376E7C213B7E7e7e46cc70A5dD086DAff2A",
    "0x1563915e194D8CfBA1943570603F7606A3115508",
    "0x5CbDd86a2FA8Dc4bDdd8a8f69dBa48572EeC07FB",
];

export default class AccountManager {
    static accounts: string[] = testAccounts;
    static currentIdx = 0;
    static async init(web?: Web3) : Promise<boolean> {
        if(!web) return false;
        this.accounts = await web.eth.getAccounts();
        return true;
    }

    static get main() : string { return this.accounts[this.currentIdx]; }
}

export const getUser = async () => {
    return {
        name: 'Testing!',
        address: '0x19E7E376E7C213B7E7e7e46cc70A5dD086DAff2A'
    }
}