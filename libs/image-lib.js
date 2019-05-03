WindowLoadHandler.add(() =>
{
    ImageLib._canvas = document.createElement('canvas');
    ImageLib._ctx = ImageLib._canvas.getContext('2d');
});

var ImageLib = 
{
    canvas: null, ctx: null,

    getImage: (file) =>
    {
        let img = new Image();
        img.src = file;
        return img;
    },

    stageImage: (img, callback, w, h) =>
    {
        if(typeof(img) === 'string')
            img = ImageLib.getImage(img);
        
        img.onload = () =>
        {
            if(w && h)
            {
                ImageLib._canvas.width = w;
                ImageLib._canvas.height = h;
                ImageLib._ctx.drawImage(img, 0, 0, w, h);
            }
            else
            {
                ImageLib._canvas.width = img.width;
                ImageLib._canvas.height = img.height;
                ImageLib._ctx.drawImage(img, 0, 0);
            }

            if(callback)
                callback(img);
        }
    },

    getPixel: (x, y) =>
    {
        return ImageLib._ctx.getImageData(x, y, 1, 1).data;
    }
};