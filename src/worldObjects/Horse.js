import * as THREE from 'three';
import { AnimatedWorldObject } from './AnimatedWorldObject';


class Horse extends AnimatedWorldObject 
{
    modelPath = 'Horse.glb';

    constructor(scene, position, speed, defautAnimation, rotation = Math.PI / 2) 
	{   
        super(scene, position, speed, defautAnimation);

        this.scale = 1.35;
        this.rotation = rotation;
    }

    async initialize() {
        try 
		{
            await this.loadModel(this.modelPath);
        } 
		catch (error) 
		{
            console.error(`Failed to load ${this.modelPath}:`, error);
        }
    }
    
    setupAnimations(animations)
    {
        console.log(animations);
        this.mixer = new THREE.AnimationMixer(this.mesh);

        animations.forEach(clip => {
            this.actions[clip.name] = this.mixer.clipAction(clip);
        });

        if (this.currentAnimation && this.actions[this.currentAnimation]) 
        {
            this.actions[this.currentAnimation].play();
        }
    }

    /*
        Override update method.
    */
    update(timeElapsed) 
    {
        super.update(timeElapsed);
        /*
            Update position.
        */
        this.position.x += this.speed * timeElapsed;
        this.mesh.position.x = this.position.x;
    }
}

export default Horse;