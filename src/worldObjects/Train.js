import * as THREE from 'three';
import { WorldObject } from './WorldObject';
import ParticleSystem from '../effects/ParticleSystem';


class Train extends WorldObject 
{   
    modelPath = 'Train.glb';

    constructor(scene, position, speed) 
	{   
        super(scene, position, speed);
        this.scale = 0.2;

        /*
            Spot light.
        */
        this.trainSpotLight = new THREE.SpotLight(0xffd966, 100);

        /*
            Position relative to train's position.
        */
        this.trainSpotLight.position.copy(new THREE.Vector3(-5, 20, 40));
        
        /*
            Target position relative to train's position.
        */
        this.trainSpotLight.target.position.copy(new THREE.Vector3(0, 0, 2000)); 
        
        this.trainSpotLight.angle = 0.3;
        this.trainSpotLight.penumbra = 0.05;
        this.trainSpotLight.decay = 0;
        this.trainSpotLight.distance = 100
        this.trainSpotLight.castShadow = true;
        this.trainSpotLight.shadow.mapSize.width = 512;
        this.trainSpotLight.shadow.mapSize.height = 512;
        this.trainSpotLight.shadow.camera.near = 1;
        this.trainSpotLight.shadow.camera.far = 100;
        this.trainSpotLight.shadow.camera.fov = 30;
        this.trainSpotLight.shadow.bias = -0.001;
        this.trainSpotLight.shadow.camera.left = -100;
        this.trainSpotLight.shadow.camera.right = 100;
        this.trainSpotLight.shadow.camera.top = 100;
        this.trainSpotLight.shadow.camera.bottom = -100;
        this.trainSpotLight.shadow.camera.updateProjectionMatrix();

        /*
            Smoke particles.
        */
        this.smokePositionDelta = new THREE.Vector3(7, 8, 1);
        this.smokeParticles = new ParticleSystem(scene, {
            position: this.position.clone().add(this.smokePositionDelta),
            particleCount: 1000,
            particleSize: 0.5,
            startColor: new THREE.Color(0.7, 0.7, 0.7),
            endColor: new THREE.Color(0.2, 0.2, 0.2),
            lifetime: 30,
            speed: 1,
            spread: 0.4,
            spawnRadius: 1,
            opacity: 0.6,
            blending: THREE.NormalBlending,
            direction: new THREE.Vector3(-1, 1, 0)
        });
    }

    async initialize() {
        try 
		{
            await this.loadModel(this.modelPath);
            this.mesh.rotation.y = Math.PI / 2;

            this.mesh.add(this.trainSpotLight);
            this.mesh.add(this.trainSpotLight.target);
        } 
		catch (error) 
		{
            console.error(`Failed to load ${this.modelPath}:`, error);
        }
    }

    update(timeElapsed) 
    {
        super.update(timeElapsed);

        /*
            Update position.
        */
        this.position.x += this.speed * timeElapsed;
        this.mesh.position.x = this.position.x;

        /*
            Update smoke particles.
        */
        this.smokeParticles.update(timeElapsed);
        this.smokeParticles.setPosition(this.position.clone().add(this.smokePositionDelta));
    }

    dispose() 
    {

        this.smokeParticles.dispose();
    }
}

export default Train;