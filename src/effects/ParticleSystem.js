import * as THREE from 'three';

class ParticleSystem 
{
    constructor(scene, options = {}) 
    {
        this.scene = scene;
        
        /*
            Default options.
        */  
        this.options = {
            position: new THREE.Vector3(0, 0, 0),
            particleCount: 100,
            particleSize: 0.1,
            startColor: new THREE.Color(1, 0.5, 0),
            endColor: new THREE.Color(0.4, 0.4, 0.4),
            lifetime: 2,
            speed: 1,
            spread: 0.5,
            spawnRadius: 0.5,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            direction: new THREE.Vector3(0, 1, 0), // Default direction is upward
            ...options
        };

        // Normalize direction vector
        this.options.direction.normalize();

        this.particles = [];
        this.initializeParticleSystem();
    }

    initializeParticleSystem() 
    {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.options.particleCount * 3);
        const colors = new Float32Array(this.options.particleCount * 3);

        /*
            Initialize particles.
        */  
        for (let i = 0; i < this.options.particleCount; i++) 
        {
            /*
                Calculate velocity based on direction.
            */  
            const randomSpread = new THREE.Vector3(
                (Math.random() - 0.5) * this.options.spread,
                (Math.random() - 0.5) * this.options.spread,
                (Math.random() - 0.5) * this.options.spread
            );
            
            const baseVelocity = this.options.direction.clone().multiplyScalar(this.options.speed);
            const finalVelocity = baseVelocity.add(randomSpread);

            this.particles.push({
                position: new THREE.Vector3(
                    (Math.random() - 0.5) * this.options.spawnRadius,
                    0,
                    (Math.random() - 0.5) * this.options.spawnRadius
                ),
                velocity: finalVelocity,
                age: Math.random() * this.options.lifetime
            });

            const i3 = i * 3;
            positions[i3] = this.particles[i].position.x;
            positions[i3 + 1] = this.particles[i].position.y;
            positions[i3 + 2] = this.particles[i].position.z;

            colors[i3] = this.options.startColor.r;
            colors[i3 + 1] = this.options.startColor.g;
            colors[i3 + 2] = this.options.startColor.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: this.options.particleSize,
            vertexColors: true,
            transparent: true,
            opacity: this.options.opacity,
            blending: this.options.blending,
            depthWrite: false
        });

        this.particleSystem = new THREE.Points(geometry, material);
        this.particleSystem.position.copy(this.options.position);
        this.scene.add(this.particleSystem);
    }

    update(elapsedTime) 
    {
        const positions = this.particleSystem.geometry.attributes.position.array;
        const colors = this.particleSystem.geometry.attributes.color.array;

        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            const i3 = i * 3;

            /*
                Update age.
            */  
            particle.age += elapsedTime;
            if (particle.age > this.options.lifetime) {
                /*
                    Reset particle.
                */  
                particle.age = 0;
                particle.position.set(
                    (Math.random() - 0.5) * this.options.spawnRadius,
                    0,
                    (Math.random() - 0.5) * this.options.spawnRadius
                );
                
                // Reset velocity based on direction
                const randomSpread = new THREE.Vector3(
                    (Math.random() - 0.5) * this.options.spread,
                    (Math.random() - 0.5) * this.options.spread,
                    (Math.random() - 0.5) * this.options.spread
                );
                
                const baseVelocity = this.options.direction.clone().multiplyScalar(this.options.speed);
                particle.velocity = baseVelocity.add(randomSpread);
            }

            /*
                Update position.
            */  
            particle.position.add(particle.velocity.clone().multiplyScalar(elapsedTime));

            /*
                Update position in geometry.
            */  
            positions[i3] = particle.position.x;
            positions[i3 + 1] = particle.position.y;
            positions[i3 + 2] = particle.position.z;

            /*
                Update color based on age.
            */  
            const lifeRatio = particle.age / this.options.lifetime;
            const color = new THREE.Color().lerpColors(
                this.options.startColor,
                this.options.endColor,
                lifeRatio
            );

            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }

        this.particleSystem.geometry.attributes.position.needsUpdate = true;
        this.particleSystem.geometry.attributes.color.needsUpdate = true;
    }

    setPosition(position) 
    {
        this.particleSystem.position.copy(position);
    }

    dispose() 
    {
        this.scene.remove(this.particleSystem);
        this.particleSystem.geometry.dispose();
        this.particleSystem.material.dispose();
    }
}

export default ParticleSystem; 