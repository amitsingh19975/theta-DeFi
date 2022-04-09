import { Path, Directory, File, makeDir, makeFile, serializeFileSystem, deserializeFileSystem } from '../src/fs';
import { FileInfo } from '../src/fs/fileInfo';

test('File construction', () =>{
    const path = "www.test.txt";
    const root = Directory.make(null, 'root');
    const file = File.make(root, 'text.txt', new FileInfo(), path, 32);
    expect(file.name).toBe('text.txt');
    expect(file.basename).toBe('text');
    expect(file.extension).toBe('txt');
    expect(file.baseAddress).toBe(path);
    expect(file.size).toBe(32);
    expect(file.parent).toBe(root);
    expect(Path.getPath(file)).toBe('root/text.txt');
})

test('test getPath', () => {
    /**
     * root
     *   - sys
     *      - kernel
     *   - user
     *      - text.txt
     *      - desktop
     *          - game
     */

    const root = Directory.make(null, 'root');
    const kernel = File.make(null, 'kernel', new FileInfo(), 'www.linux.net', 30);
    const text = File.make(null, 'text.txt', new FileInfo(), 'www.wiki.com', 10);
    const game = File.make(null, 'game', new FileInfo(), 'www.game.net', 10);

    const sys = Directory.make(root, 'sys');
    sys.addChild(kernel);

    const desktop = Directory.make(null, 'desktop');
    desktop.addChild(game);
    
    const user = Directory.make(root, 'user');
    user.addChildren([desktop, text])

    expect(Path.getPath(kernel)).toBe('root/sys/kernel');
    expect(Path.getPath(text)).toBe('root/user/text.txt');
    expect(Path.getPath(game)).toBe('root/user/desktop/game');
    
    expect(Path.getPath(sys)).toBe('root/sys');
    expect(Path.getPath(user)).toBe('root/user');

    expect(game.size).toBe(10);
    expect(text.size).toBe(10);
    expect(kernel.size).toBe(30);

    expect(desktop.size).toBe(10);
    expect(user.size).toBe(20);
    expect(sys.size).toBe(30);
    expect(root.size).toBe(50);

    Directory.root.removeAll();
    expect(Directory.root.children.length).toBe(0);
})

test('test parsePath', () => {
    /**
     * root
     *   - sys
     *      - kernel
     *   - user
     *      - text.txt
     *      - desktop
     *          - game
     */

    const root = Directory.root;
    const kernel = File.make(null, 'kernel');
    const text = File.make(null, 'text.txt');
    const game = File.make(null, 'game');
 
    const sys = Directory.make(root, 'sys');
    sys.addChild(kernel);
 
    const desktop = Directory.make(null, 'desktop');
    desktop.addChild(game);
    
    const user = Directory.make(root, 'user');
    user.addChildren([desktop, text])

    expect(Path.exists('/sys/kernel')).toBe(true);
    expect(Path.exists('/user/text.txt')).toBe(true);
    expect(Path.samePath(Path.getPath(game), '/user/desktop/game')).toBe(true);
    
    expect(Path.samePath(text, text)).toBe(true);
    expect(Path.exists('/user')).toBe(true);
    
    Directory.root.removeAll();
    expect(Directory.root.children.length).toBe(0);
})

test('test make directory', () => {
    /**
     * root
     *   - user
     *      - desktop
     */

    const path = makeDir('/user/desktop');
    expect(Path.exists('/user/desktop')).toBe(true);
    expect(Path.samePath('/user/desktop', Path.getPath(path))).toBe(true);

    Directory.root.removeAll();
    expect(Directory.root.children.length).toBe(0);
})

test('test make File', () => {
    /**
     * root
     *   - user
     *      - desktop
     *          - test.txt
     */
    
    const path = makeDir('/user/desktop');
    const file = makeFile('test.txt', null, path);
    expect(Path.exists('/user/desktop')).toBe(true);
    expect(Path.exists('/user/desktop/test.txt')).toBe(true);
    expect(Path.samePath('/user/desktop', Path.getPath(path))).toBe(true);
    expect(Path.samePath('/user/desktop/test.txt', Path.getPath(file))).toBe(true);

    Directory.root.removeAll();
    expect(Directory.root.children.length).toBe(0);
})

// import util from 'util';
test('test serialize and deserialize', () => {

    /**
     * root
     *   - sys
     *      - kernel
     *   - user
     *      - text.txt
     *      - desktop
     *          - game
     */
    
    const root = Directory.root;
    const kernel = File.make(null, 'kernel');
    const text = File.make(null, 'text.txt');
    const game = File.make(null, 'game');
 
    const sys = Directory.make(root, 'sys');
    sys.addChild(kernel);
 
    const desktop = Directory.make(null, 'desktop');
    desktop.addChild(game);
    
    const user = Directory.make(root, 'user');
    user.addChildren([desktop, text])

    const s = serializeFileSystem();
    Directory.root.removeAll();
    // console.log(util.inspect(JSON.parse(s), {showHidden: false, depth: null, colors: true}))
    deserializeFileSystem(s);
    expect(JSON.parse(serializeFileSystem())).toMatchObject(JSON.parse(s));
    // console.log(util.inspect(JSON.parse(serializeFileSystem()), {showHidden: false, depth: null, colors: true}))

    Directory.root.removeAll();
    expect(Directory.root.children.length).toBe(0);
})