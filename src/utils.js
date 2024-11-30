import * as THREE from 'three';

function isPositionValid(position, existingPositions, minDistance) {
    for (let existing of existingPositions) 
    {
        const distance = position.distanceTo(existing);
        if (distance < minDistance) 
        {
            return false;
        }
    }
    return true;
};

export function generateRandomPosition(worldObjects, planeWidth, planeDepth, minDistance) 
{
    const existingPositions = worldObjects.map(obj => obj.position.clone());
    let position;
    const maxAttempts = 100;
    let attempts = 0;

    do 
    {
        const x = Math.random() * planeWidth - planeWidth / 2;
        const z = Math.random() * planeDepth - planeDepth / 2;
        position = new THREE.Vector3(x, 0, z); // position.y is fixed at 0

        attempts++;
    } while (!isPositionValid(position, existingPositions, minDistance) && attempts < maxAttempts);

    if (attempts < maxAttempts) 
    {
        return position;
    } 
    else 
    {
        console.warn(`Could not find a valid position for the new object`);
        return null;
    }
};

export function rand_int(a, b)
{
    return Math.floor(Math.random() * (b - a + 1) + a);
}

export function rand_range(a, b) 
{
	return Math.random() * (b - a) + a;
};