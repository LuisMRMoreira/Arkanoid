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
var CUBEWIDTH =  PLANEWIDTH/8;//Vai ter 12 cubos em cada linha
var CUBEHEIGHT = CUBEWIDTH/3;//2 pareceu-me o melhor valor

//Tamanho da Barra que se movimeta no fundo
var BARWIDTH = PLANEWIDTH/7;
var BARHEIGHT = PLANEHEIGHT/60;
var BARDEPTH = PLANEHEIGHT/60;
//Velocidade a que a barra se movimenta
var SPEEDMOVEBAR = PLANEWIDTH*0.03; // aumenta-se o 0.01 para aumentar a velocidade

//Limites do movimento da Barra
var BEGINBARMOVE = -PLANEWIDTH/2 + BARWIDTH/2; //Limite da esquerda
var ENDBARMOVE = PLANEWIDTH/2 - BARWIDTH/2; //Limite da direita

//Limites da barra de cubos
var BEGINCUBELINE = -PLANEWIDTH/2 + CUBEWIDTH/2; //Limite da esquerda
var ENDCUBELINE = PLANEWIDTH/2 - CUBEWIDTH/2; //Limite da direita

//Define quantas linhas a barra de cubos vai ter (útil para subir de nível)
var NUMLINHAS = 5;

//Limite vertical da barra de cubos
var BEGINDRAWLINES = PLANEHEIGHT/2 - 5 * CUBEHEIGHT; //Começa a escrever a partir da linha 5 a contar desde o cimo do plano. 5 pareceu-me i valor indicado
var ENDDRAWLINES = BEGINDRAWLINES - NUMLINHAS * CUBEHEIGHT;//Limite inferior da barra de cubos na horizontal (eixo do y).

//Tamanho da bola
var BALLRADIUS = PLANEWIDTH/40;

//Tabela de cores usadas para pintar os blocos aleatoriamente
var pallete = [
  [0xF2DC00, 0x00CADB, 0xCC0000, 0x009C0B, 0x725000],
  [0x9EDF60, 0x42A2C7, 0xF4DBDB, 0x26418B, 0x020922],
  [0xFF4ADC, 0xDFB14F, 0xEFF17A, 0x78CB6D, 0x18F7FF],
];

//"Velocidade" e direção da bola. Em cada "iteração" do render, anda 0.5 no referencial
var Xincremento = 0.1; // caso se mude o valor de 0.1 para outro, não vai functionar no calculo de colisões
var Yincremento = 0.1;

//Profundidade das paredes laterais
var SIDEWALLSDEPTH = CUBEWIDTH/4;


var bolaCoordenadasBase = {x: 0, y: -2};

var scene;
var camera;
var controls
var renderer;


var plane;
var collidableObjects = []; // An array of collidable objects used later
var bar;
var ball;
var leftWall;
var rigthWall;
var upWall;
var qtObjects = 0;



var init = function () {

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    document.addEventListener('keydown', checkKey);
    window.addEventListener('resize',onWindowResize,false);
    
    //this.createLight();
    
    this.criarTodosOsObjetos();
    this.ref();
    this.cameraResize();

    //camera.position.x = -30;
    //camera.position.z = 10;
    //camera.rotation.y = -45 * Math.PI / 180; //45 * Math.PI / 180;//0 * Math.PI / 180;

    this.render();
};

var cameraResize = function () {
  camera.position.z = PLANEWIDTH/PLANEHEIGHT*37;//Math.pow(PLANEWIDTH); //PLANEWIDTH/PLANEHEIGHT;
  camera.position.x = 0;//50 //0
  //camera.position.y = -15; 

  //camera.rotation.x = 35* Math.PI / 180;
};

var render = function () {
    requestAnimationFrame(render);

    //this.animateMoveBar();
    this.tratamentoDeColisoes();

    renderer.render(scene, camera);
};

function tratamentoDeColisoes()
{
  /*O javaScript usa muitas casas decimais (grande precisão). o incremento neste caso é só de 0.1, ou seja entre as várias posições, 
  só queremos compara os dois primeiros digitos da parte decimal, daí fazermos um arredondamento para duas casas decimais (Math.round)
  
  EDIT 1: O Math.round, ao arredomdar, não funcionava, porque saltava valores 6,5 => 7, o que não é o que se quer. Para se resolver isso,
   usou.se o toFixed(1), que mostra apenas uma casa decimal
   
  */

  /*Caso a posição da bola seja igual à do limite do plano (x = PLANEWIDTH/2 ou x = -PLANEWIDTH/2), o valor incrementado na posição 
  da bolta tem de ser o inverso do que estava em vigor. Por exemplo, caso a bola esteja a movimentar-se na horizontal a 
  uma "velocidade" (incremento) de 0.1, quando a sua posição coincida com o limite do plano, a "velocidade" passa a ser de -0.1, 
  ou seja, a cada interceção no x, o incremento é o negativo do que estava a ser incrementado (++ = +, -+ = -, -- = +)  
  */


  //
  //Colisão nas Paredes laterais
  //
  // Colisão com as paredes laterais
  if ((ball.position.x+BALLRADIUS).toFixed(1) ==(PLANEWIDTH/2) || (ball.position.x-BALLRADIUS).toFixed(1) == (-PLANEWIDTH/2)) //ERRO!!!! Pelos vistos -10 = -6
  {
    Xincremento = -Xincremento;
  }    
    
  // Colsão com a parede de cima e o fundo
  if ((ball.position.y+BALLRADIUS).toFixed(1) == (PLANEHEIGHT/2) || (ball.position.y-BALLRADIUS).toFixed(1) == (-PLANEHEIGHT/2)) //Math.round(ball.position.y) == Math.round(PLANEHEIGHT/2)
  {
    Yincremento = -Yincremento;
  }


  //
  //Colisão nas barra de movimento laterais
  //

  // if ((ball.position.y-BALLRADIUS).toFixed(1) == (bar.position.y + BARHEIGHT/2).toFixed(1)) {
  //   if ((ball.position.x+BALLRADIUS).toFixed(1)>=(bar.position.x - BARWIDTH/2).toFixed(1) && (ball.position.x+BALLRADIUS).toFixed(1) <= (bar.position.x + BARWIDTH/2).toFixed(1)) {
  //     Xincremento = -Xincremento;
  //   }


  // }



  
  
  //
  //Colisão nos cubos na barra de cubos
  //
  // for (let i = 0; i < collidableObjects.length; i++) {
    
  //   if ((collidableObjects[i].position.x + CUBEWIDTH/2).toFixed(1) == (ball.position.x+BALLRADIUS).toFixed(1) || (collidableObjects[i].position.x - CUBEWIDTH/2).toFixed(1) == (ball.position.x+BALLRADIUS).toFixed(1)) {
  //     Xincremento = -Xincremento;
  //     break;
  //   }

  //   if ((collidableObjects[i].position.y + CUBEHEIGHT/2).toFixed(1) == (ball.position.y+BALLRADIUS).toFixed(1) || (collidableObjects[i].position.y - CUBEHEIGHT/2).toFixed(1) == (ball.position.y+BALLRADIUS).toFixed(1)) {
  //     Yincremento = -Yincremento;
  //     break;
  //   }
    
  // }  



  //Incremento do valor após possivelmente se ter calculado acolisão
  ball.position.x += Xincremento;
  ball.position.y += Yincremento;
}



function roundNumber(num, scale) {
  if(!("" + num).includes("e")) {
    return +(Math.round(num + "e+" + scale)  + "e-" + scale);
  } else {
    var arr = ("" + num).split("e");
    var sig = ""
    if(+arr[1] + scale > 0) {
      sig = "+";
    }
    return +(Math.round(+arr[0] + "e" + sig + (+arr[1] + scale)) + "e-" + scale);
  }
}





//referencial x y z
var ref = function () 
{
    var axesHelper = new THREE.AxesHelper( 20 );
    scene.add( axesHelper );
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

function onWindowResize()
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth , window.innerHeight);

    //plane.setSize(window.innerWidth , window.innerHeight);
}

function criarTodosOsObjetos()
{
  this.createAPlane();
  this.createSideWalls();
  this.createASphere();
  this.createMoveBar();  
  this.desenhaBarreira();
}

function createSideWalls(){
  var geometrySides = new THREE.BoxGeometry(CUBEWIDTH/3,PLANEHEIGHT,PLANEWIDTH/4);
  var geometryUP = new THREE.BoxGeometry(PLANEWIDTH + 2*CUBEWIDTH/3,CUBEWIDTH/3,PLANEWIDTH/4);
  var material = new THREE.MeshBasicMaterial({color: "green"});
  rigthWall = new THREE.Mesh(geometrySides,material);
  upWall = new THREE.Mesh(geometryUP,material);
  leftWall = new THREE.Mesh(geometrySides,material);

  upWall.position.y = PLANEHEIGHT/2 + (CUBEHEIGHT/2);
  rigthWall.position.x = PLANEWIDTH/2 + (CUBEWIDTH/3)/2;
  leftWall.position.x = -PLANEWIDTH/2 - (CUBEWIDTH/3)/2;

  scene.add(rigthWall);
  scene.add(leftWall);
  scene.add(upWall);
  this.bordas(rigthWall, 0xFFFFFF);
  this.bordas(upWall, 0xFFFFFF);
  this.bordas(leftWall, 0xFFFFFF);
}

var createAPlane = function () {
  var geometry = new THREE.PlaneGeometry( PLANEWIDTH, PLANEHEIGHT );
  var material = new THREE.MeshBasicMaterial( {color: "gray"} );
  plane = new THREE.Mesh( geometry, material );
  scene.add( plane );

};

var createASphere = function()
{
var geometry = new THREE.SphereGeometry( BALLRADIUS, 20, 20 );
var material = new THREE.MeshBasicMaterial( {color: 0x080ff});
ball = new THREE.Mesh( geometry, material );
ball.position.y = -2;
this.bordas(ball, 0xFFFFFF);
scene.add( ball );
};

//Criar a barra que o utilizador vai controlar 
var createMoveBar = function()
{
    var barGeo = new THREE.BoxGeometry(BARWIDTH, BARHEIGHT, BARDEPTH);
    var barMat = new THREE.MeshBasicMaterial({ color: "red", });
    bar = new THREE.Mesh(barGeo, barMat);
    bar.position.y = -PLANEHEIGHT/2 +4;//Para iniciar,
    bar.position.z = BARWIDTH/2;
    bar.name = 'bar';

    this.bordas(bar, 0xFFFFFF);

    scene.add(bar);
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
  scene.add(cube);
  // Used later for collision detection
  collidableObjects.push(cube);


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
        qtObjects++;
    }
  }
    // The size of the maze will be how many cubes wide the array is * the width of a cube
    //mapSize = totalCubesWide * CUBEWIDTH;
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


















