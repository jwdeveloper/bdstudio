import { GUI } from './guiClass.js';
import { ModalGUI } from './dialog.js';

import { PropertyCommand } from '../commands/property.js';
import { BlockImageGenerator } from '../elements/blockImageGenerator.js'
class SearchGUI extends ModalGUI {
    constructor(editor, args, items = []) {
        super(editor, args);
        this.domElement.classList.add('searchGUI');
        this.parentDom.appendChild(this.domElement);
        this.lastSearchTerm;
        this.items = items;
        this.rowsize = 6;
        let searchGUI = this;

        const propsSearch = {
            searchTerm: '',
            get 'text'() {

                return this.searchTerm;

            },
            set 'text'(v) {
                this.searchTerm = v;

             
                searchGUI.update(v);
                

            },
        }

        this.add(propsSearch, 'text').name('Search').listen();
        this.domElement.addEventListener("wheel", (event) => this.onMouseWheel(event, propsSearch));
        this.isInitalized = false;
        this.onOpen = () => {
            this.sesionLimi = this.loadLimit;
            if (!this.isInitalized) {
                this.onInitialization().then(() => {
                    this.update();
                    this.isInitalized = true;
                })
            }
            else {
                propsSearch.text;
            }
        }


    }

    //should be override 
    async onInitialization() {
    }

    //should be override 
    async onItemSelected(item) {

    }

    async update(searchTerm = '') {
        let scope = this;

        if (scope.folders.length != 0) {
            scope.folders[0].destroy();
        }

        const folderResults = this.addFolder('Results');
        folderResults.domElement.id = 'searchResults';
        var counter = 0;
        for (let item of scope.items) {
            if (item.texture === "") {
                continue;
            }

            if (!(item.displayName + ' ').includes(searchTerm)) {
                continue
            }

            if(counter % this.rowsize ==0)
            {
                await new Promise(r => setTimeout(r, 50));
              
            }
            counter ++;
            let itemElementContent =
            {
                function: scope.onItemSelected.bind(this, item.name)
            }

            

            let itemElement = folderResults.add(itemElementContent, 'function').name(item.name)
            itemElement.domElement.classList.add("search-item")
          
            let texture2D = this.editor.resourcepack.findTexture(item.texture);
            if(texture2D !== undefined)
            {
                itemElement.$button.innerHTML = `
                <img class= "search-item-image pixelated"  src="${texture2D}" alt="${item.name}:${item.texture}"  title="${item.displayName}">
                `
            }

           

            var payload =
            {
                name: item.name,
                editor: scope.editor
            }

            BlockImageGenerator.generateImage(payload, (texture3D, isValid) => 
            {
                if(item.type ==="item" && isValid == false)
                {
                    itemElement.$button.innerHTML = `
                    <div class ="search-item-container" >
                <img class= "search-item-image slide-in-from-right pixelated"  src="${texture2D}" alt="${item.name}:${item.texture}"  title="${item.displayName}">
                </div>
                `
               
                    return
                }

            itemElement.$button.innerHTML = `
                <div class ="search-item-container" >
            <img class= "search-item-image slide-in-from-right"  src="${texture3D}" alt="${item.name}:${item.texture}"  title="${item.displayName}">
            </div>
            `
            });

            this.currentLoad++;
        }
    }
}



class BlockSearchGUI extends SearchGUI {
    constructor(editor, args, items = []) {
        super(editor, args, items);

    }

    async onInitialization() {
        await this.editor.resourcepack.waitForDownload();
        this.items = this.editor.resourcepack.getBlocks();

    }

    async onItemSelected(item) {
        this.hideModal();
        let objects = this.editor.find('selected');
        if (objects.length == 0) {
            let object = await this.editor.add(item, 'BlockDisplay');
            object.selected = true;
            return
        }

        let isAllBlockDisplays = objects.every((element, index) => element.isBlockDisplay);

        if (isAllBlockDisplays) {
            for (let object of objects) {
                const before = JSON.parse(JSON.stringify(object.blockState));
                object.blockState = item;
                const after = JSON.parse(JSON.stringify(object.blockState));
                let command = new PropertyCommand(this.editor, object, 'blockState', after);
                command.beforeValue = before;
                this.editor.history.push(command);

                //await object.updateModel();
                //scope.editor.gui.elements.update();

            }
            //scope.editor.selectAll(objects);
        } else if (objects.length === 1 && objects[0].isCollection) {
            let object = await this.editor.add(item, 'BlockDisplay', objects[0]);
            object.selected = true;
        } else {
            let object = await this.editor.add(item, 'BlockDisplay');
            object.selected = true;
        }
    }
}


class ItemSearchGUI extends SearchGUI {
    constructor(editor, args, items = []) {
        super(editor, args, items);

    }

    async onInitialization() {
        await this.editor.resourcepack.waitForDownload();
        this.items = this.editor.resourcepack.getItems();
    }

    async onItemSelected(item) {
        this.hideModal();
        let objects = this.editor.find('selected');

        if (objects.length) {
            let isAllItemDisplays = objects.every(function (element, index) {
                return element.isItemDisplay;
            });
            if (isAllItemDisplays) {
                for (let object of objects) {
                    const before = JSON.parse(JSON.stringify(object._itemState));
                    object.itemState = item;
                    const after = JSON.parse(JSON.stringify(object._itemState));
                    let command = new PropertyCommand(this.editor, object, 'itemState', after);
                    command.beforeValue = before;
                    this.editor.history.push(command);

                    //await object.updateModel();
                    //scope.editor.gui.elements.update();

                }
                //scope.editor.selectAll(objects);
            } else if (objects.length === 1 && objects[0].isCollection) {
                let object = await this.editor.add(item, 'ItemDisplay', objects[0]);
                object.selected = true;
            } else {
                let object = await this.editor.add(item, 'ItemDisplay');
                object.selected = true;
            }
        } else {
            let object = await this.editor.add(item, 'ItemDisplay');
            object.selected = true;
        }
    }
}

export { BlockSearchGUI, ItemSearchGUI };