#define PI 3.14159265

attribute vec3 uv;

varying vec3 vNormal;

uniform float time;
uniform vec2 resolution;
uniform vec3 offset;
uniform float tetraCountSqrt;
uniform sampler2D particleTexture;
uniform sampler2D tetraTexture;

mat4 lookAt( vec3 _pos, vec3 _tar, vec3 _air ) {
  vec3 dir = normalize( _tar - _pos );
  vec3 sid = normalize( cross( dir, _air ) );
  vec3 top = normalize( cross( sid, dir ) );
  return mat4(
    sid.x, top.x, dir.x, 0.0,
    sid.y, top.y, dir.y, 0.0,
    sid.z, top.z, dir.z, 0.0,
    - sid.x * _pos.x - sid.y * _pos.y - sid.z * _pos.z,
    - top.x * _pos.x - top.y * _pos.y - top.z * _pos.z,
    - dir.x * _pos.x - dir.y * _pos.y - dir.z * _pos.z,
    1.0
  );
}

mat4 perspective( float _fov, float _aspect, float _near, float _far ) {
  float p = 1.0 / tan( _fov * PI / 180.0 / 2.0 );
  float d = _far / ( _far - _near );
  return mat4(
    p / _aspect, 0.0, 0.0, 0.0,
    0.0, p, 0.0, 0.0,
    0.0, 0.0, d, 1.0,
    0.0, 0.0, -_near * d, 0.0
  );
}

mat2 rotate( float _theta ) {
  return mat2( cos( _theta ), sin( _theta ), -sin( _theta ), cos( _theta ) );
}

void main() {
  vec3 pos = texture2D( particleTexture, ( uv.xy * vec2( 4.0, 1.0 ) + vec2( 0.5, 0.5 ) ) / vec2( 4.0, 1.0 ) / tetraCountSqrt ).xyz;
  vec3 vel = texture2D( particleTexture, ( uv.xy * vec2( 4.0, 1.0 ) + vec2( 1.5, 0.5 ) ) / vec2( 4.0, 1.0 ) / tetraCountSqrt ).xyz;
  vec3 rot = texture2D( particleTexture, ( uv.xy * vec2( 4.0, 1.0 ) + vec2( 2.5, 0.5 ) ) / vec2( 4.0, 1.0 ) / tetraCountSqrt ).xyz;
  vec3 vrot = texture2D( particleTexture, ( uv.xy * vec2( 4.0, 1.0 ) + vec2( 3.5, 0.5 ) ) / vec2( 4.0, 1.0 ) / tetraCountSqrt ).xyz;

  vec3 tetraVert = texture2D( tetraTexture, vec2( 0.5 / 2.0, uv.z / 12.0 ) ).xyz;
  tetraVert.yz = rotate( rot.x ) * tetraVert.yz;
  tetraVert.zx = rotate( rot.y ) * tetraVert.zx;
  if ( 0.99 < rot.z ) {
    tetraVert *= 0.0;
  } else {
    tetraVert *= 0.01 * sin( rot.z / 0.99 * PI );
  }
  pos += tetraVert;

  mat4 matP = perspective( 60.0, resolution.x / resolution.y, 0.01, 100.0 );
  mat4 matV = lookAt( vec3( 0.0, 0.0, 1.0 ) + offset, vec3( 0.0, 0.0, 0.0 ), vec3( 0.0, 1.0, 0.0 ) );
  gl_Position = matP * matV * vec4( pos, 1.0 );

  vNormal = texture2D( tetraTexture, vec2( 1.5 / 2.0, uv.z / 12.0 ) ).xyz;
  vNormal = ( matV * vec4( vNormal, 0.0 ) ).xyz;
}
