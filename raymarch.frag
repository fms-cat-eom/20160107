precision highp float;

uniform float time;
uniform vec2 resolution;
uniform sampler2D texture2016;
uniform sampler2D textureKinga;
uniform sampler2D noiseTexture;

#define PI 3.14159265

#define saturate(i) clamp(i,0.,1.)

vec3 noise( vec2 _p ) {
  vec3 sum = vec3( 0.0 );
  for ( int iLoop = 0; iLoop < 8; iLoop ++ ) {
    float i = float( iLoop );
    vec2 p = _p * pow( 2.0, i );
    sum += texture2D( noiseTexture, p ).xyz / pow( 2.0, i + 1.0 );
  }
  return sum;
}

float smin( float _a, float _b, float _k, out float h ) {
  h = clamp( 0.5 + 0.5 * ( _b - _a ) / _k, 0.0, 1.0 );
  return mix( _b, _a, h ) - _k * h * ( 1.0 - h );
}

vec3 hash( vec3 _v ) {
  return fract( sin( vec3(
    dot( _v, vec3( 7.544, 6.791, 7.143 ) ) * 179.197,
    dot( _v, vec3( 6.943, 7.868, 7.256 ) ) * 176.465,
    dot( _v, vec3( 7.152, 7.276, 6.876 ) ) * 172.967
  ) ) * 2854.21 );
}

mat2 rotate( float _t ) {
  return mat2( cos( _t ), sin( _t ), -sin( _t ), cos( _t ) );
}

float word2016( vec3 _p ) {
  vec2 distXY = vec2(
    ( texture2D( texture2016, _p.xy + 0.5 ).x - 0.5 ),
    abs( _p.z ) - 0.03
  );
  return min( max( distXY.x, distXY.y ), 0.0 ) + length( max( distXY, 0.0 ) );
}

float wordKinga( vec3 _p ) {
  vec2 distXY = vec2(
    ( texture2D( textureKinga, _p.xy + 0.5 ).x - 0.5 ),
    abs( _p.z ) - 0.03
  );
  return min( max( distXY.x, distXY.y ), 0.0 ) + length( max( distXY, 0.0 ) );
}

float wave( vec3 _p ) {
  float height = noise( _p.xz ).x;
  return _p.y + abs( height - 0.5 ) * 0.4 + 0.15;
}

float distFunc( vec3 _p, out vec4 mtl ) {
  vec3 p = _p;p.z -= time;
  float dist = wave( p );

  p = _p - vec3( 0.0, 0.11, -0.2 );
  p.zx = rotate( time * PI ) * p.zx;
  float distC = word2016( p ) * 1.0;
  float mtlTemp = 0.0;
  dist = smin( dist, distC, 0.2, mtlTemp );
  mtl.x += mtlTemp;

  p = ( _p - vec3( -0.3, 0.06, 0.4 ) ) * 2.2;
  p.x = mod( p.x - time, 1.0 ) - 0.5;
  p.xy = rotate( sin( time * PI * 2.0 ) * 0.5 ) * p.xy;
  p.zx = rotate( -0.4 ) * p.zx;
  distC = wordKinga( p ) / 2.2;
  dist = smin( dist, distC, 0.15, mtlTemp );
  mtl.x -= mtlTemp;
  mtl.y = mtlTemp;

  return dist;
}

float distFunc( vec3 _p ) {
  vec4 dummy;
  return distFunc( _p, dummy );
}

vec3 normalFunc( vec3 _p, float _d ) {
  vec2 d = vec2( 0.0, _d );
  return normalize( vec3(
    distFunc( _p + d.yxx ) - distFunc( _p - d.yxx ),
    distFunc( _p + d.xyx ) - distFunc( _p - d.xyx ),
    distFunc( _p + d.xxy ) - distFunc( _p - d.xxy )
  ) );
}

vec3 catColor( float _t ) {
  return vec3(
    cos( _t ),
    cos( _t + PI / 3.0 * 4.0 ),
    cos( _t + PI / 3.0 * 2.0 )
  ) * 0.5 + 0.5;
}

void main() {
  vec2 p = ( gl_FragCoord.xy * 2.0 - resolution ) / resolution.x;

  vec3 camPos = vec3( 0.0, 0.0, 1.0 );
  vec3 camCen = vec3( 0.0, 0.0, 0.0 );
  vec3 camDir = normalize( camCen - camPos );
  vec3 camAir = vec3( 0.0, 1.0, 0.0 );
  vec3 camSid = normalize( cross( camDir, camAir ) );
  vec3 camTop = normalize( cross( camSid, camDir ) );

  vec3 rayDir = normalize( p.x * camSid + p.y * camTop + camDir * 2.0 );
  vec3 rayBeg = camPos;
  float rayLen = 0.01;
  vec3 rayPos = rayBeg + rayLen * rayDir;

  float dist = 0.0;
  vec4 mtl = vec4( 0.0 );

  for ( int i = 0; i < 200; i ++ ) {
    dist = distFunc( rayPos, mtl );
    rayLen += dist * 0.8;
    rayPos = rayBeg + rayLen * rayDir;
    if ( dist < 1E-3 || 5E1 < rayLen ) { break; }
  }

  if ( dist < 1E-2 ) {
    vec3 nor = normalFunc( rayPos, rayLen * 5E-3 );
    vec3 ligPos = vec3( -4.0, 3.0, 5.0 );
    vec3 ligDir = normalize( rayPos - ligPos );
    vec3 difCol = catColor( 2.0 + mtl.x * 0.61 );
    vec3 dif = saturate( dot( -nor, ligDir ) ) * difCol;
    vec3 spe = pow( saturate( dot( -nor, normalize( ligDir + camDir ) ) ), 10.0 ) * vec3( 0.5 );
    float decay = exp( -rayLen * 0.1 );
    gl_FragColor = mix(
      vec4( 0.0, 0.0, 0.0, 1.0 ),
      vec4( dif + spe, 1.0 ),
      decay
    );
    if ( mtl.y < 0.5 ) {
      gl_FragColor = texture2D( noiseTexture, nor.xy );
    }
  }
}
