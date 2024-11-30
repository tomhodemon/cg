import * as THREE from 'three';
import { AnimatedWorldObject } from './AnimatedWorldObject';
import { campOffsetX } from '../global';
import ParticleSystem from '../effects/ParticleSystem';

class Campfire extends AnimatedWorldObject 
{
    modelPath = 'Campfire.glb';
    
    constructor(scene, speed) 
	{   
        super(scene, new THREE.Vector3(campOffsetX, 0.8, 20), speed, 'flicker');
        this.scale = 2;
        this.baseIntensity = 100;
        
        this.fireLight = new THREE.PointLight(0xff6600, this.baseIntensity, 100);
        this.fireLight.position.set(0, 2, 0);
        this.fireLight.castShadow = true;
        this.scene.add(this.fireLight);

        /*
            Fire particles.
        */
        this.fireParticles = new ParticleSystem(scene, {
            position: new THREE.Vector3(
                this.position.x,
                this.position.y + 2,
                this.position.z
            ),
            particleCount: 80,
            particleSize: 0.18,
            startColor: new THREE.Color(1, 0.5, 0),
            endColor: new THREE.Color(1, 0.1, 0),
            lifetime: 3,
            speed: 1,
            spread: 0.2,
            spawnRadius: 0.3,
            opacity: 0.9,
            blending: THREE.AdditiveBlending
        });

        /*
            Smoke particles.
        */
        this.smokeParticles = new ParticleSystem(scene, {
            position: new THREE.Vector3(
                this.position.x,
                this.position.y + 2,
                this.position.z
            ),
            particleCount: 500,
            particleSize: 0.2,
            startColor: new THREE.Color(0.7, 0.7, 0.7),
            endColor: new THREE.Color(0.2, 0.2, 0.2),
            lifetime: 10,
            speed: 1,
            spread: 0.3,
            spawnRadius: 0.5,
            opacity: 0.5,
            blending: THREE.NormalBlending
        });
    }

    async initialize() 
    {
        try 
        {
            await this.loadModel(this.modelPath);
            this.mesh.add(this.fireLight);
        } 
		catch (error) 
		{
            console.error(`Failed to load ${this.modelPath}:`, error);
        }
    }

    /*
        Setup animations.

        animations is not used here, but it is required by the AnimatedWorldObject class.
        It is not used because we are not loading animations from a file.
    */
    setupAnimations(animations)
    {
        this.mixer = new THREE.AnimationMixer(this.fireLight);

        const flickerTimes = [0, 1.0, 2.0, 3.0, 4.0];
        const flickerIntensities = [
            this.baseIntensity * 0.2,
            this.baseIntensity * 2.3, 
            this.baseIntensity * 0.2,
            this.baseIntensity * 2.3,
            this.baseIntensity * 0.2
        ];

        const intensityTrack = new THREE.NumberKeyframeTrack(
            '.intensity',
            flickerTimes,
            flickerIntensities
        );

        const flickerClip = new THREE.AnimationClip('flicker', 4, [intensityTrack]);
        const flickerAction = this.mixer.clipAction(flickerClip);
        flickerAction.setLoop(THREE.LoopRepeat);
        
        this.actions['flicker'] = flickerAction;   
        this.actions[this.currentAnimation].play();
    }

    update(timeElapsed)
    {
        super.update(timeElapsed);
        
        this.fireParticles.update(timeElapsed);
        this.smokeParticles.update(timeElapsed);
        
        this.fireParticles.setPosition(this.position);
        this.smokeParticles.setPosition(new THREE.Vector3(
            this.position.x,
            this.position.y + 1,
            this.position.z
        ));
    }

    dispose() 
    {
        this.fireParticles.dispose();
        this.smokeParticles.dispose();
    }
}

export default Campfire;