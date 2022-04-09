import { ls } from '../src/commands/ls';
import { Directory, makeDir, makeFile } from '../src/fs';
import { FileInfo } from '../src/fs/fileInfo';

test("testing 'ls' command", () => {
    /**
     * root
     *   - sys
     *      - kernel
     *   - user
     *      - text.txt
     *      - desktop
     *          - game
     */

    const sys = makeDir('/sys');
    const user = makeDir('/user');
    const desktop = makeDir('/user/desktop');

    makeFile('kernel', { fileInfo: new FileInfo(), loc: 'www.linux.net', size: 1000 }, sys);
    makeFile('text.txt', { fileInfo: new FileInfo(), loc: 'www.test.net', size: 10 }, user);
    makeFile('game', { fileInfo: new FileInfo(), loc: 'www.game.io', size: 100 }, desktop);

    expect(ls(Directory.root, '')).toMatchObject([
        {
            name: 'sys',
            parent: '',
            baseAddress: null,
            size: 1000,
            isFile: false,
            fullPath: '/sys'
        },

        {
            name: 'user',
            parent: '',
            baseAddress: null,
            size: 110,
            isFile: false,
            fullPath: '/user'
        }
    ]);

    expect(ls(sys,'kernel')).toMatchObject([
        {
            name: 'kernel',
            parent: 'sys',
            baseAddress: 'www.linux.net',
            size: 1000,
            isFile: true,
            fullPath: '/sys/kernel'
        },
    ]);

    expect(ls(Directory.root,'user/desktop')).toMatchObject([
        {
            name: 'game',
            parent: 'desktop',
            baseAddress: 'www.game.io',
            size: 100,
            isFile: true,
            fullPath: '/user/desktop/game'
        },
    ]);

})