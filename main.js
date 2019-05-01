let canvas, ctx;
let drawables = [];

let tiles = [];

let w, h;

class Tile
{
    constructor(color)
    {
        this._color = color;
    }

    get color() { return this._color; }
}

function init()
{
    for(let i = 0; i < 100; i++)
    {
        tiles.push([]);

        tiles[i].push(new Tile('#048'));
        tiles[i].push(new Tile('#987'));
    }
}

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

function draw()
{
    requestAnimationFrame(draw);
    ctx.clearRect(0, 0, w, h);

    let r = 0, b = 0, g = 0;
    // let r = Math.random() * 256;
    // let g = Math.random() * 256;
    // let b = Math.random() * 256;
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;

    ctx.fillRect(0, 0, w, h);

    for(let y = 0; y < tiles.length; y++)
    {
        ctx.fillStyle = tiles[y][0].color;
        ctx.fillRect(0, y * 64, 64, 64);
        ctx.fillStyle = tiles[y][1].color;
        ctx.fillRect(w - 64, y * 64, 64, 64);
    }

    // drawables.forEach(d =>
    // {
    //     d.draw(ctx);
    // });
}