var PLANEWIDTH = window.innerWidth;
var PLANEHEIGHT = window.innerHeight;
var CUBEWIDTH = window.innerWidth/30;
var CUBEHEIGHT =  window.innerHeight/25;
var BARWIDTH = window.innerWidth/25;
var BARHEIGHT = window.innerHeight/25;
var beginDrawBarOnPlane = -PLANEWIDTH/2 + CUBEWIDTH/2; 
var EndDrawBarOnPlane = PLANEWIDTH/2 - CUBEWIDTH/2;
var speedMoveBar = window.innerWidth*0.01;


var scene;
var camera;
var controls
var renderer;


var plane;
var collidableObjects = []; // An array of collidable objects used later
var bar



var init = function () {

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    document.addEventListener('keydown', checkKey);
    window.addEventListener('resize',onWindowResize,false);
    //this.createLight();
    
    this.createAPlane();
    this.desenhaBarreira();
    this.createMoveBar();
    this.ref();

    camera.position.z = 850;
    camera.position.x = 0;//50 //0
    camera.position.y = 0;
    //camera.rotation.x = 180 * Math.PI / 180;
    //camera.position.x = 100;
    camera.rotation.y = 0 * Math.PI / 180; //45 * Math.PI / 180;//0 * Math.PI / 180;

    this.render();
};

var render = function () {
    requestAnimationFrame(render);

    //this.animateMoveBar();
    
    renderer.render(scene, camera);
};

//referencial x y z
var ref = function () 
{
    var axesHelper = new THREE.AxesHelper( 20 );
    scene.add( axesHelper );
}


//https://threejs.org/docs/#examples/controls/OrbitControls



function desenhaBarreira() {
  // Maze wall mapping, assuming even square

  //Cmeça a desenhar desde o x negativo (-PLANEWHIDTH) ate ao (-PLANEWHIDTH)
  //                         z = 0
  //                         y = (Ex.: +4)

  // wall details
  var cubeGeo = new THREE.BoxGeometry(CUBEWIDTH, CUBEHEIGHT, CUBEWIDTH);
  var cubeMat = new THREE.MeshBasicMaterial({
    color: "red", wireframe: true
  });

  //Começa a desenhar na posicção 0 do z e o y e na posição negativa de metade do plano que desenhamos (que tem centro em 0)
  //Acaba de desenhar no valor positivo do x igual a metade do plano desenhado e neste caso o y vai até 5 (0 -> 5)
  for (var i = 0 ; i <= CUBEHEIGHT*5; i+= CUBEHEIGHT) { // linhas
    for (var j = beginDrawBarOnPlane; j <= EndDrawBarOnPlane; j+=CUBEWIDTH) {//colunas
        // Make the cube
        cube = new THREE.Mesh(cubeGeo, cubeMat);
        //Set yhe cube location
        cube.position.z =0;
        cube.position.y = i;
        cube.position.x = j;
        cube.name = 'box' + cube.position.x.toString() + "," + cube.position.y.toString(); 
        // Add the cube
        scene.add(cube);
        // Used later for collision detection
        collidableObjects.push(cube);

    }
  }
    // The size of the maze will be how many cubes wide the array is * the width of a cube
    //mapSize = totalCubesWide * CUBEWIDTH;
}

//Criar a barra que o utilizador vai controlar 
var createMoveBar = function()
{
    var barGeo = new THREE.BoxGeometry(BARWIDTH, BARHEIGHT, BARWIDTH);
    var barMat = new THREE.MeshBasicMaterial({ color: "red", });
    bar = new THREE.Mesh(barGeo, barMat);
    bar.position.y = -PLANEHEIGHT/2 +4;//Para iniciar, 
    bar.name = 'bar';
    scene.add(bar);
}


function checkKey(evt) {
    const key = evt.key;
    const keyCode = evt.keyCode;
  
    if (key == 'ArrowRight' || keyCode == 39){
        var barr = scene.getObjectByName('bar');
  
        if (barr.position.x <= EndDrawBarOnPlane) {
          barr.position.x += speedMoveBar;
        }
    }

    else if (key == 'ArrowLeft' || keyCode == 37){
        var barr = scene.getObjectByName('bar');
  
        if (barr.position.x >= beginDrawBarOnPlane) {
          barr.position.x -= speedMoveBar;
        }
    }
  }



//Faz a barra movimentar-se entre cada um dos lados do plano (vai ser chamado no render)



var createAPlane = function () {
    var geometry = new THREE.PlaneGeometry( PLANEWIDTH, PLANEHEIGHT );
    var material = new THREE.MeshBasicMaterial( {color: "gray"} );
    plane = new THREE.Mesh( geometry, material );



    scene.add( plane );

};

//var createLight = function () {
//    var spotLight = new THREE.SpotLight(0xffffff);
//    spotLight.position.set(10, 20, 20);
//    spotLight.castShadow = true;
//    scene.add(spotLight);
//};

//var animateCube = function () {
//    cube.rotation.x += 0.1;
//    cube.rotation.y += 0.1;
//};

function onWindowResize()
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth , window.innerHeight);

    plane.setSize(window.innerWidth , window.innerHeight);
}

window.onload = this.init;


















