import { WorldObject } from './WorldObject';
import { rand_range } from '../utils';


class Cactus extends WorldObject 
{
    constructor(scene, position, speed) 
	{   
        super(scene, position, speed);
        this.scale = rand_range(3, 6);
    }

    async initialize() {
        try 
		{
            await this.loadModel(
                'Cactus.glb'
            ).then(() => { 
                this.mesh.rotation.y = rand_range(0, Math.PI * 2);
            });
        } 
		catch (error) 
		{
            console.error('Failed to load cactus:', error);
        }
    }
}

export default Cactus;