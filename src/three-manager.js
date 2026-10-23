import * as THREE from 'three';

export class ThreeManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true, preserveDrawingBuffer: false });
    this.renderer.setSize(1920, 1080);
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    this.renderer.setClearColor(0x000000, 0); // Explicitly clear to transparent
    
    this.scene = new THREE.Scene();
    
    this.camera = new THREE.PerspectiveCamera(45, 1920 / 1080, 0.1, 1000);
    this.camera.position.set(0, 5, 20);
    this.camera.lookAt(0, 5, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 5);
    this.scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xff00ff, 2, 50);
    pointLight.position.set(0, 5, 5);
    this.scene.add(pointLight);
    this.pointLight = pointLight;

    this.style = 0;
    this.avatarGroup = new THREE.Group();
    this.scene.add(this.avatarGroup);
    
    this.parts = {};
    this.time = 0;
    this.sliderAvatar3D = 1;
  }

  setSlider(val) {
    this.sliderAvatar3D = val;
    let responsiveScale = 1;
    if (this.camera && this.camera.aspect < 16/9) {
      responsiveScale = this.camera.aspect / (16/9);
    }
    this.avatarGroup.scale.set(val * responsiveScale, val * responsiveScale, val * responsiveScale);
  }

  resize(w, h) {
    // Keep 1920x1080 logic internally but update if needed.
    // We force 1920x1080 for export consistency.
    if (this.camera) {
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    }
    
    // Scale 3D avatar responsively for vertical screens so it doesn't get cut off
    const ratio = w / h;
    let responsiveScale = 1;
    if (ratio < 16/9) {
      responsiveScale = ratio / (16/9);
    }
    this.avatarGroup.scale.set(this.sliderAvatar3D * responsiveScale, this.sliderAvatar3D * responsiveScale, this.sliderAvatar3D * responsiveScale);
    
    this.renderer.setSize(w, h, false); // pass false to prevent it from overriding CSS
  }

  setStyle(styleIndex) {
    this.style = parseInt(styleIndex, 10);
    if (this.canvas) {
      this.canvas.style.display = this.style > 0 ? 'block' : 'none';
    }
    this.buildAvatar();
  }

  buildAvatar() {
    // Clear old avatar
    while (this.avatarGroup.children.length > 0) {
      this.avatarGroup.remove(this.avatarGroup.children[0]);
    }
    this.parts = {};

    if (this.style === 1) {
      // Voxel Robot
      const mat = new THREE.MeshStandardMaterial({ color: 0x00ffff, metalness: 0.8, roughness: 0.2 });
      
      const head = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), mat);
      head.position.y = 8;
      this.avatarGroup.add(head);
      
      const body = new THREE.Mesh(new THREE.BoxGeometry(3, 4, 2), mat);
      body.position.y = 4.5;
      this.avatarGroup.add(body);
      
      const leftArm = new THREE.Mesh(new THREE.BoxGeometry(1, 3, 1), mat);
      leftArm.position.set(-2.5, 5, 0);
      this.avatarGroup.add(leftArm);
      
      const rightArm = new THREE.Mesh(new THREE.BoxGeometry(1, 3, 1), mat);
      rightArm.position.set(2.5, 5, 0);
      this.avatarGroup.add(rightArm);
      
      this.parts = { head, body, leftArm, rightArm };

    } else if (this.style === 2) {
      // Geo Dancer
      const mat = new THREE.MeshStandardMaterial({ color: 0xff00ff, wireframe: true, emissive: 0xaa00aa });
      
      const head = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 1), mat);
      head.position.y = 8;
      this.avatarGroup.add(head);
      
      const body = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1, 4, 8), mat);
      body.position.y = 4.5;
      this.avatarGroup.add(body);
      
      const leftArm = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 8), mat);
      leftArm.position.set(-3, 5, 0);
      this.avatarGroup.add(leftArm);
      
      const rightArm = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 8), mat);
      rightArm.position.set(3, 5, 0);
      this.avatarGroup.add(rightArm);

      this.parts = { head, body, leftArm, rightArm };
    } else if (this.style === 3) {
      // Floating Lotus
      const mat = new THREE.MeshPhysicalMaterial({
        color: 0xffaacc,
        metalness: 0.1,
        roughness: 0.2,
        transmission: 0.8,
        thickness: 0.5,
        clearcoat: 1.0,
      });
      const core = new THREE.Mesh(new THREE.OctahedronGeometry(2, 0), mat);
      core.position.y = 6;
      this.avatarGroup.add(core);

      const petals = [];
      for(let i=0; i<4; i++) {
        const petal = new THREE.Mesh(new THREE.ConeGeometry(1.5, 4, 3), mat);
        petal.position.y = 6;
        petal.rotation.z = Math.PI / 4;
        petal.rotation.x = (Math.PI / 2) * i;
        this.avatarGroup.add(petal);
        petals.push(petal);
      }

      this.parts = { core, petals };
    } else if (this.style === 4) {
      // Meditation Sphere
      const mat = new THREE.MeshStandardMaterial({ 
        color: 0x44aaff, 
        emissive: 0x113355,
        wireframe: true,
        transparent: true,
        opacity: 0.6
      });
      const innerMat = new THREE.MeshStandardMaterial({
        color: 0xffdd88,
        emissive: 0x553311,
        roughness: 0.2
      });
      const sphere = new THREE.Mesh(new THREE.IcosahedronGeometry(4, 2), mat);
      sphere.position.y = 6;
      this.avatarGroup.add(sphere);
      
      const core = new THREE.Mesh(new THREE.SphereGeometry(2, 32, 32), innerMat);
      core.position.y = 6;
      this.avatarGroup.add(core);

      this.parts = { sphere, core };
    } else if (this.style >= 5 && this.style <= 34) {
      // Procedural Abstract Avatars
      const seed = this.style;
      const geometries = [
        new THREE.TorusKnotGeometry(2, 0.5, 100, 16),
        new THREE.TetrahedronGeometry(3),
        new THREE.OctahedronGeometry(3),
        new THREE.DodecahedronGeometry(3),
        new THREE.IcosahedronGeometry(3),
        new THREE.TorusGeometry(3, 1, 16, 100),
        new THREE.RingGeometry(1, 3, 32),
        new THREE.CylinderGeometry(2, 2, 6, 32),
        new THREE.ConeGeometry(3, 6, 32),
        new THREE.CapsuleGeometry(2, 4, 4, 8)
      ];
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(((seed * 137.5) % 360) / 360, 0.8, 0.5),
        wireframe: seed % 2 === 0,
        metalness: (seed % 3) / 3,
        roughness: (seed % 4) / 4,
        emissive: new THREE.Color().setHSL(((seed * 137.5) % 360) / 360, 1, 0.2)
      });
      
      const mainObj = new THREE.Mesh(geometries[seed % geometries.length], mat);
      mainObj.position.y = 6;
      this.avatarGroup.add(mainObj);
      
      const orbitals = [];
      const numOrbitals = (seed % 5) + 2;
      for (let i = 0; i < numOrbitals; i++) {
        const oMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const o = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 2), oMat);
        this.avatarGroup.add(o);
        orbitals.push({ mesh: o, offset: (i / numOrbitals) * Math.PI * 2, speed: 1 + (seed % 3) });
      }
      this.parts = { mainObj, orbitals, seed };
    } else if (this.style === 65) {
      // 66. DJ Turntable Setup
      
      // Base table/mixer
      const tableMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.8, roughness: 0.2 });
      const table = new THREE.Mesh(new THREE.BoxGeometry(10, 1, 4), tableMat);
      table.position.y = 5;
      this.avatarGroup.add(table);

      // Left Platter
      const platterMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9, roughness: 0.1 });
      const leftPlatter = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.2, 32), platterMat);
      leftPlatter.position.set(-3, 5.6, 0);
      this.avatarGroup.add(leftPlatter);
      
      const leftLabel = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.22, 16), new THREE.MeshBasicMaterial({ color: 0xff3366 }));
      leftLabel.position.set(-3, 5.6, 0);
      this.avatarGroup.add(leftLabel);

      // Right Platter
      const rightPlatter = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.2, 32), platterMat);
      rightPlatter.position.set(3, 5.6, 0);
      this.avatarGroup.add(rightPlatter);
      
      const rightLabel = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.22, 16), new THREE.MeshBasicMaterial({ color: 0x00ccff }));
      rightLabel.position.set(3, 5.6, 0);
      this.avatarGroup.add(rightLabel);

      // Center Mixer panel
      const mixerMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
      const mixer = new THREE.Mesh(new THREE.BoxGeometry(2, 0.2, 3.8), mixerMat);
      mixer.position.set(0, 5.6, 0);
      this.avatarGroup.add(mixer);

      // Crossfader track & knob
      const track = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 0.2), new THREE.MeshBasicMaterial({ color: 0x000000 }));
      track.position.set(0, 5.7, 1.2);
      this.avatarGroup.add(track);

      const fader = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 0.4), new THREE.MeshStandardMaterial({ color: 0x888888 }));
      fader.position.set(0, 5.8, 1.2);
      this.avatarGroup.add(fader);

      this.parts = { table, leftPlatter, leftLabel, rightPlatter, rightLabel, mixer, fader };
    } else if (this.style >= 35 && this.style <= 64) {
      // 30 Pro DJ / Club 3D Props Procedural
      const seed = this.style;
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(((seed * 25) % 360) / 360, 0.9, 0.5),
        metalness: 0.8,
        roughness: 0.1,
        emissive: new THREE.Color().setHSL(((seed * 25) % 360) / 360, 1, 0.2)
      });
      
      const clubObj = new THREE.Group();
      clubObj.position.y = 6;
      clubObj.scale.setScalar(1.5);
      this.avatarGroup.add(clubObj);

      if (seed % 3 === 0) {
        // Disco Ball
        const ball = new THREE.Mesh(new THREE.IcosahedronGeometry(3, 3), mat);
        clubObj.add(ball);
      } else if (seed % 3 === 1) {
        // Speaker Stack
        const box1 = new THREE.Mesh(new THREE.BoxGeometry(3, 4, 2), mat);
        const box2 = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), mat);
        box2.position.y = 3;
        clubObj.add(box1);
        clubObj.add(box2);
      } else {
        // DJ Turntable
        const deck = new THREE.Mesh(new THREE.BoxGeometry(5, 1, 4), new THREE.MeshStandardMaterial({color: 0x222222}));
        const platter = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.2, 32), mat);
        platter.position.y = 0.6;
        clubObj.add(deck);
        clubObj.add(platter);
      }
      this.parts = { clubObj, seed };
    }
  }

  update(frequencyData, timeMs) {
    if (this.style === 0) {
      this.renderer.clear();
      return;
    }

    this.time = timeMs / 1000;
    
    // Calculate Bass
    let bass = 0;
    if (!frequencyData || frequencyData.length === 0 || frequencyData.every(v => v === 0)) {
      // Gentle mock bass for preview
      bass = ((Math.sin(this.time * 2) * 0.5 + 0.5) * 0.05) + 0.02; // Reduced intensity for calmer preview
    } else {
      let sum = 0;
      for (let i = 0; i < 10; i++) sum += frequencyData[i];
      bass = (sum / 10) / 255;
    }

    // Animate PointLight
    this.pointLight.intensity = 2 + bass * 5;
    this.pointLight.color.setHSL((this.time * 0.1) % 1, 1, 0.5);

    if (this.style === 1) {
      // Voxel Robot Dance
      const { head, body, leftArm, rightArm } = this.parts;
      if (head) {
        head.position.y = 8 + Math.abs(Math.sin(this.time * 4)) * bass * 2;
        head.rotation.y = Math.sin(this.time * 2) * 0.5;
        body.rotation.y = Math.sin(this.time * 2) * 0.2;
        body.position.y = 4.5 + Math.abs(Math.sin(this.time * 4)) * bass * 1;
        
        leftArm.rotation.z = Math.sin(this.time * 8) * bass * 2;
        leftArm.position.y = 5 + Math.sin(this.time * 8) * bass;
        
        rightArm.rotation.z = -Math.sin(this.time * 8) * bass * 2;
        rightArm.position.y = 5 + Math.sin(this.time * 8) * bass;
      }
    } else if (this.style === 2) {
      // Geo Dancer Dance
      const { head, body, leftArm, rightArm } = this.parts;
      if (head) {
        head.rotation.x += 0.01;
        head.rotation.y += 0.02;
        head.scale.setScalar(1 + bass * 0.5);
        
        body.rotation.y += 0.01;
        body.scale.setScalar(1 + bass * 0.2);
        
        leftArm.position.x = -3 - Math.sin(this.time * 5) * bass * 3;
        leftArm.position.y = 5 + Math.cos(this.time * 5) * bass * 3;
        
        rightArm.position.x = 3 + Math.sin(this.time * 5) * bass * 3;
        rightArm.position.y = 5 + Math.cos(this.time * 5) * bass * 3;
      }
    } else if (this.style === 3) {
      // Floating Lotus
      const { core, petals } = this.parts;
      if (core) {
        core.rotation.y += 0.005;
        core.position.y = 6 + Math.sin(this.time) * 0.5;
        const breath = 1 + Math.sin(this.time * 2)*0.05 + bass*0.2;
        core.scale.setScalar(breath);
        
        if (petals) {
          petals.forEach((p, i) => {
            p.rotation.y += 0.01;
            p.position.y = 6 + Math.sin(this.time + i) * 0.5;
            p.scale.setScalar(1 + bass*0.3);
          });
        }
      }
    } else if (this.style === 4) {
      // Meditation Sphere
      const { sphere, core } = this.parts;
      if (sphere) {
        sphere.rotation.x += 0.002;
        sphere.rotation.y += 0.003;
        const breath = 1 + Math.sin(this.time)*0.1 + bass*0.1;
        sphere.scale.setScalar(breath);
        
        if (core) {
          core.rotation.y -= 0.01;
          core.scale.setScalar(1 + bass*0.4);
        }
      }
    } else if (this.style >= 5 && this.style <= 34) {
      const { mainObj, orbitals, seed } = this.parts;
      if (mainObj) {
        mainObj.rotation.x += 0.01 * (seed % 3 + 1);
        mainObj.rotation.y += 0.02 * (seed % 2 + 1);
        mainObj.scale.setScalar(1 + bass * (0.5 + (seed % 5) * 0.1));
        
        orbitals.forEach(o => {
          o.mesh.position.x = mainObj.position.x + Math.cos(this.time * o.speed + o.offset) * (4 + bass * 2);
          o.mesh.position.z = mainObj.position.z + Math.sin(this.time * o.speed + o.offset) * (4 + bass * 2);
          o.mesh.position.y = mainObj.position.y + Math.sin(this.time * 2 + o.offset);
          o.mesh.rotation.x += 0.05 + bass * 0.1;
          o.mesh.rotation.y += 0.05 + bass * 0.1;
        });
      }
    } else if (this.style === 65) {
      // DJ Turntable Animation
      const { table, leftPlatter, leftLabel, rightPlatter, rightLabel, mixer, fader } = this.parts;
      
      // Bounce the whole table to the beat
      const tableY = 5 + (bass * 1.5);
      table.position.y = tableY;
      leftPlatter.position.y = tableY + 0.6;
      leftLabel.position.y = tableY + 0.6;
      rightPlatter.position.y = tableY + 0.6;
      rightLabel.position.y = tableY + 0.6;
      mixer.position.y = tableY + 0.6;
      fader.position.y = tableY + 0.8;
      
      // Track moves with the mixer
      // Rotate platters
      const rotationSpeed = this.time * 2 + (bass * 5);
      leftPlatter.rotation.y = -rotationSpeed;
      leftLabel.rotation.y = -rotationSpeed;
      rightPlatter.rotation.y = rotationSpeed;
      rightLabel.rotation.y = rotationSpeed;

      // Move crossfader back and forth to rhythm
      fader.position.x = Math.sin(this.time * 4) * 0.6 * (0.5 + bass);
    } else if (this.style >= 35 && this.style <= 64) {
      const { clubObj, seed } = this.parts;
      if (clubObj) {
        if (seed % 3 === 0) {
          clubObj.rotation.y += 0.05 + bass * 0.1;
          clubObj.scale.setScalar(1.5 + bass * 0.6);
        } else if (seed % 3 === 1) {
          clubObj.children[0].scale.setScalar(1.5 + bass * 0.5);
          clubObj.children[1].scale.setScalar(1.5 + bass * 0.8);
        } else {
          clubObj.scale.setScalar(1.5);
          clubObj.rotation.y = Math.sin(this.time) * 0.2;
          clubObj.children[1].rotation.y += 0.1 + bass * 0.5;
          clubObj.position.y = 4 - bass * 2;
        }
      }
    }

    this.renderer.render(this.scene, this.camera);
  }
}
