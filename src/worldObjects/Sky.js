import * as THREE from 'three';
import { WorldObject } from './WorldObject';


/*
    https://github.com/mrdoob/three.js/blob/master/examples/webgl_lights_hemisphere.html
*/
const skydomeVertexShader = `
varying vec3 vWorldPosition;

void main() 
{
  vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;

/*
    https://www.shadertoy.com/view/NtsBzB
    https://github.com/mrdoob/three.js/blob/master/examples/webgl_lights_hemisphere.html
*/
const skydomeFragmentShader = `
uniform vec3 topColor;
uniform vec3 bottomColor;
uniform float offset;
uniform float exponent;

varying vec3 vWorldPosition;

/*
    This creates a pseudo-random value based on a 3D vector.
*/
vec3 hash(vec3 p)
{
    p = vec3(dot(p,vec3(127.1,311.7, 74.7)),
             dot(p,vec3(269.5,183.3,246.1)),
             dot(p,vec3(113.5,271.9,124.6)));
    return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}

/*
    This implements gradient noise (smoother than pure random noise).
*/
float noise(in vec3 p)
{
    vec3 i = floor(p);
    vec3 f = fract(p);
    
    vec3 u = f*f*(3.0-2.0*f);
    return mix(mix(mix(dot(hash(i + vec3(0.0,0.0,0.0)), f - vec3(0.0,0.0,0.0)), 
                      dot(hash(i + vec3(1.0,0.0,0.0)), f - vec3(1.0,0.0,0.0)), u.x),
                  mix(dot(hash(i + vec3(0.0,1.0,0.0)), f - vec3(0.0,1.0,0.0)), 
                      dot(hash(i + vec3(1.0,1.0,0.0)), f - vec3(1.0,1.0,0.0)), u.x), u.y),
               mix(mix(dot(hash(i + vec3(0.0,0.0,1.0)), f - vec3(0.0,0.0,1.0)), 
                      dot(hash(i + vec3(1.0,0.0,1.0)), f - vec3(1.0,0.0,1.0)), u.x),
                  mix(dot(hash(i + vec3(0.0,1.0,1.0)), f - vec3(0.0,1.0,1.0)), 
                      dot(hash(i + vec3(1.0,1.0,1.0)), f - vec3(1.0,1.0,1.0)), u.x), u.y), u.z);
}

void main() 
{
    /*
		Compute sky gradient.
	*/
    float h = normalize(vWorldPosition + offset).y;
    vec3 skyColor = mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0));
    
    /*
		Use the normalized world position as the direction for the stars.
	*/
    vec3 stars_direction = normalize(vWorldPosition);
    
    /*
		Stars layer 1. 
		stars_threshold1 parameter controls the sharpness and size of the stars.
		stars_exposure1 parameter controls the brightness of the stars.
		density1 parameter controls the density of the stars.

		Use noise to generate a star field and apply parameters.
	*/
    float stars_threshold1 = 10.0;
    float stars_exposure1 = 120.0;
	float density1 = 300.0;
    float stars1 = pow(clamp(noise(stars_direction * density1), 0.0, 1.0), stars_threshold1) * stars_exposure1;
    
    /*
		Stars layer 2. Works the same way as stars layer 1.

		Combine the two layers to create a depth effect.
	*/
    float stars_threshold2 = 12.0;
    float stars_exposure2 = 100.0;
	float density2 = 400.0;
    float stars2 = pow(clamp(noise(stars_direction * density2 + 1234.5), 0.0, 1.0), stars_threshold2) * stars_exposure2;
    
    float stars = stars1 + stars2 * 0.6;
    
	/*
		Apply a fade effect to the stars near the horizon.
	*/
    float horizon_fade = smoothstep(-0.1, 0.3, stars_direction.y);
    stars *= horizon_fade;
    
    /*
		Add background glow.
	*/	
    float background = pow(clamp(noise(stars_direction * 50.0), 0.0, 1.0), 2.0) * 0.03;
    
    /*
		Combine sky gradient with stars and background.
	*/
    vec3 finalColor = skyColor + vec3(stars + background);
    
    gl_FragColor = vec4(finalColor, 1.0);
}
`;

class Sky extends WorldObject 
{
    constructor(scene, position, speed) 
    {
        super(scene, position, speed);
        this.scale = 1;
    }

    async initialize() 
    {
        try 
        {
            await this.loadModel();
        }
        catch (error) 
        {
            console.error('Failed to load sky:', error);
        }
    }

    /*
        Override loadModel method.
    */
    async loadModel() 
    { 
        let skyGeo = new THREE.SphereGeometry(700, 32, 15);
        let skyMat = new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: new THREE.Color(0xf6d7b0) },
                bottomColor: { value: new THREE.Color(0x0077ff) },
                offset: { value: 33 },
                exponent: { value: 0.4 }
            },
            vertexShader: skydomeVertexShader,
            fragmentShader: skydomeFragmentShader,
            side: THREE.BackSide
        });
        
        let sky = new THREE.Mesh(skyGeo, skyMat);
        this.scene.add(sky);
        this.loaded = true;
    }
}   

export default Sky;