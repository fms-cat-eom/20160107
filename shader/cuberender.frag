precision highp float;

varying vec3 vPos;
varying vec3 vNormal;
varying vec3 vCube;
varying vec2 vColor;

uniform sampler2D particleTexture;

#define PI 3.14159265
#define saturate(i) clamp(i,0.,1.)

vec3 catColor( float _theta ){
  return vec3(
    sin( _theta ),
    sin( _theta + 2.0 ),
    sin( _theta + 4.0 )
  ) * 0.5 + 0.5;
}

void main() {
  vec3 ret = vec3( 0.0 );
  float dif = dot( vNormal, normalize( vec3( 3.0, 4.0, -5.0 ) ) ) * 0.4 + 0.6;
  gl_FragColor = vec4( dif * catColor( floor( vColor.y * 6.0 ) ), 1.0 );
}
