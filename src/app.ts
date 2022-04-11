// // 4[3[2[1Int]!]]!
// const temp = Int([true, false, true, false], 3);
// console.log(temp.toString());

// const s = `
//     type Address {
//         city: String!
//         phone: Int!
//     }
// `;

// const s = buildSchema(`
//     type Mutation{
//         setAddress(city: String, phone: Int): Boolean
//     }

//     type Query {
//         address: [Address!]!
//     }

//     type Address {
//         city: String!
//         phone: Int!
//     }
// `)

// const data = {
//     city: ['a','b','c','d','e'],
//     phone: [1,2,3,4,5]
// }

// const rootValue = {
//     address: () => {
//         const temp = [] as unknown[];
//         for(const i in data.city){
//             temp.push({city: data.city[i], phone: data.phone[i]});
//         }
//         console.log(temp);
//         return temp;
//     },
//     setAddress : ({city, phone}) => {
//         console.log(city, typeof phone);
//         return false;
//     }
// }

// graphql({schema: s, source: 'mutation { setAddress(  phone: 1234 ) }' , rootValue}).then(res => console.log(util.inspect(res, {showHidden: false, depth: null, colors: true})));

// const test = "  Testing";
// const tableInfo = FileInfo.fromGraphQLSource(s);
// console.log(tableInfo.buildRow({city: 'Lucknow'}));
// console.log(tableName, TableInfo)
// TableInfo.validateType('city', test, (v, d) => console.log(v,d));

// console.log(util.inspect(fileInfoFromGraphQLLang(s), {showHidden: false, depth: null, colors: true}))


// const store = new Store<Test>("UserInfo");

// console.log(Directory.root.serialize());
// makeDir('usr/desktop/games');
// makeDir('usr/games');
// makeDir('usr/test/e1');
// const file = makeFile('address', s, null, 120, cd('/usr'));
// console.log(util.inspect(ls(Directory.root,'./usr'), {showHidden: false, depth: null, colors: true}));

// const rootValue = {
//     addRow({input}) {
//         console.log(input);
//         return true;
//     }
// }

// const q = `
// mutation { 
//     addRow(input: 
//         {
//             city: "Lucknow", 
//             phone: 123
//         })
// }
// `

// graphql({schema: file.makeGraphQLSchema(), source: q , rootValue}).then(res => console.log(util.inspect(res, {showHidden: false, depth: null, colors: true})));
// console.log(file.makeGraphQLSchema());

// import SolCompiler from "./solc/compileSol";

// const compiler = new SolCompiler();
// const contracts = compiler.compile();
// const cts = contracts.ShareableStorage;
// console.log(cts.evm.gasEstimates);

import Web3 from 'web3';
import ShareableStorage, { AccessLevel, toWei } from "./contract";
import AccountManager from "./accountManager";
import fs from 'fs';
import config from './solcConfig';
import { URLS } from './edgeStore';

const compiledContract = JSON.parse(fs.readFileSync(config.contracts.cache).toString());

const main = async () => {
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
    console.log(URLS.thetanet);
    ShareableStorage.init(URLS.thetanet, compiledContract);
    const crt = new ShareableStorage('0x690b076B0442c445CbE7ba50F8245E60f6BE9dD1');
    // await crt.deploy({
    //     name: 'Testing',
    //     blockAddress: '0x123123adfa1',
    //     rPrice: toWei(2, 'gwei'),
    //     rwPrice: toWei(3, 'gwei')
    // });

    AccountManager.currentIdx = 1;
    const show = async () => {
        console.log( '-------------------------' );
        console.log( 'Address: ' + crt.address);
        console.log( 'Name: ' + await crt.name());
        console.log( 'Symbol: ' + await crt.symbol());
        console.log( 'Decimals: ' + await crt.decimals());
        console.log( 'MinAccessLevel: ' + await crt.minAccessLevel());
        console.log( 'MaxAccessLevel: ' + await crt.maxAccessLevel());
        console.log( 'MyAccessLevel: ' + await crt.myAccessLevel());
        console.log( 'HasNoPerm: ' + await crt.hasNoPerm());
        console.log( 'HasReadPerm: ' + await crt.hasReadPerm());
        console.log( 'HasReadWritePerm: ' + await crt.hasReadWritePerm());
        console.log( 'GetBlockAddress: ' + await crt.getBlockAddress());
        console.log( 'GetPrices: ' + await crt.getPrices());
        console.log( '-------------------------' );
    }

    // show();

    // await crt.buy(AccessLevel.RW, toWei(1, 'Gwei'));

    // await crt.updateBlockAddress('0x123123');

    show();

}

main();
// Store.init().then(main);


