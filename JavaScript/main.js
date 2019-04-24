// Your code here!
//Não é preciso as tags porque isto já é scipt
var scene;
var camera;
var renderer;

var cube;


var init = function () {

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    this.createACube();

    camera.position.z = 5;

    this.render();

};

var render = function () {
    requestAnimationFrame(render);

    this.animateCube();

    renderer.render(scene, camera);
};

var createACube = function () {
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshBasicMaterial({ color: "red" });
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
};

var animateCube = function () {
    cube.rotation.x += 0.1;
    cube.rotation.y += 0.1;
};

window.onload = this.init;
