uniform float uTime;
uniform vec4 uResolution;

varying vec2 vUv;
varying vec3 vPosition;

void main() {
    // vec2 uv = (vUv - vec2(0.5)) * uResolution.zw + vec2(0.5);

    gl_FragColor = vec4(vUv, 0.0, 1.0);


    vec2 uv = gl_FragCoord.xy / uResolution.xy * 2. - 1.;
    uv.x *= uResolution.x / uResolution.y;
    uv.y += .5;
    
    uv.x += sin(cos(uv.x*sin(uv.x/2.)-uTime)+uTime)*5.;
    
    vec3 uvRGB = vec3(uv.y,uv.y,uv.y) * 5.;
    
    uvRGB.x += (cos(uv.x)*sin(uTime)+cos(uv.x+uTime*2.))*0.3;
    uvRGB.y += (cos(uv.x+2.)*sin(uTime-2.)+cos(uv.x+uTime*2.))*0.3;
    uvRGB.z += (cos(uv.x+4.)*sin(uTime-4.)+cos(uv.x+uTime*2.))*0.3;
    
    float a = smoothstep(0., abs(uvRGB.x), 0.08);
    float b = smoothstep(0., abs(uvRGB.y), 0.08);
    float c = smoothstep(0., abs(uvRGB.z), 0.08);
    
    vec3 aRGB = vec3(a) * vec3(0.973,0.188,0.384);
    vec3 bRGB = vec3(b) * vec3(0.110,0.949,0.475);
    vec3 cRGB = vec3(c) * vec3(0.067,0.475,0.910);
    
    gl_FragColor = vec4(aRGB + bRGB + cRGB,1.0);
}