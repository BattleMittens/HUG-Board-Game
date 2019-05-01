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
                tiles[y].push(new Tile('#490', x * 64, y * 64));
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
        camera.x -= 5;
    if(downKeys['ArrowRight'] || downKeys['d'])
        camera.x += 5;
    if(downKeys['ArrowUp'] || downKeys['w'])
        camera.y -= 5;
    if(downKeys['ArrowDown'] || downKeys['s'])
        camera.y += 5;

    camera.x = clamp(camera.x, 0, tiles[0].length * 64 - w);
    camera.y = clamp(camera.y, 0, tiles.length * 64 - h);
}

function clamp(v, min, max)
{
    if(v < min)
        return min;
    if(v > max)
        return max;

    return v;
}
function draw()
{
    requestAnimationFrame(draw);
    tick();

    ctx.clearRect(0, 0, w, h);

    for(let y = Math.floor(camera.y / 64); y < (camera.y + h) / 64; y++)
    {
        for(let x = Math.floor(camera.x / 64); x < (camera.x + w) / 64; x++)
        {
            let tile = tiles[y][x];

            ctx.fillStyle = tile.color;
            ctx.fillRect(tile.x - camera.x, tile.y - camera.y, 64, 64);
            ctx.fillStyle = 'black';
            ctx.strokeRect(tile.x - camera.x, tile.y - camera.y, 64, 64);
        }
    }
}