let canvas, ctx;

let tiles = [];

let w, h;

let camera = 
{
    x: 0,
    y: 0
};

class Tile
{
    constructor(color, x, y)
    {
        this._color = color;
        this._x = x;
        this._y = y;
    }

    get x() { return this._x; }
    get y() { return this._y; }

    set x(x) { this._x = x; }
    set y(y) { this._y = y; }

    get color() { return this._color; }
}

function init()
{
    let mapW = 100, mapH = 100;

    for(let y = 0; y < mapH; y++)
    {
        tiles.push([]);

        for(let x = 0; x < mapW; x++)
        {
            if(Math.random() < .2)
                tiles[y].push(new Tile('#048', x * 64, y * 64));
            else
                tiles[y].push(new Tile('#449900', x * 64, y * 64));
        }
    }
}

let downKeys = {};
window.onkeyup = (e) => { downKeys[e.key] = false; }
window.onkeydown = (e) => { downKeys[e.key] = true; }

window.onload = () =>
{
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    canvas.width = w = window.innerWidth;
    canvas.height = h = window.innerHeight;

    init();
    draw();
};

window.onresize = () =>
{
    canvas.width = w = window.innerWidth;
    canvas.height = h = window.innerHeight;
};

function tick()
{
    // Key codes https://keycode.info/
    if(downKeys['ArrowLeft'] || downKeys['a'])
        camera.x -= 10;
    if(downKeys['ArrowRight'] || downKeys['d'])
        camera.x += 10;
    if(downKeys['ArrowUp'] || downKeys['w'])
        camera.y -= 10;
    if(downKeys['ArrowDown'] || downKeys['s'])
        camera.y += 10;
}

function draw()
{
    requestAnimationFrame(draw);
    tick();

    ctx.clearRect(0, 0, w, h);

    for(let y = 0; y < tiles.length; y++)
    {
        for(let x = 0; x < tiles[y].length; x++)
        {
            let tile = tiles[y][x];

            ctx.fillStyle = tile.color;
            ctx.fillRect(tile.x - camera.x, tile.y - camera.y, 64, 64);
            ctx.fillStyle = 'black';
            ctx.strokeRect(tile.x - camera.x, tile.y - camera.y, 64, 64);
        }
    }
}