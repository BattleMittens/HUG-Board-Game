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
 * Their dots will be this value if they are dead.
 */
const DEAD = -1;

/**
 * For image to map loading.
 * If the alpha is this value that tile is a capitol
 */
const CAPITOL_ALPHA = 128;

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
    '73,27,73', //  y
    '27,73,0', // y
    '73,27,0', // y
    '0,27,73', // y
    '0,73,50', // y
    '50,50,27', // y
    '50,27,50', // y
    '50,27,0' // y
];

let overlayColor = '0,0,0,0';

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

let paused = false;

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
        this._capitol = false;
		
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
    addDots(d, p)
    {
        if(p === this.player)
            this.dots += d;
        else
        {
            this.dots -= d;
            if(this.dots < 0)
            {
                this.dots *= -1;
                return true;
            }
        }

        return false;
    }

    set capitol(c) { this._capitol = c; }
    get capitol() { return this._capitol; }

    get color() { return this.player !== -1 ? playerColors[this.player] : '0,0,0' }
}

/**
 * Initializes the game to be played
 * @param {number} numPlayers How many players will be playing
 */
function init(numPlayers)
{
    window.onbeforeunload = () =>
    {
        return "Dude, are you sure you want to leave? Think of the kittens!";
    }

    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    canvas.width = w = window.innerWidth;
    canvas.height = h = window.innerHeight;

    ctx.font = "20px Arial";

    registerWindowEvents();

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
        new Button('btns/next.png', () => { nextPlayer(); }, (btn) =>
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

        for(let y = 0; y < img.height; y++)
        {
            tiles.push([]);

            for(let x = 0; x < img.width; x++)
            {
                let pixel = ImageLib.getPixel(x, y);

                for(let i = 0; i < splitCols.length; i++)
                {
                    let c = splitCols[i];
                    
                    if( within(c[0], pixel[0], 10) &&
                        within(c[1], pixel[1], 10) &&
                        within(c[2], pixel[2], 10))
                    {
                        if(i <= numPlayers)
                        {
                            tiles[y][x] = new Tile(x * DIMENSIONS, y * DIMENSIONS, i);
                            if(i !== NEUTRAL)
                            {
                                tiles[y][x].dots = 3;
                                if(pixel[3] === CAPITOL_ALPHA)
                                {
                                    tiles[y][x].capitol = true;
                                }
                            }
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

function within(x, y, variation)
{
    return Math.abs(x - y) <= variation;
}

async function tick()
{
    let overlaySplit = overlayColor.split(',');
    overlaySplit[3] = overlaySplit[3] > 0 ? overlaySplit[3] - 0.03 : 0;
    setOverlayColor(...overlaySplit);

    if(!paused)
    {
        // Key codes: https://keycode.info/
        if(downKeys['ArrowLeft'] || downKeys['a'])
            camera.x -= 5;
        if(downKeys['ArrowRight'] || downKeys['d'])
            camera.x += 5;
        if(downKeys['ArrowUp'] || downKeys['w'])
            camera.y -= 5;
        if(downKeys['ArrowDown'] || downKeys['s'])
            camera.y += 5;

        clampCamera();

        let guiElementOver = null;
        btns.forEach(b =>
            {
                if(b.isWithin(mouse.x, mouse.y))
                {
                    guiElementOver = b;
                    return;
                }
            });
        
        if(mouse.justDown)
        {
            if(guiElementOver)
            {
                guiElementOver.onclick();
            }
            else
            {
                let t = getTileMouseOver();
                if(t.moveable && isAdjacent(t.x / DIMENSIONS, t.y / DIMENSIONS, getCurrentPlayer()))
                {
                    if(getDots() > 0)
                    {
                        if(t.addDots(1, getCurrentPlayer()))
                        {
                            if(t.player !== NEUTRAL)
                            {
                                let correct = await askQuestion(nextQuestion());
                                if(correct)
                                {
                                    if(t.capitol)
                                    {
                                        killPlayer(t.player);
                                    }
                                    t.player = getCurrentPlayer();
                                }
                                else
                                    t.dots = 0;
                            }
                            else
                                t.player = getCurrentPlayer();
                        }

                        removeDots(1);
                    }
                }
            }
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

            if(tile.capitol)
            {
                ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
                ctx.fillRect(drawX, drawY, DIMENSIONS, DIMENSIONS);
            }

            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            if(!guiElementOver)
            {
                // Shows the user what tile they're hovering over
                if(!paused && tile.moveable && tileOver === tile)
                {
                    ctx.fillRect(drawX, drawY, DIMENSIONS, DIMENSIONS);
                }
            }

            if(getDots() > 0 && tile.player !== getCurrentPlayer() && tile.moveable && isAdjacent(x, y, getCurrentPlayer()))
            {
                ctx.fillRect(drawX, drawY, DIMENSIONS, DIMENSIONS);
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
            if(!paused && guiElementOver === b)
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

    ctx.fillStyle = 'rgba(' + overlayColor + ')';
    ctx.fillRect(0, 0, w, h);
}

function isAdjacent(x, y, player)
{
    for(let dx = -1; dx <= 1; dx++)
    {
        for(let dy = -1; dy <= 1; dy++)
        {
            if(dy + y >= 0 && dy + y < tiles.length)
            {
                if(dx + x >= 0 && dx + x < tiles[dy + y].length)
                {
                    if(tiles[dy + y][dx + x].player === player)
                    {
                        return true;
                    }
                }
            }
        }
    }

    return false;
}

function killPlayer(player)
{
    for(let y = 0; y < tiles.length; y++)
    {
        for(let x = 0; x < tiles[y].length; x++)
        {
            if(tiles[y][x].player === player)
            {
                tiles[y][x].player = NEUTRAL;
                tiles[y][x].dots = 0;
                tiles[y][x].capitol = false;
                players[player] = DEAD;
            }
        }
    }
}

/**
 * How many dots to reward the given player this turn (this will not add their previous dots)
 * @param {number} playerNum The index of the player
 */
async function calculateDots(playerNum)
{
    let pts = 0;
    tiles.forEach(tilesArr =>
        {
            tilesArr.forEach(t =>
                {
                    pts += t.player === playerNum ? 1 : 0;
                });
        });
    
    let correct = await askQuestion(nextQuestion());
    
    let base = Math.log2(pts * 10);
    return Math.round(correct ? base : base / Math.log(pts));
}

async function askQuestion(question)
{
    pauseTicking(true);

    document.getElementById('player').innerHTML = 'Player ' + getCurrentPlayer();
    document.getElementById('player').style.color = 'rgb(' + getPlayerColor() + ')';
    document.getElementById('question-prompt').style.display = 'inline-block';
    document.getElementById('question').innerHTML = question.question;
    document.getElementById('answer-a').innerHTML = question.a;
    document.getElementById('answer-b').innerHTML = question.b;
    document.getElementById('answer-c').innerHTML = question.c;
    document.getElementById('answer-d').innerHTML = question.d;
    
    let correct;

    await new Promise(resolve =>
        {
            document.getElementById('btn-a').onclick = () => resolve(false);
            document.getElementById('btn-b').onclick = () => resolve(false);
            document.getElementById('btn-c').onclick = () => resolve(false);
            document.getElementById('btn-d').onclick = () => resolve(false);

            question.correct.split(',').forEach(correct =>
            {
                document.getElementById('btn-' + correct).onclick = () => resolve(true);
            });

        }).then(res => correct = res);
    
    document.getElementById('question-prompt').style.display = 'none';
    
    if(correct)
        setOverlayColor(0, 255, 0, 0.8);
    else
        setOverlayColor(255, 0, 0, 0.8);

    pauseTicking(false);
    return correct;
}

/**
 * Cycles over to the next player
 */
async function nextPlayer()
{
    let playerAlive = undefined;
    let i;
    for(i = 1; i < players.length; i++)
    {
        if(players[i] !== DEAD)
        {
            if(playerAlive === undefined)
                playerAlive = i;
            else
                break;
        }
    }
    
    if(i === players.length)
        gameOver(playerAlive);
    else
    {
        if(players[currentPlayer + 1] === undefined) // Max player reached
            currentPlayer = 1;
        else
            currentPlayer++;

        if(players[currentPlayer] === DEAD)
            nextPlayer();

        players[currentPlayer] += await calculateDots(currentPlayer);

        let tile = findCapitol(currentPlayer);
        camera.x = tile.x - w / 2;
        camera.y = tile.y - h / 2;

        clampCamera();
    }
}

function clampCamera()
{
    camera.x = clamp(camera.x, 0, tiles[0].length * DIMENSIONS - w);
    camera.y = clamp(camera.y, 0, tiles.length * DIMENSIONS - h);
}

function findCapitol(player)
{
    for(let y = 0; y < tiles.length; y++)
        for(let x = 0; x < tiles[y].length; x++)
            if(tiles[y][x].player === player && tiles[y][x].capitol)
                return tiles[y][x];
    return null;
}

function gameOver(p)
{
    window.onbeforeunload = undefined;

    canvas.style.display = 'none';
    document.getElementById('gameover-screen').style.display = 'inline-block';
    document.getElementById('win-player').innerHTML = '<span style="color: rgb(' + playerColors[p] + ');">Player ' + p + ' has won!</span>';
}

function pauseTicking(p)
{
    paused = p;
}

function getDots()
{
    return players[getCurrentPlayer()];
}

function removeDots(amt)
{
    players[getCurrentPlayer()] -= amt;
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

function setOverlayColor(r, g, b, a)
{
    overlayColor = `${r},${g},${b},${a}`;
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

function registerWindowEvents()
{
    window.onkeyup = (e) => { downKeys[e.key] = false; }
    window.onkeydown = (e) => { downKeys[e.key] = true; }

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
}

function clamp(v, min, max)
{
    if(v < min)
        return min;
    if(v > max)
        return max;

    return v;
}