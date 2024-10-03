export const vertex = `
  attribute vec2 coords;
  attribute vec4 random;
  uniform float uTime;
  uniform sampler2D tPosition;
  uniform sampler2D tVelocity;
  varying vec4 vRandom;
  varying vec4 vVelocity;
  void main() {
    vRandom = random;
    // Get position from texture, rather than attribute
    vec4 position = texture2D(tPosition, coords);
    vVelocity = texture2D(tVelocity, coords);
    
    // Add some subtle random oscillating so it never fully stops
    position.xy += sin(vec2(uTime) * vRandom.wy + vRandom.xz * 6.28) * vRandom.zy * 0.1;
    gl_Position = vec4(position.xy, 0, 1);
    gl_PointSize = mix(2.0, 15.0, vRandom.x);
    // Make bigger while moving
    gl_PointSize *= 1.0 + min(1.0, length(vVelocity.xy));
  }
`

export const fragment = `
  precision highp float;
  varying vec4 vRandom;
  varying vec4 vVelocity;
  void main() {
    // Circle shape
    if (step(0.5, length(gl_PointCoord.xy - 0.5)) > 0.0) discard;
    // Random colour
    vec3 color = vec3(vRandom.zy, 1.0) * mix(0.7, 2.0, vRandom.w);
    // Fade to white when not moving, with an ease off curve
    gl_FragColor.rgb = mix(vec3(1), color, 1.0 - pow(1.0 - smoothstep(0.0, 0.7, length(vVelocity.xy)), 2.0));
    gl_FragColor.a = 1.0;
  }
`

export const positionFragment = `
  precision highp float;
  uniform float uTime;
  uniform sampler2D tVelocity;
  // Default texture uniform for GPGPU pass is 'tMap'.
  // Can use the textureUniform parameter to update.
  uniform sampler2D tMap;
  varying vec2 vUv;
  void main() {
    vec4 position = texture2D(tMap, vUv);
    vec4 velocity = texture2D(tVelocity, vUv);
    position.xy += velocity.xy * 0.01;
                    
    // Keep in bounds
    vec2 limits = vec2(1);
    position.xy += (1.0 - step(-limits.xy, position.xy)) * limits.xy * 2.0;
    position.xy -= step(limits.xy, position.xy) * limits.xy * 2.0;
    gl_FragColor = position;
  }
`

export const velocityFragment = `
  precision highp float;
  uniform float uTime;
  uniform sampler2D tPosition;
  uniform sampler2D tMap;
  uniform vec2 uMouse;
  varying vec2 vUv;
  void main() {
    vec4 position = texture2D(tPosition, vUv);
    vec4 velocity = texture2D(tMap, vUv);
    // Repulsion from mouse
    vec2 toMouse = position.xy - uMouse;
    float strength = smoothstep(0.3, 0.0, length(toMouse));
    velocity.xy += strength * normalize(toMouse) * 0.5;
    // Friction
    velocity.xy *= 0.98;
    gl_FragColor = velocity;
  }
`
