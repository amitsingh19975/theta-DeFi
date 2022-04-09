"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const contract_1 = __importStar(require("./contract"));
const accountManager_1 = __importDefault(require("./accountManager"));
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    // const Person = `
    // type Person {
    //     name: String!
    //     phone: Int!
    //     salary: Float!
    //     city: String!
    //     country: String!
    // }
    // `;
    // const file = makeTable('Person', Person);
    // await file.init();
    // console.log(Directory.root.serialize());
    // const resolver = file.makeGraphQLResolver();
    // await resolver.addRow({input: {name: 'A1', phone: 123123, salary: 123.3, city: 'Lucknow', country: 'India'}});
    // await resolver.addRow({input: {name: 'A2', phone: 123123, salary: 123.2, city: 'Lucknow', country: 'India'}});
    // await resolver.addRow({input: {name: 'A3', phone: 123123, salary: 123.2, city: 'Lucknow', country: 'India'}});
    // await resolver.addRow({input: {name: 'A4', phone: 123123, salary: 123.2, city: 'Lucknow', country: 'India'}});
    // await resolver.addRow({input: {name: 'A5', phone: 123123, salary: 123.2, city: 'Lucknow', country: 'India'}});
    // await resolver.commit();
    // await resolver.addRow({input: {name: 'A6', phone: 123123, salary: 123.2, city: 'Lucknow', country: 'India'}});
    // await resolver.addRow({input: {name: 'A7', phone: 123123, salary: 123.2, city: 'Lucknow', country: 'India'}});
    // await resolver.addRow({input: {name: 'A8', phone: 123123, salary: 123.2, city: 'Lucknow', country: 'India'}});
    // await resolver.addRow({input: {name: 'A9', phone: 123123, salary: 123.2, city: 'Lucknow', country: 'India'}});
    // await resolver.addRow({input: {name: 'A10', phone: 123123, salary: 123.2, city: 'Lucknow', country: 'India'}});
    // await resolver.commit();
    // file.currentBlocks.forEach(b => console.log(b.buffer));
    contract_1.default.init(contract_1.ThetaLocalnet);
    const crt = new contract_1.default('0x690b076B0442c445CbE7ba50F8245E60f6BE9dD1');
    // await crt.deploy({
    //     name: 'Testing',
    //     blockAddress: '0x123123adfa1',
    //     rPrice: toWei(2, 'gwei'),
    //     rwPrice: toWei(3, 'gwei')
    // });
    accountManager_1.default.currentIdx = 1;
    const show = () => __awaiter(void 0, void 0, void 0, function* () {
        console.log('-------------------------');
        console.log('Address: ' + crt.address);
        console.log('Name: ' + (yield crt.name()));
        console.log('Symbol: ' + (yield crt.symbol()));
        console.log('Decimals: ' + (yield crt.decimals()));
        console.log('MinAccessLevel: ' + (yield crt.minAccessLevel()));
        console.log('MaxAccessLevel: ' + (yield crt.maxAccessLevel()));
        console.log('MyAccessLevel: ' + (yield crt.myAccessLevel()));
        console.log('HasNoPerm: ' + (yield crt.hasNoPerm()));
        console.log('HasReadPerm: ' + (yield crt.hasReadPerm()));
        console.log('HasReadWritePerm: ' + (yield crt.hasReadWritePerm()));
        console.log('GetBlockAddress: ' + (yield crt.getBlockAddress()));
        console.log('GetPrices: ' + (yield crt.getPrices()));
        console.log('-------------------------');
    });
    // show();
    // await crt.buy(AccessLevel.RW, toWei(1, 'Gwei'));
    // await crt.updateBlockAddress('0x123123');
    show();
});
main();
// Store.init().then(main);
//# sourceMappingURL=app.js.map