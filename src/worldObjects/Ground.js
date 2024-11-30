import * as THREE from 'three';

import { WorldObject } from './WorldObject';

class Ground extends WorldObject 
{
    constructor(scene, position, speed) 
	{
        super(scene, position, speed);

        this.scale = 1;
    }

    async initialize() 
    {
        try 
        {
            await this.loadModel();
        }
        catch (error) 
        {
            console.error('Failed to load ground:', error);
        }
    }

    /*
        Override loadModel method.
    */
    async loadModel() 
    { 
        const planeWidth = 10000;
        const planeHeight = 10000;
        let groundGeo = new THREE.PlaneGeometry(planeWidth, planeHeight);
        let groundMat = new THREE.MeshLambertMaterial({color: 0xf6d7b0});
        
        let ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = - Math.PI / 2;
        ground.castShadow = true;
        ground.receiveShadow = true;

        this.scene.add(ground);
        this.loaded = true;
    }
}   

export default Ground;