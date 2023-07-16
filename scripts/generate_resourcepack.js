
const fs = require('fs');

function validate(fileName) {
    var blackList = [
        "_ne","_sw","_ne","_sw",
        "_x","_y","_z",
        "_top","_down","_side","_bottom",
        "_inner","_outer",
        "_open","_close",
        "left","right",
      
        "_horizontal",
        "_bottle",
        "_empty",
        "candles",
        "clock_",
        "compass_",
        "_trim",
        "_pressed",
        "_inventory",
        "_on",
        "age"
    ]

    for(var item of blackList)
    {
          if(fileName.includes(item))
          {
            return false;
          }
    }
  
    return true;
}


function getFiles(dir, isValidation) {
    const files = []
    const fileList = fs.readdirSync(dir);
    for (const file of fileList) {

        if (isValidation == true && !validate(file)) {
            continue;
        } 
        const name = `${dir}\\${file}`;
        files.push(
            {
                name: file,
                path: name
            }
        );
    }
    return files;
}




function getFileContenet(fileInfo) {

    var content = fs.readFileSync(fileInfo.path, { encoding: 'utf8' });
    var json = JSON.parse(content);

    var textureName = "";
    if (json.textures !== undefined) {
        var value = Object.values(json.textures)[0];
        value = value.replace("minecraft:","");
        if(value.includes("item"))
        {
           // textureName = value.replace('item/', '1.20/assets/minecraft/textures/item/') 
           textureName = value.replace("item/","")
        }
        if(value.includes("block"))
        {
          //  textureName = value.replace('block/', '1.20/assets/minecraft/textures/block/')
          textureName = value.replace("block/","")
        }

     

    }
    var blockName = fileInfo.name.replace(".json", "");
    var displayName = blockName.replace("_"," ")

    var result =
    {
        name: blockName,
        displayName: displayName,
        texture: textureName
    }

    return result;
}


function getBlocks()
{
    const inputDicionaryPath =  "public\\1.20\\assets\\minecraft\\models\\block";
    const files = getFiles(inputDicionaryPath, true);
    const outputContent = [];
    for (let file of files)
     {
        const result = getFileContenet(file);
        result.type = "block"
        outputContent.push(result)
    }
    return outputContent;
}


function getItems()
{
    const inputDicionaryPath = "public\\1.20\\assets\\minecraft\\models\\item";
    const files = getFiles(inputDicionaryPath, true);
    const outputContent = [];
    for (let file of files)
     {
        const result = getFileContenet(file);
        result.type = "item"
        outputContent.push(result)
    }
    return outputContent;
}


function getTextures()
{
    const inputDicionaryPath = "public\\1.20\\assets\\minecraft\\textures\\item";
    const blockDicionrayPath = "public\\1.20\\assets\\minecraft\\textures\\block";

    const itemsTexturesPaths = getFiles(inputDicionaryPath, false);
    const blocksTexturesPaths = getFiles(blockDicionrayPath, false);
    const texturesPaths = itemsTexturesPaths.concat(blocksTexturesPaths);
    const outputContent = {};
    
    for (let file of texturesPaths)
     {
        const content = fs.readFileSync(file.path, 'base64');
        const name = file.name.replace(".png","");
        outputContent[name] = content;
    }

    return outputContent;
}



function generateResourcepackJson()
{

    const result =
    {
        blocks: getBlocks(),
        items: getItems(),
        textures: getTextures()
    }


    const outputFilePath = "public\\1.20\\resourcepack.json";
    const json = JSON.stringify(result, null, "  ");
   // console.log(result);
    fs.writeFileSync(outputFilePath, json);
}



generateResourcepackJson()