/**
 * Stuff to draw to.
 */
let canvas, ctx;

/**
 * Every tile in the game (a 2d array)
 */
let tiles = [];

/**
 * Dimensions of the window
 */
let w, h;

/**
 * The dimensions of each tile
 */
const DIMENSIONS = 64;

/**
 * Stores the camera offsets
 */
let camera = 
{
    x: 0,
    y: 0
};

/**
 * Stores the mouse coords
 */
let mouse =
{
    x: 0,
    y: 0,
    down: false,
    justDown: false
};

/**
 * Stores the corresponding colors to each player
 */
const playerColors = 
[
    '20,20,20',
    '73,27,73',
    '27,73,0',
    '73,27,0',
    '0,27,73'
];

/**
 * Stores the dots available to each player (.length is how many players are playing)
 */
let players = [];

/**
 * The current player that's up
 * MAKE SURE THIS GOES FROM 1-4; 0 is neutral (as in no player)
 */
let currentPlayer = 1;

/**
 * No player owns this tile
 */
const NEUTRAL = 0;

/**
 * For the gui
 */
let btns = [];

/**
 * Every tile in the game
 */
class Tile
{
    /**
     * Every tile in the game
     * @param {number} x Actual x coordinate
     * @param {number} y Actual y coordinate
     * @param {number} player Index of the player (in the color list (0 for neutral, undefined or -1 for no player there))
     */
    constructor(x, y, player)
    {
        this._x = x;
        this._y = y;
        this._dots = 0;
		
		//Why, why would you ever do this?
        //this._player = player === undefined ? -1 : player;
		if(player === undefined)
		{
			this.player = -1;
		}
		else
		{
			this._player = player;
		}
    }

    get player() { return this._player; }
    set player(p) { this._player = p ; }
    
    get moveable() { return this.player !== -1; }

    get x() { return this._x; }
    get y() { return this._y; }

    set x(x) { this._x = x; }
    set y(y) { this._y = y; }

    set dots(dots) { this._dots = dots; }
    get dots() { return this._dots; }
    addDots(d) { this.dots += d; }

    get color() { return this.player !== -1 ? playerColors[this.player] : '#000' }
}

/**
 * Initializes the game to be played
 * @param {number} numPlayers How many players will be playing
 */
function init(numPlayers)
{
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    canvas.width = w = window.innerWidth;
    canvas.height = h = window.innerHeight;

    ctx.font = "20px Arial";

    for(let i = 0; i <= numPlayers; i++)
    {
        players.push(0);
    }

    loadMap('map.png', numPlayers, () =>
    {
        setInterval(tick, 1000 / 60);
        draw();

        // Start off with player 1 (next player iterates current player by 1)
        currentPlayer = 0;
        nextPlayer();
    });

    btns.push(
        new Button('btns/next.png', () => {nextPlayer(); }, (btn) =>
        {
            btn.x = w - 150;
            btn.y = h - 150;
            btn.width = 100;
            btn.height = 100;
        })
    );
}

/**
 * Fills the tiles[][] 2d array from the map image
 * @param {string} map The map's file name (assumed to be in maps/ directory)
 * @param {Function} callback Called after the map is done loading
 */
function loadMap(map, numPlayers, callback)
{
    ImageLib.stageImage(`maps/${map}`, (img) =>
    {
        let splitCols = [];
        playerColors.forEach(c =>
            {
                let col = [];
                let split = c.split(',');
                col.push(Number(split[0]));
                col.push(Number(split[1]));
                col.push(Number(split[2]));
                splitCols.push(col);
            });

        console.log(splitCols)

        for(let y = 0; y < img.height; y++)
        {
            tiles.push([]);

            for(let x = 0; x < img.width; x++)
            {
                let pixel = ImageLib.getPixel(x, y);
                for(let i = 0; i < splitCols.length; i++)
                {
                    let c = splitCols[i];

                    if( c[0] === pixel[0] &&
                        c[1] === pixel[1] &&
                        c[2] === pixel[2])
                    {
                        if(i <= numPlayers)
                        {
                            tiles[y][x] = new Tile(x * DIMENSIONS, y * DIMENSIONS, i);
                            if(i !== NEUTRAL)
                                tiles[y][x].dots = 3;
                        }
                        else
                            tiles[y][x] = new Tile(x * DIMENSIONS, y * DIMENSIONS, NEUTRAL);
                        break;
                    }
                };

                if(!tiles[y][x])
                    tiles[y][x] = new Tile(x * DIMENSIONS, y * DIMENSIONS);
            }
        }

        if(callback)
            callback();
    });
}

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

    let guiElementOver = null;
    btns.forEach(b =>
        {
            if(b.isWithin(mouse.x, mouse.y))
            {
                guiElementOver = b;
                return;
            }
        });
    
    if(guiElementOver)
    {
        if(mouse.justDown)
        {
            guiElementOver.onclick();
        }
    }

    mouse.justDown = false;
}

function draw()
{
    requestAnimationFrame(draw);

    ctx.clearRect(0, 0, w, h);

    let tileOver = getTileMouseOver();

    let guiElementOver = null;
    btns.forEach(b =>
        {
            if(b.isWithin(mouse.x, mouse.y))
            {
                guiElementOver = b;
                return;
            }
        });

    for(let y = Math.floor(camera.y / DIMENSIONS); y < (camera.y + h) / DIMENSIONS; y++)
    {
        for(let x = Math.floor(camera.x / DIMENSIONS); x < (camera.x + w) / DIMENSIONS; x++)
        {
            let tile = tiles[y][x];

            let drawX = tile.x - camera.x;
            let drawY = tile.y - camera.y;

            ctx.fillStyle = `rgb(${tile.color})`;
            ctx.fillRect(drawX, drawY, DIMENSIONS, DIMENSIONS);

            if(!guiElementOver)
            {
               // Shows the user what tile they're hovering over
                if(tile.moveable && tileOver === tile)
                {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                    ctx.fillRect(drawX, drawY, DIMENSIONS, DIMENSIONS);
                }
            }

            ctx.fillStyle = 'black';
            ctx.strokeRect(drawX, drawY, DIMENSIONS, DIMENSIONS);

            if(tile.dots > 0)
            {
                let subAmt = ~~Math.round(tile.dots / 10 * 255);

                if(tile.player === getCurrentPlayer())
                    ctx.fillStyle = `rgb(${255 - subAmt}, 255, ${255 - subAmt})`;
                else
                    ctx.fillStyle = `rgb(255, ${255 - subAmt}, ${255 - subAmt})`;

                ctx.fillText(tile.dots, drawX - ctx.measureText(tile.dots).width / 2 + DIMENSIONS / 2, drawY + DIMENSIONS / 2 + 8)
            }
        }
    }

    btns.forEach(b =>
    {
        if(b.ready)
        {
            ctx.drawImage(b.sprite, b.x, b.y, b.width, b.height);
            if(guiElementOver === b)
            {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.fillRect(b.x, b.y, b.width, b.height);
            }
        }
    });
    
    ctx.fillStyle = `rgba(${getPlayerColor()},0.8)`;
    ctx.fillRect(w / 2 - 60, 32 - 25, 120, 50);

    let text = `${getDots()} dot${getDots() === 1 ? '' : 's'}`;
    ctx.fillStyle = 'white';
    ctx.fillText(text, w / 2 - ctx.measureText(text).width / 2, 32 * 2 - 25);
}

/**
 * How many dots to reward the given player this turn (this will not add their previous dots)
 * @param {number} playerNum The index of the player
 */
function calculateDots(playerNum)
{
    let pts = 0;
    tiles.forEach(tilesArr =>
        {
            tilesArr.forEach(t =>
                {
                    pts += t.player === playerNum ? 1 : 0;
                });
        });
    
    return Math.round(Math.log(pts * 10));
}

/**
 * Cycles over to the next player
 */
function nextPlayer()
{
    currentPlayer++;
    if(players[currentPlayer] === undefined) // Max player reached
        currentPlayer = 1;

    players[currentPlayer] += calculateDots(currentPlayer);
}

function getDots()
{
    return players[getCurrentPlayer()];
}

/**
 * Gets the index of the current player
 */
function getCurrentPlayer()
{
    return currentPlayer;
}

function getPlayerColor()
{
    return playerColors[getCurrentPlayer()];
}

/**
 * Gets the tile the mouse is over, or null if it isn't over any tile
 */
function getTileMouseOver()
{
    if(mouse.x < 0 || mouse.x > w || mouse.y < 0 || mouse.y > h)
        return null;

    let iX = Math.floor((mouse.x + camera.x) / DIMENSIONS);
    let iY = Math.floor((mouse.y + camera.y) / DIMENSIONS);

    return tiles[iY][iX];
}

class Button
{
    constructor(sprite, onclick, onresize)
    {
        this._x = undefined;
        this._y = undefined;
        this._width = undefined;
        this._height = undefined;

        this._sprite = new Image();
        this._sprite.src = `images/${sprite}`;
        this._sprite.onload = () => { this._ready = true; this.onresize(this) };
        this._onclick = onclick;
        this._ready = false;

        if(!onresize)
            this._onresize = () => {};
        else
            this._onresize = onresize;
    }

    isWithin(x, y)
    {
        return this.x <= x && this.x + this.width >= x && this.y <= y && this.y + this.height >= y;
    }

    get ready() { return this._ready; }

    get height() { return this._height; }
    set height(height) { this._height = height; }

    get onclick() { return this._onclick; }
    set onclick(onclick) { this._onclick = onclick; }

    get sprite() { return this._sprite; }
    set sprite(sprite) { this._sprite = sprite; }

    get x() { return this._x; }
    set x(x) { this._x = x; }

    get y() { return this._y; }
    set y(y) { this._y = y; }

    get width() { return this._width; }
    set width(width) { this._width = width; }

    get onresize() { return this._onresize; }
    set onresize(onresize) { this._onresize = onresize; }
}

//// UTIL STUFF

let downKeys = {};
window.onkeyup = (e) => { downKeys[e.key] = false; }
window.onkeydown = (e) => { downKeys[e.key] = true; }


function clamp(v, min, max)
{
    if(v < min)
        return min;
    if(v > max)
        return max;

    return v;
}

window.onmousemove = e =>
{
    mouse.x = e.x;
    mouse.y = e.y;
};

window.onresize = () =>
{
    canvas.width = w = window.innerWidth;
    canvas.height = h = window.innerHeight;

    btns.forEach(b => b.onresize(b));

    ctx.font = "20px Arial";
};

window.onmousedown = e =>
{
    mouse.down = true;
    mouse.justDown = true;
};

window.onmouseup = e =>
{
    mouse.down = false;
    mouse.justDown = false;
};