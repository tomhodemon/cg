import { WorldObject } from './WorldObject';
import { rand_range } from '../utils';


class Rock extends WorldObject 
{   
    modelPath = 'Rock.glb';
    
    constructor(scene, position, speed) 
	{   
        super(scene, position, speed);
        this.scale = rand_range(1, 3);        
    }

    async initialize() {
        try 
		{
            await this.loadModel(this.modelPath);
            this.mesh.rotation.y = rand_range(0, Math.PI * 2);
        } 
		catch (error) 
		{
            console.error(`Failed to load ${this.modelPath}:`, error);
        }
    }
}

export default Rock;