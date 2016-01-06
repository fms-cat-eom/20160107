precision highp float;

#define PI 3.14159265

uniform float time;
uniform float blurStep;
uniform bool init;
uniform float cubeCountSqrt;

uniform sampler2D particleTexture;
uniform sampler2D randomTexture;

mat2 rotate( float _theta ) {
  return mat2( cos( _theta ), sin( _theta ), -sin( _theta ), cos( _theta ) );
}

void main() {
  vec2 reso = vec2( 2.0, 1.0 ) * cubeCountSqrt;

  float type = mod( floor( gl_FragCoord.x ), 2.0 );

  vec3 pos = texture2D( particleTexture, ( gl_FragCoord.xy + vec2( 0.0 - type, 0.0 ) ) / reso ).xyz;
  vec3 size = texture2D( particleTexture, ( gl_FragCoord.xy + vec2( 1.0 - type, 0.0 ) ) / reso ).xyz;

  vec2 initReso = vec2( 2.0, 4.0 ) * cubeCountSqrt;
  float phase = mod( floor( time * 4.0 ) / 4.0, 1.0 );
  if ( init ) { phase = 0.75; }
  vec2 inituv = vec2( mod( gl_FragCoord.x, initReso.x / pow( 4.0, 3.0 - phase * 4.0 ) ), gl_FragCoord.y );
  vec2 initOffset = vec2( 0.0, 1.0 ) * phase;

  vec3 posI = texture2D( randomTexture, ( inituv + vec2( 0.0 - type, 0.0 ) ) / initReso + initOffset ).xyz;
  posI -= 0.5;
  posI *= 0.6 / pow( 1.1, 3.0 - phase * 4.0 );
  vec3 sizeI = texture2D( randomTexture, ( inituv + vec2( 1.0 - type, 0.0 ) ) / initReso + initOffset ).xyz;
  sizeI.x = ( pow( sizeI.x, 20.0 ) + sizeI.x ) * 0.4 * pow( 1.9, 3.0 - phase * 4.0 ) * 0.7;

  vec3 ret = vec3( 0.0 );

  if ( init ) {
    pos = posI;
    pos.zx = rotate( -PI / 2.0 ) * pos.zx;

    size = sizeI;
  }

  if ( type == 0.0 ) {
    pos += ( posI - pos ) * 0.2 / blurStep;
    ret = pos;
  } else if ( type == 1.0 ) {
    if ( gl_FragCoord.x < initReso.x / pow( 4.0, 3.0 - phase * 4.0 ) ) {
    } else {
      sizeI.x *= 0.2;
    }
    size.x += ( sizeI.x - size.x ) * 0.1 / blurStep;
    ret = size;
  }

  gl_FragColor = vec4( ret, 1.0 );
}
