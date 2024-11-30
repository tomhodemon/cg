import * as THREE from 'three';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'dat.gui';

import WorldManager from './WorldManager.js';
import CinematicManager from './Cinematic.js';
import { StaticCamera, FollowCamera } from './Camera.js';
import { ADVENTURER_SPEED, HORSE_SPEED, DEBUG } from './global.js';


class APP 
{
	constructor() 
	{
		this.cinematic = true;

		this.previousTimestep = -1;
		this.previousRAF = null;

		this.speed = 8;
		
		this.initialized = false;

		setTimeout(() => {
			this.initialized = true;
		}, 1000);

		this.initialize();
	}

	initialize() 
	{
		this.renderer = new THREE.WebGLRenderer({antialias: true});
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);

		document.body.appendChild(this.renderer.domElement);
		
		window.addEventListener('resize', () => {
			this.onWindowResize();
		}, false);

		this.scene = new THREE.Scene();
		
		/*
			Lighting.
		*/
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
		this.scene.add(ambientLight);

		const dirLight = new THREE.DirectionalLight( 0xffffff, 0.2 );
		dirLight.position.set( 20, 60, 100 );
		dirLight.target.position.set( 4, 0, 0) ;
		dirLight.castShadow = true;
		dirLight.shadow.bias = -0.001;
		dirLight.shadow.mapSize.width = 4096;
		dirLight.shadow.mapSize.height = 4096;

		dirLight.shadow.camera.left = 400;
		dirLight.shadow.camera.right = -400;
		dirLight.shadow.camera.top = 100;
		dirLight.shadow.camera.bottom = -40;

		dirLight.shadow.camera.far = 400;
		dirLight.shadow.camera.near = 1.0;
		this.scene.add(dirLight);
	
		/*
			WorldManager is a class that manages all the objects in the scene.
		*/
		this.world = new WorldManager(this.scene, this.speed);
		this.world.initialize();


		/*
			Debugging tools.
		*/
		// const axesHelper = new THREE.AxesHelper( 100 );
		// this.scene.add( axesHelper );

		// const dirLightHelper = new THREE.DirectionalLightHelper( dirLight, 20, 0x000000 );
		// this.scene.add( dirLightHelper );

		// const trainSpotLightHelper = new THREE.SpotLightHelper( trainSpotLight );
		// this.scene.add( trainSpotLightHelper );
		if (DEBUG)
		{
			this.currentTimeStep = 0;

			this.gui = new GUI();
			this.gui.add(this, 'currentTimeStep', 0, 70).name('Time Step').listen();
			this.gui.add(this, 'cinematic').name('Cinematic');
			
			const worldObjectsFolder = this.gui.addFolder('worldObjects');
			worldObjectsFolder.add(this, 'speed', -10, 10).name('Adventurer Speed').onChange((value) => {
				this.world.getWorldObject('adventurer')[0].setSpeed(value);
			});
			worldObjectsFolder.open();
		}

		/*
			Initialize the cinematic.
		*/
		this.initCinematic();

		this.RAF();
		this.onWindowResize();	
	}

	/*
		Initializes the cinematic manager. 

		CinematicManager is a class that manages the camera and scene.

		We can register actions at specific time steps:
			ts = time step
			action = action to be performed
			args = arguments for the action
			
			registerActionAtTimeStep(ts, action, ...args)

		Every step, the CinematicManager will check if there are 
		any actions to be performed at the current time step. 
		If there are, it will perform the actions.
	*/
	initCinematic()
	{	 
		this.cinematicManager = new CinematicManager(this);
		
		/*
			Define a default camera.
		*/
		let defaultCamera = new StaticCamera('default', 40, 1, 5000);
		defaultCamera.setPosition(new THREE.Vector3(0, 60, 0));
		defaultCamera.setLookAt(new THREE.Vector3(400, 60, 60));

		/*
			Define firecamp camera.
		*/
		let campfireCamera = new FollowCamera('campfire', 30, 1, 2000);
		campfireCamera.setUpdateFunction(() => {
			let campfirePosition = this.world.getWorldObject('campfire')[0].getPosition();
			campfireCamera.setPosition(campfirePosition.clone().add(new THREE.Vector3(-10, 2, 15)));
			campfireCamera.setLookAt(campfirePosition.clone().add(new THREE.Vector3(1, 4, 0)));
		});

	
		let campCamera = new FollowCamera('camp', 30, 1, 5000);
		campCamera.setUpdateFunction(() => {
			let campfirePosition = this.world.getWorldObject('campfire')[0].getPosition();
			let trainPosition = this.world.getWorldObject('train')[0].getPosition();
			campCamera.setPosition(campfirePosition.clone().add(new THREE.Vector3(35, 5, 0)));
			campCamera.setLookAt(trainPosition.clone().add(new THREE.Vector3(0, 0, -10)));
		});

		let povTrainCamera = new FollowCamera('povTrain', 40, 1, 5000);
		povTrainCamera.setUpdateFunction(() => {
			let trainPosition = this.world.getWorldObject('train')[0].getPosition();
			povTrainCamera.setPosition(trainPosition.clone().add(new THREE.Vector3(-10, 10, 1)));
			povTrainCamera.setLookAt(trainPosition.clone().add(new THREE.Vector3(1000, 10, 0)));
		});

		/*
			Define a camera that follows the train.
		*/
		let trainCamera = new FollowCamera('train', 40, 1, 5000);
		trainCamera.setUpdateFunction(() => {
			let trainPosition = this.world.getWorldObject('train')[0].getPosition();
			trainCamera.setPosition(trainPosition.clone().add(new THREE.Vector3(20, 10, 40)));
			trainCamera.setLookAt(trainPosition.clone().add(new THREE.Vector3(0, 5, 0)));
		});

		/*
			Define a camera that follows the adventurer.
		*/
		let adventurerCamera = new FollowCamera('adventurer', 40, 1, 5000);
		adventurerCamera.setUpdateFunction(() => {
			let adventurerPosition = this.world.getWorldObject('adventurer')[0].getPosition();
			adventurerCamera.setPosition(adventurerPosition.clone().add(new THREE.Vector3(5, 5, 18)));
			adventurerCamera.setLookAt(adventurerPosition.clone().add(new THREE.Vector3(0, 5, 0)));
		});

		/*
			Define a camera that follows the horse.
		*/
		let horseCamera = new FollowCamera('horse', 40, 1, 5000);
		horseCamera.setUpdateFunction(() => {
			let horsePosition = this.world.getWorldObject('horse')[0].getPosition();
			horseCamera.setPosition(horsePosition.clone().add(new THREE.Vector3(5, 5, 18)));
			horseCamera.setLookAt(horsePosition.clone().add(new THREE.Vector3(0, 5, 0)));
		});

		
		/*
			Specify to the cinematic manager to trigger the method "setCamera" 
			at time step O using "defaultCamera" parameter.
			
			This will set the camera to the default camera.
			This allows for creating a cinematic through a programmatic process.
		*/
		const timeStepOffset = 10; 
		
		this.cinematicManager.registerActionAtTimeStep(0, "setCamera", [campfireCamera]);
		this.cinematicManager.registerActionAtTimeStep(9 + timeStepOffset, "setCamera", [trainCamera]);
		this.cinematicManager.registerActionAtTimeStep(12 + timeStepOffset, "setCamera", [povTrainCamera]);

		this.cinematicManager.registerActionAtTimeStep(14 + timeStepOffset, "worldEvent", ["horse", "setRotation", -Math.PI / 2]);
		this.cinematicManager.registerActionAtTimeStep(14 + timeStepOffset, "worldEvent", ["adventurer", "setRotation", -Math.PI / 2]);

		this.cinematicManager.registerActionAtTimeStep(15 + timeStepOffset, "setCamera", [campCamera]);

		this.cinematicManager.registerActionAtTimeStep(20 + timeStepOffset, "worldEvent", ["horse", "setRotation", Math.PI / 2]);
		this.cinematicManager.registerActionAtTimeStep(20 + timeStepOffset, "worldEvent", ["adventurer", "setRotation", Math.PI / 2]);
		this.cinematicManager.registerActionAtTimeStep(20 + timeStepOffset, "worldEvent", ["adventurer", "setCurrentAnimation", "CharacterArmature|Run"]);
		this.cinematicManager.registerActionAtTimeStep(20 + timeStepOffset, "worldEvent", ["horse", "setCurrentAnimation", "Gallop"]);
		this.cinematicManager.registerActionAtTimeStep(20 + timeStepOffset, "worldEvent", ["adventurer", "setSpeed", ADVENTURER_SPEED]);
		this.cinematicManager.registerActionAtTimeStep(20 + timeStepOffset, "worldEvent", ["horse", "setSpeed", HORSE_SPEED]);

		this.cinematicManager.registerActionAtTimeStep(25 + timeStepOffset, "setCamera", [povTrainCamera]);

		this.cinematicManager.registerActionAtTimeStep(30 + timeStepOffset, "setCamera", [horseCamera]);
		this.cinematicManager.registerActionAtTimeStep(31 + timeStepOffset, "worldEvent", ["horse", "setCurrentAnimation", "Gallop_Jump", true]);
		this.cinematicManager.registerActionAtTimeStep(35 + timeStepOffset, "worldEvent", ["horse", "setCurrentAnimation", "Gallop_Jump", true]);

		this.cinematicManager.registerActionAtTimeStep(36 + timeStepOffset, "setCamera", [povTrainCamera]);
		this.cinematicManager.registerActionAtTimeStep(39 + timeStepOffset, "worldEvent", ["horse", "setCurrentAnimation", "Gallop_Jump", true]);

		this.cinematicManager.registerActionAtTimeStep(44 + timeStepOffset, "setCamera", [horseCamera]);
		this.cinematicManager.registerActionAtTimeStep(45 + timeStepOffset, "worldEvent", ["horse", "setCurrentAnimation", "Gallop_Jump", true]);

		this.cinematicManager.registerActionAtTimeStep(50 + timeStepOffset, "worldEvent", ["adventurer", "setCurrentAnimation", "CharacterArmature|Walk"]);
		this.cinematicManager.registerActionAtTimeStep(50 + timeStepOffset, "worldEvent", ["horse", "setCurrentAnimation", "Walk"]);
		this.cinematicManager.registerActionAtTimeStep(50 + timeStepOffset, "worldEvent", ["adventurer", "setSpeed", 2]);
		this.cinematicManager.registerActionAtTimeStep(50 + timeStepOffset, "worldEvent", ["horse", "setSpeed", 2]);

		this.cinematicManager.registerActionAtTimeStep(54 + timeStepOffset, "worldEvent", ["adventurer", "setSpeed", 0]);
		this.cinematicManager.registerActionAtTimeStep(54 + timeStepOffset, "worldEvent", ["horse", "setSpeed", 0]);
		this.cinematicManager.registerActionAtTimeStep(55 + timeStepOffset, "worldEvent", ["adventurer", "setCurrentAnimation", "CharacterArmature|Idle_Neutral"]);
		this.cinematicManager.registerActionAtTimeStep(55 + timeStepOffset, "worldEvent", ["horse", "setCurrentAnimation", "Idle_2"]);	

		this.cinematicManager.registerActionAtTimeStep(56 + timeStepOffset, "worldEvent", ["horse", "setRotation", 0]);
		this.cinematicManager.registerActionAtTimeStep(56 + timeStepOffset, "worldEvent", ["adventurer", "setRotation", 0]);

		this.cinematicManager.registerActionAtTimeStep(59 + timeStepOffset, "worldEvent", ["adventurer", "setCurrentAnimation", "CharacterArmature|Death", true]);
		this.cinematicManager.registerActionAtTimeStep(59 + timeStepOffset, "worldEvent", ["horse", "setCurrentAnimation", "Death", true]);
	
		
		if (DEBUG)
		{
			const cameraFolder = this.gui.addFolder('Cameras');
			cameraFolder.add({
				camera: 'default'
			}, 'camera', ['default', 'train', 'adventurer', 'horse', 'campfire', 'camp', 'povTrain']).onChange((value) => {
				switch(value) {
					case 'default':
						this.setCamera(defaultCamera);
						break;
					case 'campfire':
						this.setCamera(campfireCamera);
						break;
					case 'train': 
						this.setCamera(trainCamera);
						break;
					case 'adventurer':
						this.setCamera(adventurerCamera);
						break;
					case 'horse':
						this.setCamera(horseCamera);
						break;
					case 'povTrain':
						this.setCamera(povTrainCamera);
						break;
					case 'camp':
						this.setCamera(campCamera);
						break;
				}
			});
			cameraFolder.open();
		}
		
		if (DEBUG)
		{
			this.setCamera(defaultCamera);
		}
		else
		{
			this.setCamera(campCamera);
		}
		
	}

	worldEvent(...event)
	{
		this.world.triggerEvent(...event);
	}

	setCamera(...camera)
	{		
		this.cameraObject = camera[0];

		/*
			Debug only.
		*/
		this.controls = new OrbitControls(this.cameraObject.getCamera(), this.renderer.domElement);
	}

	onWindowResize() 
	{
		this.cameraObject.getCamera().aspect = window.innerWidth / window.innerHeight;
		this.cameraObject.getCamera().updateProjectionMatrix();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}

	RAF() 
	{
		requestAnimationFrame((t) => {
			if (this.previousRAF === null) 
			{
				this.previousRAF = t;
			}

			t = t / 1000;

			if (this.cinematic)
			{
				this.cinematicManager.update(t);
			}
			
			/*
				Debug only.
			*/			
			this.currentTimeStep = t;

			if (this.initialized)
			{
				this.step(t - this.previousRAF);
				this.renderer.render(this.scene, this.cameraObject.getCamera());	
			}

			this.previousRAF = t;
			this.RAF();
		});
	}

  	step(timeElapsed) 
	{	
		this.world.update(timeElapsed);
		this.cameraObject.update();
	}
}

let app = null;

window.addEventListener('DOMContentLoaded', () => {
	app = new APP();
});