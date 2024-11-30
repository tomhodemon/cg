import * as THREE from 'three';

import { AnimatedWorldObject } from './AnimatedWorldObject';

class Cube extends AnimatedWorldObject 
{
    constructor(scene, position, speed, defaultAnimation) 
	{
        super(scene, position, speed, defaultAnimation);

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
            console.error('Failed to load cube:', error);
        }
    }

    /*
        Override loadModel method.
    */
    loadModel() 
    { 
        return new Promise((resolve, reject) => {
            this.mesh = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1),
                new THREE.MeshPhongMaterial({ color: 0x00ff00 })
            );

            this.mesh.position.copy(this.position);
            this.mesh.scale.setScalar(this.scale);
            this.scene.add(this.mesh);
            this.mesh.castShadow = true;

            /*
                Create a mixer and set up animations.
            */
            this.mixer = new THREE.AnimationMixer(this.mesh);

            const rotateAnimation = new THREE.AnimationClip('rotate', -1, [
                new THREE.VectorKeyframeTrack('.rotation[y]', [0, 1, 2], [0, Math.PI, 2 * Math.PI])
            ]);
    
            const translateAnimation = new THREE.AnimationClip('translate', -1, [
                new THREE.VectorKeyframeTrack('.position[x]', [0, 1, 2], [0, 2, 0])
            ]);
    
            this.actions['rotate'] = this.mixer.clipAction(rotateAnimation);
            this.actions['translate'] = this.mixer.clipAction(translateAnimation);

            this.actions[this.currentAnimation].play();

            this.loaded = true;

            resolve();
        });
    }
}   

export default Cube;