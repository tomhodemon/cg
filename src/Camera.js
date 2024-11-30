import * as THREE from 'three';


class Camera
{   
    constructor(name, fov, near, far) 
    {       
        this.name = name;
        this.aspect = window.innerWidth / window.innerHeight;

        this._camera = new THREE.PerspectiveCamera(fov, this.aspect, near, far);
    }
    getName()
    {
        return this.name;
    }
    
    setPosition(pos)
    {
        this._camera.position.copy(pos);
    }

    setLookAt(pos)
    {
        this._camera.lookAt(pos);
    }

    getCamera()
    {
        return this._camera;
    }

    update()
    {
        this._camera.aspect = window.innerWidth / window.innerHeight;
        this._camera.updateProjectionMatrix();
    }

}


class StaticCamera extends Camera 
{
    constructor(fov, near, far) 
    {
        super(fov, near, far);
    }
}


class FollowCamera extends Camera 
{
    constructor(fov, near, far) 
    {
        super(fov, near, far);
    }

    setUpdateFunction(updateFunction)
    {
        this.update = updateFunction;
    }
}


export { StaticCamera, FollowCamera };