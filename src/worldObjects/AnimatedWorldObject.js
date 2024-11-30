import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { WorldObject } from './WorldObject';


class AnimatedWorldObject extends WorldObject
{
    constructor(scene, position, speed, defaultAnimation) 
    {
        super(scene, position, speed);

        /* 
            Specific to an animated world object.  
        */
        this.currentAnimation = defaultAnimation;

        this.mixer = null;
        this.actions = {};
    }

    /*
        Override loadModel method.
    */
    loadModel(modelPath) 
    {
        const loader = new GLTFLoader();
        loader.setPath('assets/worldObjects/GLB/');

        return new Promise((resolve, reject) => {
            loader.load(modelPath, 
                (gltf) => {
                    /*
                        Setup mesh and add to scene.
                    */
                    this.mesh = gltf.scene;
                    this.scene.add(this.mesh);

                    /*
                        Configure mesh properties.
                    */
                    this.mesh.position.copy(this.position);
                    this.mesh.scale.setScalar(this.scale);
                    this.setupShadows();

                    /*
                        Setup animations.
                    */
                    this.setupAnimations(gltf.animations);

                    /*
                        Compute the bounding radius after the model is loaded and scaled.
                    */
                    this.computeBoundingRadius();
                    this.loaded = true;

                    resolve();
                },
                /*
                    Progress callback - not used but kept for clarity.
                */
                undefined,
                /*
                    Error callback.
                */
                (error) => {
                    console.error(`Failed to load model ${modelPath}:`, error);
                    reject(error);
                }
            );
        });
    }

    /*
        Override update method.
    */
    update(timeElapsed) 
    {
        super.update(timeElapsed);

        /*
            Update animation.
        */
        if (this.mixer) 
        {   
            this.mixer.update(timeElapsed);
        }
    }

    /*
        Set the speed of the object.
        Transition from the current speed to the target speed is made smoohtly
        using linear interpolation.
    */
    setSpeed(targetSpeed, duration = 2)
    {
        let initialSpeed = this.speed;
        let startTime = performance.now();

        let updateSpeed = (currentTime) => {
            let elapsedTime = (currentTime - startTime) / 1000;
            if (elapsedTime < duration) 
            {
                this.speed = THREE.MathUtils.lerp(initialSpeed, targetSpeed, elapsedTime / duration);
                requestAnimationFrame(updateSpeed);
            } 
            else 
            {
                this.speed = targetSpeed;
            }
        };
        
        requestAnimationFrame(updateSpeed);
    }

    setCurrentAnimation(animation, playOnce = false) 
    {
        if (this.currentAnimation !== animation) 
        {       
            const previousAnimation = this.currentAnimation;
            
            /*
                Operate a smooth transition between 2 animations.
            */
            if (this.currentAnimation) {
                this.actions[this.currentAnimation].crossFadeTo(this.actions[animation], 0.5, false);
                this.actions[this.currentAnimation].stop();
            }
            
            if (playOnce) 
            {
                /*
                    Set up one-time animation that returns to previous.
                */
                this.actions[animation].reset();
                this.actions[animation].setLoop(THREE.LoopOnce);
                this.actions[animation].clampWhenFinished = false;
                
                const onLoopFinished = () => {
                    this.mixer.removeEventListener('finished', onLoopFinished);
                    this.setCurrentAnimation(previousAnimation);
                };
                
                this.mixer.addEventListener('finished', onLoopFinished);
                this.actions[animation].play();
            } 
            else 
            {
                /*
                    Normal animation transition.
                */
                this.actions[animation].reset();
                this.actions[animation].setLoop(THREE.LoopRepeat);
                this.actions[animation].play();
            }
                       
            this.currentAnimation = animation;
        }
    }

    /*
        Set the rotation of the object.
        
    */
    setRotation(targetRotation, duration = 1)
    {
        let initialRotation = this.mesh.rotation.y;
        let startTime = performance.now();

        let updateRotation = (currentTime) => {
            let elapsedTime = (currentTime - startTime) / 1000;
            if (elapsedTime < duration) 
            {
                this.mesh.rotation.y = THREE.MathUtils.lerp(initialRotation, targetRotation, elapsedTime / duration);
                requestAnimationFrame(updateRotation);
            } 
            else 
            {
                this.mesh.rotation.y = targetRotation;
            }
        };
        
        requestAnimationFrame(updateRotation);
    }
}

export { AnimatedWorldObject };