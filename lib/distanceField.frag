precision highp float;

uniform sampler2D texture;
uniform vec2 resolution;

#define saturate(i) clamp(i,0.,1.)

bool isSameSide( float _col, bool _inside ) {
  return ( _col < 0.0 ) == _inside;
}

float getDist( float _i ) {
  #ifdef HORI
    return ( _i < 0.5 ) ? -1E2 : 1E2;
  #endif

  #ifdef VERT
    return _i - 0.5;
  #endif
}

void main() {
  vec2 p = gl_FragCoord.xy;

  #ifdef HORI
    vec2 gap = vec2( 1.0, 0.0 );
    float reso = resolution.x;
    float coord = gl_FragCoord.x;
  #endif

  #ifdef VERT
    vec2 gap = vec2( 0.0, 1.0 );
    float reso = resolution.y;
    float coord = gl_FragCoord.y;
  #endif

  float dist = getDist( texture2D( texture, p / resolution ).x );
  bool inside = isSameSide( dist, true );

  dist = abs( dist );

  float iMax = reso / 2.0;// + abs( coord - reso / 2.0 );

  for ( int iLoop = 1; iLoop < 1000; iLoop += 1 ) {
    float i = float( iLoop );
    float d = ( i - 0.5 ) / reso;
    if ( iMax < i || dist < d ) { break; }

    for ( int iiLoop = -1; iiLoop < 2; iiLoop += 2 ) {
      float ii = float( iiLoop );
      vec2 tCoord = p + ii * i * gap;
      if ( 0.0 <= tCoord.x && tCoord.x < resolution.x && 0.0 <= tCoord.y && tCoord.y < resolution.y ) {
        float col = getDist( texture2D( texture, tCoord / resolution ).x );
        float distC = 0.0;
        if ( isSameSide( col, inside ) ) {
          distC = length( vec2( d, col ) );
        } else {
          distC = length( vec2( d, 0.0 ) );
        }
        dist = min( dist, distC );
      }
    }
  }

  gl_FragColor = vec4( ( inside ? dist : -dist ) + 0.5, 0.0, 0.0, 1.0 );
}
