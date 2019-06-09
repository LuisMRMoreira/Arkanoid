'use strict';

const PLANEWIDTH  = 15;
const PLANEHEIGHT = 20;

const DEPTH = PLANEWIDTH / 32;

const CUBEWIDTH   = PLANEWIDTH  / 8;
const CUBEHEIGHT  = CUBEWIDTH   / 3;

const BARWIDTH    = PLANEWIDTH  / 7;
const BARHEIGHT   = PLANEHEIGHT / 60;

const BOTTOM_Y = -PLANEHEIGHT/2 + 2.5;

const SPEEDMOVEBAR = PLANEWIDTH * 0.03;
const MOUSE_SENSITIVITY = 1.3;

// Limite do movimento da Barra na esquerda
const BEGINBARMOVE = -PLANEWIDTH / 2 + BARWIDTH / 2 + SPEEDMOVEBAR;
// Limite do movimento da Barra na direita
const ENDBARMOVE   =  PLANEWIDTH / 2 - BARWIDTH / 2 - SPEEDMOVEBAR;

// Limites da barra de cubos
const BEGINCUBELINE  = -PLANEWIDTH / 2 + CUBEWIDTH / 2; //Limite da esquerda
const ENDCUBELINE    =  PLANEWIDTH / 2 - CUBEWIDTH / 2; //Limite da direita


// Define quantas linhas a barra de cubos vai ter (útil para subir de nível)
const NUMLINHAS = 5;

// Começa a escrever a partir da linha 5
const BEGINDRAWLINES  =  PLANEHEIGHT / 2 - 5 * CUBEHEIGHT;
const ENDDRAWLINES    =  BEGINDRAWLINES - NUMLINHAS * CUBEHEIGHT;

//Tamanho da bola
const BALLRADIUS = PLANEWIDTH / 80;

const INCREMENTO_X = 0.1; // caso se mude o valor de 0.1 para outro, não vai functionar no calculo de colisões
const INCREMENTO_Y = 0.1;


const PALLETE = [
  0xF2DC00, 0x00CADB, 0xCC0000, 0x009C0B, 0x725000,
  0x9EDF60, 0x42A2C7, 0xF4DBDB, 0x26418B, 0x020922,
  0xFF4ADC, 0xDFB14F, 0xEFF17A, 0x78CB6D, 0x18F7FF,
];

const Texturas = [];

const Coracoes = [];

var scene;
var camera;
var controls
var renderer;

var collidableObjects = [];
var bar
var ball;
var ballVector = {x: 0, y: -INCREMENTO_Y};

var plane;
var leftWall;
var rightWall;
var upWall;

var mouseX = 0;
var lifes = 3;

function init()
{
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.x = 0;
    camera.position.y = 0;//20;
    camera.position.z = 30;
    camera.lookAt( scene.position );

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    

    document.addEventListener('keydown', checkKey);
    document.addEventListener('mousemove', mouseMove);
    window.addEventListener('wheel', updateCamera);
    window.addEventListener('resize',onWindowResize);
    
    CarregarTexturas();
    createCubos();
    createMoveBar();
    createBall();

    createSideWalls();
    createBackWall();

    createHearts();
    showReferencialXYZ();

    // para as walls que usam MeshPhongMaterial
    addLights();

    

    render();
}


function render()
{
    if(collidableObjects.length > 0)
    {
        // verifica colisão lateral
        if (ball.position.x+BALLRADIUS > PLANEWIDTH/2 - SPEEDMOVEBAR/2
            || ball.position.x-BALLRADIUS < -PLANEWIDTH/2 + SPEEDMOVEBAR/2)
        {
            ballVector.x = -ballVector.x;
        }


        // verifica colisão com barreira
        if (ball.position.y-BALLRADIUS < BEGINDRAWLINES
            && ball.position.y+BALLRADIUS > ENDDRAWLINES)
        {    removerCubos();    }


        // verifica colisão com barra
        if (ball.position.y > BOTTOM_Y-INCREMENTO_Y
            && ball.position.y < BOTTOM_Y+INCREMENTO_Y)
        {    checkBarCollision();    }
        
        
        // verifica colisão com o topo
        else if(ball.position.y > PLANEHEIGHT/2 - CUBEWIDTH / 6)
        {    ballVector.y = -ballVector.y;    }
        else if(ball.position.y < BOTTOM_Y-INCREMENTO_Y)
        {  
            if (contador == 0) {
                PerderVida();
            }
        }


        ball.position.x += ballVector.x;
        ball.position.y += ballVector.y;
    }else 
    { 
        // text geometry a dizer que ganhou!!
    }
    

    requestAnimationFrame(render);
    renderer.render(scene, camera);
}


function showReferencialXYZ()
{
    const axesHelper = new THREE.AxesHelper( 20 );
    scene.add( axesHelper );
}


function EscreverTexto(texto)
{
    var loader = new THREE.FontLoader();
    loader.load( '../Fonts/helvetiker_regular.typeface.json', function ( font ) {
    
      var textGeometry = new THREE.TextGeometry( texto, {
    
        font: font,
    
        size: 5,
        height: 1,
        curveSegments: 12,
    
        bevelThickness: 0.5,
        bevelSize: 0.3,
        bevelEnabled: true
    
      });
    
      var textMaterial = new THREE.MeshPhongMaterial( 
        { color: 0xff0000, specular: 0xffffff }
      );
    
      var mesh = new THREE.Mesh( textGeometry, textMaterial );
    
      mesh.position.x = -11;
      mesh.position.z = CUBEHEIGHT*2;
      mesh.position.y = -3;
      scene.add( mesh );
    
    });



}




var contador = 0;

function PerderVida()
{
    lifes--;
    contador = 1;
    scene.remove(Coracoes[lifes]); //material = new THREE.MeshBasicMaterial( 0xFFCCE5 );
    Coracoes.splice(lifes,1);
    EscreverTexto("Perdeu");
}



function checkBarCollision()
{
    const currentPos = ball.position.x;
    const barLimits = {
        left:  bar.position.x - BARWIDTH/2,
        right: bar.position.x + BARWIDTH/2
    };

    if (currentPos >= barLimits.left && currentPos <= barLimits.right)
    {
        ballVector.x = (currentPos - bar.position.x) * 0.025;
        ballVector.y = -ballVector.y;
    }
}


function removerCubos()
{
    const ALTURA_CUBO  = CUBEHEIGHT/2;
    const LARGURA_CUBO = CUBEWIDTH /2;

    for (let i = 0; i < collidableObjects.length; i++)
    {
        // verifica colisão
            // inferior
        if((collidableObjects[i].position.y-ALTURA_CUBO < ball.position.y+BALLRADIUS 
            // verifica colisão superior
            && collidableObjects[i].position.y+ALTURA_CUBO > ball.position.y-BALLRADIUS)
            // verifica que o atual bloco[i] esteja no x_alcance
            && collidableObjects[i].position.x-LARGURA_CUBO < ball.position.x+BALLRADIUS
            && collidableObjects[i].position.x+LARGURA_CUBO > ball.position.x-BALLRADIUS)
        {
            ballVector.y = -ballVector.y;

            scene.remove(collidableObjects[i]);
            collidableObjects.splice(i,1);
            
            break;
        }


        if((collidableObjects[i].position.x-LARGURA_CUBO < ball.position.x+BALLRADIUS 
            // verifica colisão superior
            && collidableObjects[i].position.x+LARGURA_CUBO > ball.position.x-BALLRADIUS)
            // verifica que o atual bloco[i] esteja no x_alcance
            && collidableObjects[i].position.y-ALTURA_CUBO < ball.position.y+BALLRADIUS
            && collidableObjects[i].position.y+ALTURA_CUBO > ball.position.y-BALLRADIUS)
        {
            ballVector.x = -ballVector.x;

            scene.remove(collidableObjects[i]);
            collidableObjects.splice(i,1);
            
            break;
        }

    }
}


function createCubos()
{
    //const cubeGeo = new THREE.BoxGeometry(CUBEWIDTH, CUBEHEIGHT, DEPTH);
    //const indexPlallet = Math.floor(Math.random() * 3);  
    
    const cubeGeo = RoundEdgedBox(CUBEWIDTH, CUBEHEIGHT, DEPTH, 0.1, 1,1, 1, 2);// Passar a função RoundEdgedBox


    //Começa a desenhar na posicção 0 do z e o y e na posição negativa de metade do plano que desenhamos (que tem centro em 0)
    //Acaba de desenhar no valor positivo do x igual a metade do plano desenhado e neste caso o y vai até 5 (0 -> 5)

    // linhas
    for (let i =  BEGINDRAWLINES ; i >= ENDDRAWLINES; i-= CUBEHEIGHT)
    {
        //colunas
        for (let j = BEGINCUBELINE; j <= ENDCUBELINE; j+=CUBEWIDTH)
        {
            
            var k = Math.floor(Math.random() * Texturas.length);            
            var cubeMat = new THREE.MeshBasicMaterial({ map: Texturas[k] } );//texturas aleatorias
            var cube = new THREE.Mesh(cubeGeo, cubeMat);
            cube.position.x = j;
            cube.position.y = i;
            cube.position.z = DEPTH;
            drawBordas(cube, 0x000000);
            collidableObjects.push(cube);            
            scene.add(cube);


            // const cubeMat = new THREE.MeshBasicMaterial({color: PALLETE[Math.floor(Math.random() * (PALLETE.length))]});
            // const cube = new THREE.Mesh(cubeGeo, cubeMat);
            // cube.position.x = j;
            // cube.position.y = i;
            // cube.position.z = DEPTH;
            // cube.name = 'box' + cube.position.x.toString() + "," + cube.position.y.toString();
            // drawBordas(cube, 0x000000);
            // scene.add(cube);
            // collidableObjects.push(cube);
        }
    }
}


function RoundEdgedBox(width, height, depth, radius, widthSegments, heightSegments, depthSegments, smoothness) {

    width = width || 1;
    height = height || 1;
    depth = depth || 1;
    radius = radius || (Math.min(Math.min(width, height), depth) * .25);
    widthSegments = Math.floor(widthSegments) || 1;
    heightSegments = Math.floor(heightSegments) || 1;
    depthSegments = Math.floor(depthSegments) || 1;
    smoothness = Math.max(3, Math.floor(smoothness) || 3);

    let halfWidth = width * .5 - radius;
    let halfHeight = height * .5 - radius;
    let halfDepth = depth * .5 - radius;

    var geometry = new THREE.Geometry();

    // corners - 4 eighths of a sphere
    var corner1 = new THREE.SphereGeometry(radius, smoothness, smoothness, 0, Math.PI * .5, 0, Math.PI * .5);
    corner1.translate(-halfWidth, halfHeight, halfDepth);
    var corner2 = new THREE.SphereGeometry(radius, smoothness, smoothness, Math.PI * .5, Math.PI * .5, 0, Math.PI * .5);
    corner2.translate(halfWidth, halfHeight, halfDepth);
    var corner3 = new THREE.SphereGeometry(radius, smoothness, smoothness, 0, Math.PI * .5, Math.PI * .5, Math.PI * .5);
    corner3.translate(-halfWidth, -halfHeight, halfDepth);
    var corner4 = new THREE.SphereGeometry(radius, smoothness, smoothness, Math.PI * .5, Math.PI * .5, Math.PI * .5, Math.PI * .5);
    corner4.translate(halfWidth, -halfHeight, halfDepth);
    
    geometry.merge(corner1);
    geometry.merge(corner2);
    geometry.merge(corner3);
    geometry.merge(corner4);

    // edges - 2 fourths for each dimension
    // width
    var edge = new THREE.CylinderGeometry(radius, radius, width - radius * 2, smoothness, widthSegments, true, 0, Math.PI * .5);
    edge.rotateZ(Math.PI * .5);
    edge.translate(0, halfHeight, halfDepth);
    var edge2 = new THREE.CylinderGeometry(radius, radius, width - radius * 2, smoothness, widthSegments, true, Math.PI * 1.5, Math.PI * .5);
    edge2.rotateZ(Math.PI * .5);
    edge2.translate(0, -halfHeight, halfDepth);

    // height
    var edge3 = new THREE.CylinderGeometry(radius, radius, height - radius * 2, smoothness, heightSegments, true, 0, Math.PI * .5);
    edge3.translate(halfWidth, 0, halfDepth);
    var edge4 = new THREE.CylinderGeometry(radius, radius, height - radius * 2, smoothness, heightSegments, true, Math.PI * 1.5, Math.PI * .5);
    edge4.translate(-halfWidth, 0, halfDepth);

    // depth
    var edge5 = new THREE.CylinderGeometry(radius, radius, depth - radius * 2, smoothness, depthSegments, true, 0, Math.PI * .5);
    edge5.rotateX(-Math.PI * .5);
    edge5.translate(halfWidth, halfHeight, 0);
    var edge6 = new THREE.CylinderGeometry(radius, radius, depth - radius * 2, smoothness, depthSegments, true, Math.PI * .5, Math.PI * .5);
    edge6.rotateX(-Math.PI * .5);
    edge6.translate(halfWidth, -halfHeight, 0);

    edge.merge(edge2);
    edge.merge(edge3);
    edge.merge(edge4);
    edge.merge(edge5);
    edge.merge(edge6);

    // sides
    // front
    var side = new THREE.PlaneGeometry(width - radius * 2, height - radius * 2, widthSegments, heightSegments);
    side.translate(0, 0, depth * .5);

    // right
    var side2 = new THREE.PlaneGeometry(depth - radius * 2, height - radius * 2, depthSegments, heightSegments);
    side2.rotateY(Math.PI * .5);
    side2.translate(width * .5, 0, 0);

    side.merge(side2);

    geometry.merge(edge);
    geometry.merge(side);

    // duplicate and flip
    var secondHalf = geometry.clone();
    secondHalf.rotateY(Math.PI);
    geometry.merge(secondHalf);

    // top
    var top = new THREE.PlaneGeometry(width - radius * 2, depth - radius * 2, widthSegments, depthSegments);
    top.rotateX(-Math.PI * .5);
    top.translate(0, height * .5, 0);

    // bottom
    var bottom = new THREE.PlaneGeometry(width - radius * 2, depth - radius * 2, widthSegments, depthSegments);
    bottom.rotateX(Math.PI * .5);
    bottom.translate(0, -height * .5, 0);

    geometry.merge(top);
    geometry.merge(bottom);

    geometry.mergeVertices();

    geometry
    return geometry;
}


function CarregarTexturas()
{
    var texture = new THREE.TextureLoader().load( "../Texturas/bathroom.jpg" );
    texture.wrapS = THREE.MirroredRepeatWrapping;
    texture.wrapT = THREE.MirroredRepeatWrapping;
    texture.repeat.set( 1, 1 );
    Texturas.push(texture);

    texture = new THREE.TextureLoader().load( "../Texturas/brick-wall.jpg" );
    texture.wrapS = THREE.MirroredRepeatWrapping;
    texture.wrapT = THREE.MirroredRepeatWrapping;
    texture.repeat.set( 1, 1 );
    Texturas.push(texture);

    texture = new THREE.TextureLoader().load( "../Texturas/lava.jpg" );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 1, 1 );
    Texturas.push(texture);

    texture = new THREE.TextureLoader().load( "../Texturas/roughness-map.jpg" );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 1, 1 );
    Texturas.push(texture);

    texture = new THREE.TextureLoader().load( "../Texturas/stone.jpg" );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 1, 1 );
    Texturas.push(texture);

}


//Criar a barra que o utilizador vai controlar 
function createMoveBar()
{
    const barGeo = new THREE.BoxGeometry(BARWIDTH, BARHEIGHT, DEPTH);
    const barMat = new THREE.MeshPhongMaterial({ color: "red", });
    bar = new THREE.Mesh(barGeo, barMat);
    bar.position.y = BOTTOM_Y - BARHEIGHT / 2;
    bar.position.z = DEPTH;

    drawBordas(bar, 0xFFFFFF);
    scene.add(bar);
}


function createBall()
{
    const ballGeo = new THREE.SphereGeometry(BALLRADIUS*2, 20, 20);
    const ballMat = new THREE.MeshPhongMaterial( {color: "yellow"});
    ball = new THREE.Mesh( ballGeo, ballMat );
    ball.position.x = 0;
    ball.position.y = 0;
    ball.position.z = DEPTH;
    scene.add( ball );
}


function createHearts()
{
    const shape = new THREE.Shape();
    const x = -0.25;
    const y = -0.5;

    shape.moveTo(x + 0.25, y + 0.25);
    shape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.2, y, x, y);
    shape.bezierCurveTo(x - 0.3, y, x - 0.3, y + 0.35, x - 0.3, y + 0.35);
    shape.bezierCurveTo(x - 0.3, y + 0.55, x - 0.15, y + 0.77, x + 0.25, y + 0.95);
    shape.bezierCurveTo(x + 0.6, y + 0.77, x + 0.8, y + 0.45, x + 0.8, y + 0.35);
    shape.bezierCurveTo(x + 0.8, y + 0.35, x + 0.8, y, x + 0.5, y);
    shape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25);

    const extrudeSettings = {
        steps: 0.2,
        depth: 0.2,
        bevelEnabled: true,
        bevelThickness: 0.1,
        bevelSize: 0.1,
        bevelSegments: 2,
    };

    const geometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);
    const material = new THREE.MeshBasicMaterial( { color: "red" } );

    for(let i=1; i <= lifes; i++)
    {
        let mesh = new THREE.Mesh( geometry, material );
        mesh.rotation.x = Math.PI - 0.1;
        mesh.rotation.y = 0.1;
        mesh.position.set(BEGINBARMOVE + i*1.5, -PLANEHEIGHT/2 + 1, DEPTH);
        drawBordas(mesh, 0xFFFFFF);
        mesh.name = 'heart' + i.toString();
        Coracoes.push(mesh);
        scene.add(mesh);
    }
}


function createSideWalls()
{
    const LARGURA = CUBEWIDTH / 3;

    const upGeo    = new THREE.BoxGeometry(PLANEWIDTH + 2*LARGURA, LARGURA, DEPTH*2);
    const sidesGeo = new THREE.BoxGeometry(LARGURA, PLANEHEIGHT, DEPTH*2);

    const material = new THREE.MeshPhongMaterial({color: "green"});

    upWall    = new THREE.Mesh(upGeo, material);
    leftWall  = new THREE.Mesh(sidesGeo, material);
    rightWall = new THREE.Mesh(sidesGeo, material);

    leftWall.position.x   = -PLANEWIDTH / 2 - LARGURA / 2;;
    leftWall.position.y   = 0;
    leftWall.position.z   = DEPTH;

    rightWall.position.x  =  PLANEWIDTH / 2 + LARGURA / 2;
    rightWall.position.y  = 0;
    rightWall.position.z  = DEPTH;

    upWall.position.x    = 0;
    upWall.position.y    = PLANEHEIGHT/2 + LARGURA/2;
    upWall.position.z    = DEPTH;

    drawBordas(rightWall, 0xFFFFFF);
    drawBordas(upWall, 0xFFFFFF);
    drawBordas(leftWall, 0xFFFFFF);

    scene.add(rightWall);
    scene.add(leftWall);
    scene.add(upWall);
}


function createBackWall()
{
    const geometry = new THREE.PlaneGeometry( PLANEWIDTH, PLANEHEIGHT );
    const material = new THREE.MeshPhongMaterial( {color: "gray"} );
    plane = new THREE.Mesh( geometry, material );
    scene.add( plane );
}


// Desenha bordas para qulquer objeto (passado como parametro) e de qualquer cor(Passado como parametro)
function drawBordas(objeto, cor)
{
    const geo = new THREE.EdgesGeometry( objeto.geometry ); // or WireframeGeometry
    const mat = new THREE.LineBasicMaterial( { color: cor, linewidth: 2 } );
    const wireframe = new THREE.LineSegments( geo, mat );
    objeto.add( wireframe );
}


function addLights()
{
    let lightOne = new THREE.DirectionalLight(0xffffff);
    lightOne.position.set(1, 1, 1);
    scene.add(lightOne);

    // Add a second light with half the intensity
    let lightTwo = new THREE.DirectionalLight(0xffffff, 0.5);
    lightTwo.position.set(-1, -1, -1);
    scene.add(lightTwo);
}


function onWindowResize()
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(window.innerWidth , window.innerHeight);
}


function checkKey(evt)
{
    const key = evt.key;
    const keyCode = evt.keyCode;

    if (key == 'ArrowRight' || keyCode == 39)
    {
        if (bar.position.x <= ENDBARMOVE)
            bar.position.x += SPEEDMOVEBAR;
    }
    else if (key == 'ArrowLeft' || keyCode == 37)
    {
        if (bar.position.x >= BEGINBARMOVE)
            bar.position.x -= SPEEDMOVEBAR;
    }
}


function mouseMove(evt)
{
    const xPos = evt.clientX;

    // movimento para a direita
    if (mouseX < xPos)
    {
        if (bar.position.x <= ENDBARMOVE)
            bar.position.x += SPEEDMOVEBAR * MOUSE_SENSITIVITY;
    }
    // movimento para a esquerda
    else if (mouseX > xPos)
    {
        if (bar.position.x >= BEGINBARMOVE)
            bar.position.x -= SPEEDMOVEBAR * MOUSE_SENSITIVITY;
    }

    mouseX = xPos;
}


function updateCamera(evt)
{
//max=20
    camera.position.y--;
    camera.position.z--;

    camera.lookAt( scene.position );
}


window.onload = init;
