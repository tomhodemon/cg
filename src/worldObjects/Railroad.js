import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { WorldObject } from './WorldObject';

class Railroad extends WorldObject 
{
    constructor(scene, idx, speed) 
    {
        super(scene, new THREE.Vector3(0, 0, 0), speed);

        this.idx = idx;
        this.scale = 0.22;
    }

    /*
        Initialize the railroad by creating the geometry manually.
        Procedure: 
            - Create each tie.
            - Create each rail.
            - Merge all ties into a single geometry.
            - Merge all rails into a single geometry.
            - Add ties and rails to mesh group.
            - Add mesh group to scene.
            - Compute bounding radius of mesh group.
    */
    initialize() 
    {
        /*
            Final mesh group that will be added to the scene.
        */
        this.mesh = new THREE.Group();

        const gap = 10;
        const nTies = 10;

        /*
            Tie dimensions.
        */
        const tieWidth = 3;
        const tieHeight = 1;
        const tieDepth = 22;

        /*
            Rail dimensions.
        */
        const railWidth = nTies * (tieWidth + gap - tieWidth);
        const railHeight = 1;
        const railDepth = 1;
        
        const globalOffset = this.idx * railWidth;
        /*
            Create nTies ties.
        */
        let tieGeometries = [];

        const textureLoader = new THREE.TextureLoader();
        const woodTexture = textureLoader.load('../assets/worldObjects/Textures/Wooden.jpeg');
        woodTexture.wrapS = THREE.RepeatWrapping;
        woodTexture.wrapT = THREE.RepeatWrapping;
        woodTexture.repeat.set(1, 1);

        const metalTexture = textureLoader.load('../assets/worldObjects/Textures/Metal.jpg');
        metalTexture.wrapS = THREE.RepeatWrapping;
        metalTexture.wrapT = THREE.RepeatWrapping;
        metalTexture.repeat.set(1, 1);

        let tieMat = new THREE.MeshPhongMaterial({ 
            map: woodTexture,
            color: 0x873e23 
        });
        let tieGeo = new THREE.BoxGeometry(tieWidth, tieHeight, tieDepth);
        const xOffsetTie = tieWidth / 2;
        const yOffsetTie = tieHeight / 2;

        for (let idx = 0; idx < nTies; idx++) {
            let tieMeshGeo = tieGeo.clone();
            tieMeshGeo.applyMatrix4(new THREE.Matrix4().makeTranslation(
                xOffsetTie + (gap * idx),
                yOffsetTie,
                0
            ));
            tieGeometries.push(tieMeshGeo);
        }

        /*
            Create 2 rails, one on each side of the ties.
        */
        let railGeometries = [];

        let railGeo = new THREE.BoxGeometry(railWidth, railHeight, railDepth);
        let railMat = new THREE.MeshPhongMaterial({ 
            map: metalTexture,
            color: 0x777777 
        });
        const yOffsetRail = tieHeight / 2;

        for (let idx = 0; idx < 2; idx++) {
            let railMeshGeo = railGeo.clone();
            railMeshGeo.applyMatrix4(new THREE.Matrix4().makeTranslation(
                (railWidth / 2),
                yOffsetRail + tieHeight,
                ((-1) ** idx) * (tieDepth / 2 - 3)
            ));
            railGeometries.push(railMeshGeo);
        }

        /*
            Combine all tie geometries into a single geometry.
        */
        let combinedTieGeometry = BufferGeometryUtils.mergeGeometries(tieGeometries);
        let tiesMesh = new THREE.Mesh(combinedTieGeometry, tieMat);
        tiesMesh.castShadow = false;
        tiesMesh.receiveShadow = false;

        /*
            Combine all rail geometries into a single geometry.
        */
        let combinedRailGeometry = BufferGeometryUtils.mergeGeometries(railGeometries);
        let railsMesh = new THREE.Mesh(combinedRailGeometry, railMat);
        railsMesh.castShadow = false;
        railsMesh.receiveShadow = false;

        /*
            Finally, we obtain a group of 2 meshes: ties and rails.
        */
        this.mesh.add(tiesMesh);
        this.mesh.add(railsMesh);

        /*
            Position the railroad.
        */
        this.position = new THREE.Vector3(globalOffset * this.scale, 0, 0); 
        this.mesh.position.copy(this.position);

        /*
            Scale the railroad and add to scene.
        */
        this.mesh.scale.setScalar(this.scale);
        this.scene.add(this.mesh);

        /*
            Compute bounding radius after creation (collision detection).
        */
        this.computeBoundingRadius();
        this.loaded = true;
    }

    /*
        Override loadModel since we are creating geometry directly.
    */
    async loadModel() 
    {
        return Promise.resolve(this);
    }
}

export default Railroad;