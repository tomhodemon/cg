import { WorldObject } from './WorldObject';
import { campOffsetX } from '../global';


class Woodlog extends WorldObject 
{
    modelPath = 'Woodlog.glb';
    
    constructor(scene, position, speed, rotation = 0, scale = 1.40) 
	{   
        position.x += campOffsetX;
        super(scene, position, speed);
        this.rotation = rotation;
        this.scale = scale;     
    }

    async initialize() {
        try 
		{
            await this.loadModel(this.modelPath)
            this.mesh.rotation.y = this.rotation;
        } 
		catch (error) 
		{
            console.error(`Failed to load ${this.modelPath}:`, error);
        }
    }
}

export default Woodlog;