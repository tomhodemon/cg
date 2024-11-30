import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

import { WorldObject } from './WorldObject';


class Tunnel extends WorldObject 
{   
    modelPath = 'Tunnel.fbx';
    modelTexturePath = 'Tunnel.png';
    
    constructor(scene, position, speed) 
	{
        super(scene, position, speed);
        this.scale = 0.03;
    }

    async initialize() {
        try 
		{
            await this.loadModel(this.modelPath, this.modelTexturePath);
        } 
		catch (error) 
		{
            console.error(`Failed to load ${this.modelPath}:`, error);
        }
    }

    /*
        Overwrite loadModel method.
    */
    loadModel(modelPath, texturePath) 
    {
        let texLoader = new THREE.TextureLoader();
        texLoader.setPath('assets/worldObjects/Textures/');
        let texture = texturePath ? texLoader.load(texturePath) : null;
    
        let loader = new FBXLoader();
        return new Promise((resolve, reject) => {
            loader.setPath('assets/worldObjects/FBX/');
            loader.load(modelPath, (obj) => {
                this.mesh = obj;
                this.scene.add(this.mesh);
                
                this.mesh.scale.setScalar(this.scale);
                this.mesh.position.copy(this.position);
                
                obj.traverse(c => {
                    if (c.isMesh) {
                        if (texture && c.material) 
                        {
                            let materials = Array.isArray(c.material) ? c.material : [c.material];
                            materials.forEach(m => {
                                if (m) {
                                    m.map = texture;
                                    m.specular = new THREE.Color(0x000000);
                                }
                            });
                        }
                        c.castShadow = true;
                        c.receiveShadow = true;
                    }
                });

                /*
                    Compute the bounding radius after the model is loaded and scaled.
                */
                this.computeBoundingRadius();
                this.loaded = true;

                resolve(this);
            }, undefined, reject);
        });
    }

    /*
        Override update method.
    */
    update(timeElapsed) 
    {
        
    }
}

export default Tunnel;