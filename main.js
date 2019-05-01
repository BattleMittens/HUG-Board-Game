let canvas, ctx;

let tiles = [];

let w, h;

const DIMENSIONS = 64;

let camera = 
{
    x: 0,
    y: 0
};

let mouse =
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
    
    get moveable() { return this.color !== 'black'; }

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
                tiles[y].push(new Tile('black', x * DIMENSIONS, y * DIMENSIONS));
            else
                tiles[y].push(new Tile('#333', x * DIMENSIONS, y * DIMENSIONS));
        }
    }
}

let downKeys = {};
window.onkeyup = (e) => { downKeys[e.key] = false; }
window.onkeydown = (e) => { downKeys[e.key] = true; }

window.onmousemove = e =>
{
    mouse.x = e.x;
    mouse.y = e.y;
};

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

    camera.x = clamp(camera.x, 0, tiles[0].length * DIMENSIONS - w);
    camera.y = clamp(camera.y, 0, tiles.length * DIMENSIONS - h);
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

    let tileOver = getTileMouseOver();

    for(let y = Math.floor(camera.y / DIMENSIONS); y < (camera.y + h) / DIMENSIONS; y++)
    {
        for(let x = Math.floor(camera.x / DIMENSIONS); x < (camera.x + w) / DIMENSIONS; x++)
        {
            let tile = tiles[y][x];

            ctx.fillStyle = tile.color;
            ctx.fillRect(tile.x - camera.x, tile.y - camera.y, DIMENSIONS, DIMENSIONS);

            if(tile.moveable && tileOver === tile)
            {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.fillRect(tileOver.x, tileOver.y, DIMENSIONS, DIMENSIONS);
            }

            ctx.fillStyle = 'black';
            ctx.strokeRect(tile.x - camera.x, tile.y - camera.y, DIMENSIONS, DIMENSIONS);
        }
    }
}

function getTileMouseOver()
{
    if(mouse.x < 0 || mouse.x > w || mouse.y < 0 || mouse.y > h)
        return null;

    let iX = Math.floor((mouse.x - camera.x) / 64);
    let iY = Math.floor((mouse.y - camera.y) / 64);

    return tiles[iY][iX];
}