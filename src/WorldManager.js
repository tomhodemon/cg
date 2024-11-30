import * as THREE from 'three';

import Cactus from './worldObjects/Cactus';
import Train from './worldObjects/Train';
import Tunnel from './worldObjects/Tunnel';
import Rock from './worldObjects/Rock';
import Railroad from './worldObjects/railroad';
import Horse from './worldObjects/Horse';
import Adventurer from './worldObjects/Adventurer';
import Campfire from './worldObjects/Campfire';
import Woodlog from './worldObjects/Woodlog';
import Tent from './worldObjects/Tent';
import Ground from './worldObjects/Ground';
import Sky from './worldObjects/Sky';
import { rand_range } from './utils';
import { 
    TRAIN_POSITION_X, 
    TRAIN_SPEED, 
    ADVENTURER_INITIAL_SPEED, 
    HORSE_INITIAL_SPEED, 
    campOffsetX, 
    TUNNEL_POSITION_X
} from './global';


class WorldManager 
{
    constructor(scene, speed) 
	{
        this.scene = scene;
        this.speed = speed;
        this.worldObjects = {};
    }

    async initialize()
	{
		/*
			Spawn ground.
		*/
		let ground = new Ground(this.scene, new THREE.Vector3(0, 0, 0), 0);
		await ground.initialize();
		this.#addWorldObject('ground', ground);

		/*
			Spawn sky.
		*/
		let sky = new Sky(this.scene, new THREE.Vector3(0, 0, 0), 0);
		await sky.initialize();
		this.#addWorldObject('sky', sky);

		/*
			Spawn train.
		*/
		let train = new Train(this.scene, new THREE.Vector3(TRAIN_POSITION_X, 0.5, -0.9), TRAIN_SPEED);
		await train.initialize();
		this.#addWorldObject('train', train);
        

		/*
			Spawn horse.
		*/
		let horse = new Horse(
			this.scene, 
			new THREE.Vector3(campOffsetX + 2, 0, 6),
			HORSE_INITIAL_SPEED,
			'Idle_2');
		await horse.initialize();
		this.#addWorldObject('horse', horse);
		

		/*
			Spawn adventurer.
		*/
		let adventurer = new Adventurer(
			this.scene, 
			new THREE.Vector3(campOffsetX, 0, 11),
			ADVENTURER_INITIAL_SPEED,
			'CharacterArmature|Idle_Neutral');
		await adventurer.initialize();
		this.#addWorldObject('adventurer', adventurer);
		

		/*
			Setup a camp.
		*/
		/*
			Spawn campfire.
		*/
		let campfire = new Campfire(this.scene, this.speed);
		await campfire.initialize();
		this.#addWorldObject('campfire', campfire);	

		/*
			Spawn woodlogs.
		*/
		let woodlog1 = new Woodlog(this.scene, new THREE.Vector3(0, 0, 25), this.speed, Math.PI / .11);
		await woodlog1.initialize();
		this.#addWorldObject('woodlog', woodlog1);	

		let woodlog2 = new Woodlog(this.scene, new THREE.Vector3(-5, 0, 20), this.speed, Math.PI / 1.9);
		await woodlog2.initialize();
		this.#addWorldObject('woodlog', woodlog2);	

		/*
			Spawn a tent.
		*/
		let tent = new Tent(this.scene, this.speed);
		await tent.initialize();
		this.#addWorldObject('tent', tent);	


		/*
			Spawn railroads.
		*/
		this.worldObjects['railroad'] = [];
        let nRailroad = 60;
		for (let idx = -20; idx < nRailroad; idx++) 
		{
			let railroad = new Railroad(this.scene, idx, this.speed);
			railroad.initialize();
			this.#addWorldObject('railroad', railroad);
		}

		/*
			Spawn woodlogs along the railroad.
		*/

        let nWoodlog = 4;
		let positions = [
			new THREE.Vector3(77, 0, 6),
			new THREE.Vector3(105, 0, 6),
			new THREE.Vector3(135, 0, 6),
			new THREE.Vector3(175, 0, 6),
		];
		for (let idx = 0; idx < nWoodlog; idx++) 
		{
			let position = positions[idx];
			let woodlog = new Woodlog(
				this.scene,
				position, 
				this.speed, 
				Math.PI / 2, 
				rand_range(1.0, 1.2)
			);
			await woodlog.initialize();
			this.#addWorldObject('woodlog', woodlog);
		}

		/*
			Spawn tunnel.
		*/
        let tunnel = new Tunnel(this.scene, new THREE.Vector3(TUNNEL_POSITION_X, -2, 0), this.speed);
		await tunnel.initialize();
        this.#addWorldObject('tunnel', tunnel);

		/*
			Spawn cacti.
		*/
        let nCacti = 300;
        for (let idx = 0; idx < nCacti; idx++) 
		{
            const position = Cactus.getValidSpawnPosition(this.#getWorldObjects());

            if (position) 
			{
                let cactus = new Cactus(this.scene, position, this.speed);
                await cactus.initialize();
                this.#addWorldObject('cactus', cactus);
            }
        }


		/*
			Spawn rocks.
		*/
		this.worldObjects['rock'] = [];
		let nRocks = 50;
		for (let idx = 0; idx < nRocks; idx++) 
		{
			const position = Rock.getValidSpawnPosition(this.#getWorldObjects());
			
			if (position) 
			{
				let rock = new Rock(this.scene, position, this.speed);
				await rock.initialize();
				this.#addWorldObject('rock', rock);
			}
		}
    }

	#addWorldObject(key, object)
	{
		if (!this.worldObjects[key])
		{
			this.worldObjects[key] = [];
		}
		this.worldObjects[key].push(object);
	}

	getWorldObject(key)
	{
		return this.worldObjects[key];
	}

	#getWorldObjects()
	{
		let worldObjects = [];
		Object.keys(this.worldObjects).forEach(key => {
			worldObjects = worldObjects.concat(this.worldObjects[key]);
		});
		return worldObjects;
	}


	triggerEvent(...event)
	{	
		const [obj, action, ...args] = event;
		this.worldObjects[obj][0][action](...args);
	}

    update(timeElapsed) 
	{	

		this.#getWorldObjects().forEach(obj => obj.update(timeElapsed));
    }
}

export default WorldManager;