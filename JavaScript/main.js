//Tamanhos do plano de fundo (ainda não consegui fazer uma relação entre os tamanhos e a camara ao usar o window.innerWidth e window.innerHeight. Tentei fazer uma função chamada cameraResize)
//15 e 20 apenas são valores de teste
var PLANEWIDTH = 15;//window.innerWidth;
var PLANEHEIGHT = 20;//window.innerHeight;

//Tamanho dos cubos da barra
/*tem de se chama o CUBEWIDTH em vez do PLANEHEIGTH porque o PLANEWIDTH é sempre mais pequeno que o PLANEWIDTH, dessa forma, caso se 
fize-se a divisão normal (var CUBEWIDTH =  PLANEWIDTH/30; var CUBEHEIGHT = PLANEHEIGTH/25;), os cubos iriam ficam na vertial 
(maiores na vertical do que na horizaontal). Por outro lado, caso se troca-se o valor 
(var CUBEWIDTH =  PLANEHEIGTH/25; var CUBEHEIGHT = PLANEWIDTH/30;), o CUBEWIDTH deixava de ser multiplo do PLANEWIDTH e não iria desenhar 
desde uma ponta à outra do plano. Da forma que está implementado, garantimos que o cubo, é sempre maior na horizontal do que na vertical.*/
var CUBEWIDTH =  PLANEWIDTH/15;//Vai ter 15 cubos em cada linha
var CUBEHEIGHT = CUBEWIDTH/2.5;//2.5 pareceu-me o melhor valor

//Tamanho da Barra que se movimeta no fundo
var BARWIDTH = PLANEWIDTH/10;
var BARHEIGHT = PLANEHEIGHT/60;
//Velocidade a que a barra se movimenta
var SPEEDMOVEBAR = PLANEWIDTH*0.01; // aumenta-se o 0.01 para aumentar a velocidade

//Limites do movimento da Barra
var BEGINBARMOVE = -PLANEWIDTH/2 + BARWIDTH/2; //Limite da esquerda
var ENDBARMOVE = PLANEWIDTH/2 - BARWIDTH/2; //Limite da direita

//Limites da barra de cubos
var BEGINCUBELINE = -PLANEWIDTH/2 + CUBEWIDTH/2; //Limite da esquerda
var ENDCUBELINE = PLANEWIDTH/2 - CUBEWIDTH/2; //Limite da direita

//Define quantas linhas a barra de cubos vai ter (útil para subir de nível)
var NUMLINHAS = 11;

//Limite vertical da barra de cubos
var BEGINDRAWLINES = PLANEHEIGHT/2 - 7 * CUBEHEIGHT; //Começa a escrever a partir da linha 7 a contar desde o cimo do plano. 7 pareceu-me i valor indicado
var ENDDRAWLINES = BEGINDRAWLINES - NUMLINHAS * CUBEHEIGHT;//Limite inferior da barra de cubos na horizontal (eixo do y).

//Tamanho da bola
var BALLRADIUS = PLANEWIDTH/40;


var pallete = [
  [0xF2DC00, 0x00CADB, 0xCC0000, 0x009C0B, 0x725000],
  [0x9EDF60, 0x42A2C7, 0xF4DBDB, 0x26418B, 0x020922],
  [0xFF4ADC, 0xDFB14F, 0xEFF17A, 0x78CB6D, 0x18F7FF],
];



var scene;
var camera;
var controls
var renderer;


var plane;
var collidableObjects = []; // An array of collidable objects used later
var bar
var sphere;
var leftWall;
var rigthWall;
var upWall;



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
    this.createASphere();
    this.createSideWalls();
    this.ref();
    this.cameraResize();

    //camera.position.x = -30;
    //camera.position.z = 10;
    //camera.rotation.y = -45 * Math.PI / 180; //45 * Math.PI / 180;//0 * Math.PI / 180;

    this.render();
};

var cameraResize = function () {
  camera.position.z = 30;//Math.pow(PLANEWIDTH); //PLANEWIDTH/PLANEHEIGHT;
  camera.position.x = 0;//50 //0
  camera.position.y = 0; 
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

function desenhaBarreira() {
  // Maze wall mapping, assuming even square

  //Cmeça a desenhar desde o x negativo (-PLANEWHIDTH) ate ao (-PLANEWHIDTH)
  //                         z = 0
  //                         y = (Ex.: +4)

  // wall details
  var cubeGeo = new THREE.BoxGeometry(CUBEWIDTH, CUBEHEIGHT, CUBEWIDTH);
  var indexPlallet = Math.floor(Math.random() * 3);  

  //Começa a desenhar na posicção 0 do z e o y e na posição negativa de metade do plano que desenhamos (que tem centro em 0)
  //Acaba de desenhar no valor positivo do x igual a metade do plano desenhado e neste caso o y vai até 5 (0 -> 5)
  for (var i =  BEGINDRAWLINES ; i >= ENDDRAWLINES; i-= CUBEHEIGHT) { // linhas
    for (var j = BEGINCUBELINE; j <= ENDCUBELINE; j+=CUBEWIDTH) {//colunas

        this.createCube(indexPlallet, cubeGeo,i,j)

    }
  }
    // The size of the maze will be how many cubes wide the array is * the width of a cube
    //mapSize = totalCubesWide * CUBEWIDTH;
}


var createCube = function(indexPlallet,cubeGeo,i,j)
{
  var randomNumber = Math.floor(Math.random() * 5);  
  var cubeMat = new THREE.MeshBasicMaterial({
    color: pallete[indexPlallet][randomNumber]
  });
  
  // Make the cube
  cube = new THREE.Mesh(cubeGeo, cubeMat);
  //Set yhe cube location
  cube.position.z =0;
  cube.position.y = i;
  cube.position.x = j;
  cube.name = 'box' + cube.position.x.toString() + "," + cube.position.y.toString(); 

  
  this.bordas(cube, 0x000000);


  // Add the cube
  scene.add(cube);
  // Used later for collision detection
  collidableObjects.push(cube);


}

//Criar a barra que o utilizador vai controlar 
var createMoveBar = function()
{
    var barGeo = new THREE.BoxGeometry(BARWIDTH, BARHEIGHT, BARWIDTH);
    var barMat = new THREE.MeshBasicMaterial({ color: "red", });
    bar = new THREE.Mesh(barGeo, barMat);
    bar.position.y = -PLANEHEIGHT/2 +4;//Para iniciar,
    bar.position.z = BARWIDTH/2;
    bar.name = 'bar';

    this.bordas(bar, 0xFFFFFF);

    scene.add(bar);
}


function checkKey(evt) {
  const key = evt.key;
  const keyCode = evt.keyCode;

  if (key == 'ArrowRight' || keyCode == 39){
      var barr = scene.getObjectByName('bar');

      if (barr.position.x <= ENDBARMOVE) {
        barr.position.x += SPEEDMOVEBAR;
      }
  }

  else if (key == 'ArrowLeft' || keyCode == 37){
      var barr = scene.getObjectByName('bar');

      if (barr.position.x >= BEGINBARMOVE) {
        barr.position.x -= SPEEDMOVEBAR;
      }
  }
}

var createAPlane = function () {
    var geometry = new THREE.PlaneGeometry( PLANEWIDTH, PLANEHEIGHT );
    var material = new THREE.MeshBasicMaterial( {color: "gray"} );
    plane = new THREE.Mesh( geometry, material );
    scene.add( plane );

};

var createASphere = function()
{
  var geometry = new THREE.SphereGeometry( BALLRADIUS, 32, 32 );
  var material = new THREE.MeshBasicMaterial( {color: 0x080ff});
  sphere = new THREE.Mesh( geometry, material );
  sphere.position.y = -2;
  this.bordas(sphere, 0xFFFFFF);
  scene.add( sphere );
};

function onWindowResize()
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth , window.innerHeight);

    plane.setSize(window.innerWidth , window.innerHeight);
}

function createSideWalls(){
  var geometrySides = new THREE.BoxGeometry(CUBEWIDTH/3,PLANEHEIGHT,PLANEWIDTH/4);
  var geometryUP = new THREE.BoxGeometry(PLANEWIDTH + 2*CUBEWIDTH/3,CUBEWIDTH/3,PLANEWIDTH/4);
  var material = new THREE.MeshBasicMaterial({color: "green"});
  rigthWall = new THREE.Mesh(geometrySides,material);
  upWall = new THREE.Mesh(geometryUP,material);
  leftWall = new THREE.Mesh(geometrySides,material);

  upWall.position.y = PLANEHEIGHT/2;
  leftWall.position.x = PLANEWIDTH/2 + (CUBEWIDTH/3)/2;
  rigthWall.position.x = -PLANEWIDTH/2 - (CUBEWIDTH/3)/2;

  scene.add(rigthWall);
  scene.add(leftWall);
  scene.add(upWall);
  this.bordas(rigthWall, 0xFFFFFF);
  this.bordas(upWall, 0xFFFFFF);
  this.bordas(leftWall, 0xFFFFFF);



}


// Desenha bordas para qulquer objeto (passado como parametro) e de qualquer cor(Passado como parametro)
function bordas(objeto, cor)
{
  var geo = new THREE.EdgesGeometry( objeto.geometry ); // or WireframeGeometry
  var mat = new THREE.LineBasicMaterial( { color: cor, linewidth: 2 } );
  var wireframe = new THREE.LineSegments( geo, mat );
  objeto.add( wireframe );

}


window.onload = this.init;


















