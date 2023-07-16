
import * as THREE from 'three';
import { BlockDisplay } from './BlockDisplay';

const staticRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
const cacheTextures = {}

export class BlockImageGenerator {


    static generateImage(data, callBack) {
        return new Promise(async (resolve, reject) => {
            try
            {
                await BlockImageGenerator.generateImageAsync(data, callBack);
                resolve();
            }
            catch(e)
            {
                reject()
            }
           
        });
    }

    static async generateImageAsync(context, callBack) {
        if (cacheTextures[context.name] !== undefined) {
            let cachedTexture = cacheTextures[context.name];
            await callBack(cachedTexture, true);
            return
        }

        const cube = new BlockDisplay(context.editor);
        try
        {
            cube.blockState = context.name;
            await cube.updateModel();
        }
        catch(e)
        {
            let errorTexture = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAAAAACIM/FCAAAChElEQVR4Ae3aMW/TQBxAcb70k91AAiGuGlZAtOlQApWaDiSdklZq2RPUTm1xUWL3PgqSpygkXlh88N54nn7S2Trd3y/CP5IQIUKECBEiRIgQIUKECBEiRIgQIUKECBEiRIgQIUKECBEiRIgQIUKECBEiRIgQIUKECBEiRIgQIUKECPmPIEKECBEiRIgQIeX82+FBO0naB4eTRRkt5P7sNWt1Rw9RQvKThI2SYR4f5OoVW2rfRAYpT6hqHc8WeVHki9mgRdWwiAmyfA9AdrlaW5tlAHxcxQMpK8feRbGxPEkrSREN5ARg/y780V0GMIwFcgXwLg9byvsAN3FA8lfAfr7jYQZ0nqKAfAb21vYVwNruSoEvMUDuE+Ai7IKECZA+RAA5A7JiN6TMgFHzIeUb4DLshoQZ0H1uPGQOvFzVQZYtYNF4yBg4DnWQMAAmjYccArN6yBQ4ajzkAFjUQ+ZAv/GQNpDXQ3Kg03hIAhT1kAJIhLi1/vJl39Ic6Mf3+a2K8PM7BgahtgEwjuKI0lqGjSI8opRdYFb3sk/jODSGEZCVuyFFDzgPzYc8JMBkN2QMpI8RQMIQ2LvdBblNgdM4Lh/aQJaHrf3sAe2nKCDhGqCfb3VEcx1UNQTItlzQ3fYAvoZYIMUHgHRSbiyPU4BPZUSX2JWEbLZcW5v2qByrmMYKxZCq1mA6z4sin08HLapOy8gGPddtttT5HuHobZiwUXr6K85h6KjLWm/PH+MdTy/GR/12knb6g8mPZ38YECJEiBAhQoQIESJEiBAhQoQIESJEiBAhQoQIESJEiBAhQoQIESJEiBAhQoQIESJEiBAhQoQIESJEiBAhQoQIESJEiBAh0fUb5q7oCGreEVEAAAAASUVORK5CYII=";  
            cacheTextures[context.name] = errorTexture;          
            callBack(errorTexture, false);
            return;
        }

   
        const scene = new THREE.Scene();
        scene.add(cube);

        const cubeSize = 1 * Math.sqrt(2);
        const distance = cubeSize / Math.tan(Math.PI / 6);

        const aspect = 3 / 4;
        const width = cubeSize * aspect;
        const height = cubeSize;
        const camera = new THREE.OrthographicCamera(-width, width, height, -height / 2, 2, distance * 6);
        camera.position.set(distance, distance, distance);
        camera.lookAt(cube.position);


        const yOffset = 0.43;
        const zOffset = 0.0;
        const xOffset = 0.0;
        cube.position.y += yOffset;
        cube.position.z += zOffset;
        cube.position.x += xOffset;

        camera.position.add(new THREE.Vector3(0.5, 0.5, 0.5))

        const scale = 0.3
        cube.scale.add(new THREE.Vector3(scale, scale, scale))


        staticRenderer.setSize(200, 200);
        staticRenderer.render(scene, camera);

        const light = new THREE.PointLight(0xffffff);
        light.position.set(12, 12, 33);
        scene.add(light);


        //For some reason, textures are aplied to model after 2 frames 
        requestAnimationFrame(() => 
        {
            staticRenderer.render(scene, camera);
            requestAnimationFrame(() => {
                staticRenderer.render(scene, camera);
                const output = staticRenderer.domElement.toDataURL();
                cacheTextures[context.name] = output;
                callBack(output, true);
                return
            })
        })
    }

}