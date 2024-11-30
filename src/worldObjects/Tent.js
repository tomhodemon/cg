import * as THREE from 'three';
import { WorldObject } from './WorldObject';
import { campOffsetX } from '../global';

class Tent extends WorldObject 
{
    modelPath = 'Tent.glb';
    
    constructor(scene, speed) 
	{   
        super(scene, new THREE.Vector3(campOffsetX + 10, 2.5, 18), speed);
        this.scale = 4;
    }

    async initialize() {
        try 
		{
            await this.loadModel(this.modelPath).then(() => { 
                this.mesh.rotation.y = -Math.PI / 2.1;
            });
        } 
		catch (error) 
		{
            console.error(`Failed to load ${this.modelPath}:`, error);
        }
    }
}

export default Tent;