 export class Resourcepack {
    constructor()
    {
        this._isLoaded = false;
        this.assets = null;
    }

    //Here API could be requested to generated resourcepack.json for selected version
    async downloadResourcepackAsync(version) {
       
        if(version === undefined)
        {
            version = "1.20"
        }

        const assetsPath = version + "/";
        const response = await fetch(assetsPath + 'resourcepack.json');
        this.assets = await response.json();
        
        this._isLoaded = true;
    }

    async waitForDownload()
    {
        while(!this._isLoaded)
        {
            await new Promise(r => setTimeout(r, 10));
        }
        return true;
    }


    isLoaded()
    {
        return this._isLoaded;
    }

    getAssets() 
    {
        this.throwIfNotLoaded();
       return this.assets;
    }

    getItems() {
        this.throwIfNotLoaded();
        return this.assets.items;
    }

    getTextures() {
        this.throwIfNotLoaded();
        return this.assets.textures;
    }

    getBlocks() {
        this.throwIfNotLoaded();
        return this.assets.blocks;
    }

    findTexture(textureName)
    {
        this.throwIfNotLoaded();

        let texture = this.assets.textures[textureName];

        if(texture === undefined)
        {
            return undefined;
        }

        let textureBase = `data:image/png;base64,${texture}`
        return textureBase;
    }


    throwIfNotLoaded()
    {
        if(this._isLoaded == false)
        {
            throw Error("Resourcepack is not downloaded");
        }

        if(this.assets === null || this.assets === undefined)
        {
            throw Error("Resourcepack is not downloaded");
        }
        
        return true;
    }
}