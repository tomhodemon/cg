import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

class WorldObject 
{
    constructor(scene, position, speed) 
    {
        this.scene = scene;
        this.position = position;
        this.speed = speed;

        this.mesh = null;
        this.loaded = false;
        
        /*
            Bounding radius for 2D collision detection.
        */
        this.boundingRadius = 0;
    }

    /*
        Compute the bounding radius of the object.
    */
    computeBoundingRadius() 
    {
        if (!this.mesh) 
        {
            return;
        }

        const bbox = new THREE.Box3().setFromObject(this.mesh);        
        
        const width = (bbox.max.x - bbox.min.x) / 2;
        const depth = (bbox.max.z - bbox.min.z) / 2;
        
        this.boundingRadius = Math.max(width, depth);
    }

    /*
        Check if this object overlaps with another object (other).
    */
    overlaps(other) 
    {
        if (!other || !this.position || !other.position) 
        {
            return false;
        }

        const dx = this.position.x - other.position.x;
        const dz = this.position.z - other.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        return distance < (this.boundingRadius + other.boundingRadius);
    }

    static getValidSpawnPosition(existingObjects, spawnArea = {
        minX: -300, maxX: 700*4,
        minZ: -700, maxZ: 700 
    }) 
    {
        let attempts = 0;
        const maxAttempts = 50;

        while (attempts < maxAttempts) {
            const x = THREE.MathUtils.randFloat(spawnArea.minX, spawnArea.maxX);
            const z = THREE.MathUtils.randFloat(spawnArea.minZ, spawnArea.maxZ);
            const testedPos = new THREE.Vector3(x, 0, z);

            let isValidPosition = true;
            for (const obj of existingObjects) 
            {
                const dx = testedPos.x - obj.position.x;
                const dz = testedPos.z - obj.position.z;
                const distance = Math.sqrt(dx * dx + dz * dz);
                
                if (distance < (obj.boundingRadius * 1)) 
                {
                    isValidPosition = false;
                    break;
                }
            }

            if (isValidPosition) 
            {
                return testedPos;
            }

            attempts++;
        }

        console.warn('Could not find valid spawn position after', maxAttempts, 'attempts');
        return null;
    }

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
                        Compute the bounding radius and mark as loaded.
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

    setupShadows()
    {
        this.mesh.traverse(child => {
            if (child.isMesh) 
            {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }

    update(timeElapsed) 
    {
        if (!this.mesh) 
        {
            return;
        }
    }

    getPosition()
    {
        return this.mesh.position;
    }
}

export { WorldObject };