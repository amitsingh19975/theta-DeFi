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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const win = globalThis;
win['IS_LOCAL'] = false;
const contract_1 = __importDefault(require("./contract"));
const fs_1 = __importDefault(require("fs"));
const solcConfig_1 = __importDefault(require("./solcConfig"));
const edgeStore_1 = require("./edgeStore");
const compiledContract = JSON.parse(fs_1.default.readFileSync(solcConfig_1.default.contracts.cache).toString());
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const Person = `
    type Person {
        name: String!
        phone: Int!
      }
    `;
    contract_1.default.init(edgeStore_1.URLS.thetanet, compiledContract);
    // const file = makeTable('Person', Person);
    // await file.init();
    // // console.log(file.makeGraphQLSchema());
    // // console.log(Directory.root.serialize());
    // const resolver = file.makeGraphQLResolver();
    // await resolver.addRow({input: {name: 'A1', phone: 123123, salary: 123.3, city: 'Lucknow', country: 'India'}});
    // console.log(file.approxSize);
    // await resolver.addRow({input: {name: 'A2', phone: 123123, salary: 123.2, city: 'Lucknow', country: 'India'}});
    // console.log(file.approxSize);
    // await resolver.addRow({input: {name: 'A3', phone: 123123, salary: 123.2, city: 'Lucknow', country: 'India'}});
    // console.log(file.approxSize);
    // await resolver.addRow({input: {name: 'A4', phone: 123123, salary: 123.2, city: 'Lucknow', country: 'India'}});
    // console.log(file.approxSize);
    // await resolver.addRow({input: {name: 'A5', phone: 123123, salary: 123.2, city: 'Lucknow', country: 'India'}});
    // console.log(file.approxSize);
    // // await resolver.commit();
    // await resolver.addRow({input: {name: 'A6', phone: 123123, salary: 123.2, city: 'Lucknow', country: 'India'}});
    // await resolver.addRow({input: {name: 'A7', phone: 123123, salary: 123.2, city: 'Lucknow', country: 'India'}});
    // await resolver.addRow({input: {name: 'A8', phone: 123123, salary: 123.2, city: 'Lucknow', country: 'India'}});
    // await resolver.addRow({input: {name: 'A9', phone: 123123, salary: 123.2, city: 'Lucknow', country: 'India'}});
    // await resolver.addRow({input: {name: 'A10', phone: 123123, salary: 123.2, city: 'Lucknow', country: 'India'}});
    // await resolver.addRows( { input: [ 
    //     {name: 'A11', phone: 123123, salary: 123.3, city: 'Lucknow', country: 'India'},
    //     {name: 'A12', phone: 123123, salary: 123.2, city: 'Lucknow', country: 'India'},
    //     {name: 'A13', phone: 123123, salary: 123.2, city: 'Lucknow', country: 'India'},
    //     {name: 'A14', phone: 123123, salary: 123.2, city: 'Lucknow', country: 'India'},
    //     {name: 'A15', phone: 123123, salary: 123.2, city: 'Lucknow', country: 'India'},
    //     {name: 'A16', phone: 123123, salary: 123.2, city: 'Lucknow', country: 'India'},
    //     {name: 'A17', phone: 123123, salary: 123.2, city: 'Lucknow', country: 'India'},
    //     {name: 'A18', phone: 123123, salary: 123.2, city: 'Lucknow', country: 'India'},
    //     {name: 'A19', phone: 123123, salary: 123.2, city: 'Lucknow', country: 'India'},
    //     {name: 'A20', phone: 123123, salary: 123.2, city: 'Lucknow', country: 'India'}]});
    // graphql({schema: file.makeGraphQLSchema(), source: '{show{name}}' , rootValue: resolver})
    //     .then(res => console.log(util.inspect(res.data?.show, {showHidden: false, depth: null, colors: true})));
    // await resolver.commit();
    // file.currentBlocks.forEach(b => console.log(b.buffer));
    // ShareableStorage.init(URLS.thetanet, compiledContract);
    // const web = ShareableStorage._web;
    // if (!web) return;
    // console.log(await web.eth.net.isListening());
    const account = '0x19E7E376E7C213B7E7e7e46cc70A5dD086DAff2A';
    const crt = new contract_1.default('0x34036b251d6dB7C5F71f337560410785b627860d');
    const res = yield crt.myAccessLevel(account);
    console.log(res, typeof res);
    // // await crt.deploy({
    // //     name: 'Testing',
    // //     blockAddress: '0x123123adfa1',
    // //     rPrice: toWei(2, 'gwei'),
    // //     rwPrice: toWei(3, 'gwei')
    // // });
    // mutation {
    //     addRows(input: [
    //         {
    //             name: "Amit Singh", 
    //             phone: 123
    //         },
    //         {
    //             name: "Vineet Singh", 
    //             phone: 432
    //         },
    //         {
    //             name: "Tran Singh", 
    //             phone: 324
    //         }
    //     ])
    // }
    // # {
    // #     person {
    // #         name
    // #     }
    // # }
    const carSchema = `
        type CarSchema {
            Car: String!
            MPG: Float!
            Cylinders: Int!
            Displacement: Float!
            Horsepower: Float!
            Weight: Float!
            Acceleration: Float!
            Model: Int!
            Origin: String!
        }
    `;
    // AccountManager.currentIdx = 1;
    // const show = async () => {
    //     console.log( '-------------------------' );
    //     console.log( 'Address: ' + crt.address);
    //     console.log( 'Name: ' + await crt.name());
    //     console.log( 'Symbol: ' + await crt.symbol());
    //     console.log( 'Decimals: ' + await crt.decimals());
    //     console.log( 'MinAccessLevel: ' + await crt.minAccessLevel());
    //     console.log( 'MaxAccessLevel: ' + await crt.maxAccessLevel());
    //     console.log( 'MyAccessLevel: ' + await crt.myAccessLevel());
    //     console.log( 'HasNoPerm: ' + await crt.hasNoPerm());
    //     console.log( 'HasReadPerm: ' + await crt.hasReadPerm());
    //     console.log( 'HasReadWritePerm: ' + await crt.hasReadWritePerm());
    //     console.log( 'GetBlockAddress: ' + await crt.getBlockAddress());
    //     console.log( 'GetPrices: ' + await crt.getPrices());
    //     console.log( '-------------------------' );
    // }
    // show();
    // await crt.buy(AccessLevel.RW, toWei(1, 'Gwei'));
    // await crt.updateBlockAddress('0x123123');
    // show();
});
main();
// Store.init().then(main);
//# sourceMappingURL=app.js.map