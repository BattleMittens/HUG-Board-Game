let funcs = [];

var WindowLoadHandler =
{
    add: (func) =>
    {
        funcs.push(func);
    }
};

window.onload = function()
{
    funcs.forEach(f => f());
}