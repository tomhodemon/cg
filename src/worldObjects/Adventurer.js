import * as THREE from 'three';
import { AnimatedWorldObject } from './AnimatedWorldObject';


class Adventurer extends AnimatedWorldObject 
{
    modelPath = 'Adventurer.glb';
    
    constructor(scene, position, speed, defaultAnimation, rotation = 0) 
	{   
        super(scene, position, speed, defaultAnimation);

        this.scale = 3;
        this.rotation = rotation;
    }

    async initialize() {
        try 
		{
            await this.loadModel(this.modelPath);
            this.mesh.rotation.y = this.rotation;
        } 
		catch (error) 
		{
            console.error(`Failed to load ${this.modelPath}:`, error);
        }
    }

    setupAnimations(animations)
    {
        this.mixer = new THREE.AnimationMixer(this.mesh);

        animations.forEach(clip => {
            this.actions[clip.name] = this.mixer.clipAction(clip);
        });

        if (this.currentAnimation && this.actions[this.currentAnimation]) {
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

export default Adventurer;