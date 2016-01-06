precision highp float;

#define PI 3.14159265
#define V vec2(0.,1.)
#define saturate(i) clamp(i,0.,1.)

uniform float time;
uniform vec2 resolution;
uniform sampler2D renderTexture;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  vec3 tex = texture2D( renderTexture, uv ).xyz;
  vec3 ret = tex;

  if ( false ) {
    float wid = 1.0;
    float deltaxp = length( texture2D( renderTexture, uv + V.yx * wid / resolution ).xyz - tex );
    float deltaxm = length( texture2D( renderTexture, uv - V.yx * wid / resolution ).xyz - tex );
    float deltayp = length( texture2D( renderTexture, uv + V.xy * wid / resolution ).xyz - tex );
    float deltaym = length( texture2D( renderTexture, uv - V.xy * wid / resolution ).xyz - tex );
    float delta = saturate( ( deltaxp + deltaxm + deltayp + deltaym ) * 30.0 );

  	ret = delta * V.yyy;
  }

  gl_FragColor = vec4( ret, 1.0 );
}
