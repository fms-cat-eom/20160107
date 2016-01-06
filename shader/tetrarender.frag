precision highp float;

varying vec3 vNormal;

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
  gl_FragColor = vec4( vNormal * 0.5 + 0.5, 1.0 );
}
