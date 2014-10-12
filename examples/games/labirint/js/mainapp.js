window.addEventListener('keyup', function(event) {
    Key.onKeyup(event);
}, false);
window.addEventListener('keydown', function(event) {
    Key.onKeydown(event);
}, false);

var Key = {
    _pressed: {},

    A: 65,
    W: 87,
    D: 68,
    S: 83,
    SPACE: 32,
    VK_LEFT: 37,
    VK_RIGHT: 39,
    VK_UP: 38, // стрелка вверх
    VK_DOWN: 40, // стрелка вниз	
    VK_SPACE: 32,
    VK_ENTER: 13,

    isDown: function(keyCode) {
        return this._pressed[keyCode];
    },

    onKeydown: function(event) {
        this._pressed[event.keyCode] = true;
    },

    onKeyup: function(event) {
        delete this._pressed[event.keyCode];
    }
};


var labirint;
var visota = 12;
var shirina = 12;
var horiz = [];
var verti = [];

labirint = new Array(2 * visota + 1);
for (i = 0; i < 2 * visota + 1; ++i) {
    labirint[i] = new Array(4 * shirina + 1)
}

// Взято с http://javascript.ru/forum/misc/37539-javascript-prokhod-labirinta.html
// Flowers for Algernon
function maze(x, y) {
    var n = x * y - 1;
    if (n < 0) {
        alert("Плохие данные");
        return;
    }

    for (var j = 0; j < x + 1; j++) horiz[j] = [];

    for (var j = 0; j < y + 1; j++) verti[j] = [];

    var here = [Math.floor(Math.random() * x), Math.floor(Math.random() * y)];
    var path = [here];
    var unvisited = [];
    for (var j = 0; j < x + 2; j++) {
        unvisited[j] = [];
        for (var k = 0; k < y + 1; k++)
            unvisited[j].push(j > 0 && j < x + 1 && k > 0 && (j != here[0] + 1 || k != here[1] + 1));
    }
    while (0 < n) {
        var potential = [
            [here[0] + 1, here[1]],
            [here[0], here[1] + 1],
            [here[0] - 1, here[1]],
            [here[0], here[1] - 1]
        ];
        var neighbors = [];
        for (var j = 0; j < 4; j++)
            if (unvisited[potential[j][0] + 1][potential[j][1] + 1])
                neighbors.push(potential[j]);
        if (neighbors.length) {
            n = n - 1;
            next = neighbors[Math.floor(Math.random() * neighbors.length)];
            unvisited[next[0] + 1][next[1] + 1] = false;
            if (next[0] == here[0])
                horiz[next[0]][(next[1] + here[1] - 1) / 2] = true;
            else
                verti[(next[0] + here[0] - 1) / 2][next[1]] = true;
            path.push(here = next);
        } else
            here = path.pop();
    }
    return ({
        x: x,
        y: y,
        horiz: horiz,
        verti: verti
    });
}

function display(m) {
    var text = [];
    for (var j = 0; j < m.x * 2 + 1; j++) {
        var line = [];
        if (0 == j % 2)
            for (var k = 0; k < m.y * 4 + 1; k++)
                if (0 == k % 4)
                    line[k] = 'X';
                else
        if (j > 0 && m.verti[j / 2 - 1][Math.floor(k / 4)])
            line[k] = ' ';
        else
            line[k] = 'X';
        else
            for (var k = 0; k < m.y * 4 + 1; k++)
                if (0 == k % 4)
                    if (k > 0 && m.horiz[(j - 1) / 2][k / 4 - 1])
                        line[k] = ' ';
                    else
                        line[k] = 'X';
        else
            line[k] = ' ';
        if (0 == j) line[1] = line[3] = ' ', line[2] = '1'; // внимание я тут подправил убрал 1
        if (m.x * 2 - 1 == j) line[4 * m.y] = '2'; //  внимание я тут подправил убрал 2
        text.push(line.join('') + '\r\n');

    }

    var text_labirinta = text.join('');
    //alert(text_labirinta);
    text_labirinta = text_labirinta.replace(/\r\n|\r|\n/g, 'n');
    var i = 0;
    var j = 0;
    for (k = 0; k < text_labirinta.length; k++) {
        //alert( k ); 
        sssr = text_labirinta.charAt(k); // alert(sssr);
        if (sssr == 'X') {
            labirint[i][j] = 1;
            j++; // есть кирпич
        }
        if (sssr == ' ') {
            labirint[i][j] = 0;
            j++;
        }

        if (sssr == '2') {
            labirint[i][j] = 2;
            j++;
        }

        if (sssr == 'n') {
            i++;
            j = 0; // alert(i);
        }

    }

    // почему то в углу не хватает одного кубика. добавим ))						
    labirint[0][4 * shirina] = 1;



    /* 
   document.getElementById('structura').innerHTML = '';

 for (i=0; i<2*visota+1; i++)
   { 
      var  sssr  =  document.getElementById('structura').innerHTML + labirint[i].join('-');
      document.getElementById('structura').innerHTML = sssr + '<br>';	
   }
*/
    return text.join('');

}




//делаем глобальными все переменные, с которыми будем работать в других функциях
var container, camera, controls, scene, renderer, light;

window.onload = function() {
    init();
    animate();
}


var soundpath = "snd/"; //путь к папке со звуками	

var orientir;
var Mous, Mikki_Mouse;
var kusok_syra, blok;
var phi, radius_obsora = 3000;
var sound_play = false;
var sound_time = 50;

var Mous_position_z = 500;
var Mous_position_y = 100;
var Mous_position_x = -200;
var a0 = -300,
    b0 = 100;
var cub_width = 56 * 1.5; // размеры блоков лабиринта
var cub_length = 112 * 1.5;
var cub_height = 164;
var x_previous, z_previous; // если мыш зашел в стену, вернем на место				
var bitva_v_rasgare, bitva_begin;
var k;

// scene size
var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var mirrorCube, mirrorCubeCamera; // for mirror material	


init();
animate();


function init() {

    //рендерер
    try {
        renderer = new THREE.WebGLRenderer({
            antialias: true
        });
    } catch (err) {
        alert('В вашем браузере отсутствует поддержка WebGL!');
        try {
            renderer = new THREE.CanvasRenderer();
        } catch (err) {
            alert('Пожалуйста, установите новый браузер с поддержкой WebGL!');
        }
    }

    //устанавливаем цвет фона
    renderer.setClearColor(0xffffff);
    //устанавливаем ему размеры экрана
    renderer.setSize(window.innerWidth, window.innerHeight);
    //и добавляем в наш созданный элемент
    container = document.getElementById('MyWebGLApp');
    container.appendChild(renderer.domElement);

    bitva_begin = false;
    AddCamera(); // добавляем камеру
    bitva_v_rasgare = false;
    teta = 0;
    bitva_begin = false;
    //создаем сцену
    scene = new THREE.Scene();
    AddPol(); //AddSteni();

    Add_labirint();


    Add_Mouse();
    Add_menu();

    Add_Orientir();

    AddLight(); //устанавливаем белый свет 


}


function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    //рендерим
    dinamo();
    pravila.rotation.y = pravila.rotation.y + 0.01;
    if (bitva_begin) {
        if (bitva_v_rasgare) {
            orientir.position.x = Mous.position.x + radius_obsora * Math.cos(phi);
            orientir.position.z = Mous.position.z + radius_obsora * Math.sin(phi);
            camera.lookAt(new THREE.Vector3(orientir.position.x, Mous_position_y + 160, orientir.position.z));
            Mikki_Mouse.position.set(Mous.position.x, Mous.position.y - 30, Mous.position.z);
            Mikki_Mouse.rotation.y = Math.PI - phi;

            if (sound_play == false) {
                if (getRandom(1, 25) == 25) {
                    sound_play = true;
                    sound_time = 0;
                    DHTMLSound(soundpath + "mous_pisk.mp3", "span_sound_game", "");
                }
            }

            if (sound_time < 500) {
                sound_time++;
            }
            if (sound_time == 500) {
                sound_play = false
            }

        } else {
            camera.position.set((4 * shirina) * cub_width / 2 + a0 + 5 / 3 * radius_obsora * Math.cos(teta), 1500, -(2 * visota) * cub_length / 2 + b0 + 5 / 3 * radius_obsora * Math.sin(teta));
            camera.lookAt(new THREE.Vector3((4 * shirina) * cub_width / 2 + a0, 160, -(2 * visota) * cub_length / 2 + b0));
            teta = teta + 0.002;
        }
    } else {
        if (Mikki_Mouse.position.x > Mous.position.x) {
            Mikki_Mouse.position.x = Mikki_Mouse.position.x - 5;
        } else {
            if (Mikki_Mouse.rotation.y > -Math.PI / 2) {
                Mikki_Mouse.rotation.y = Mikki_Mouse.rotation.y - 0.05 * Math.PI / 2
            }
        }

    }

    kusok_syra.rotation.y = kusok_syra.rotation.y + 0.01;

    // работа зеркал
    //mirrorCube.visible = false;
    //mirrorCubeCamera.updateCubeMap( renderer, scene );
    //mirrorCube.visible = true;

    //controls.update(); // управление камерой с помощью мышы
    renderer.render(scene, camera);

}

function dinamo() {

    if (Key.isDown(Key.VK_ENTER) && (!bitva_v_rasgare)) {
        bitva_v_rasgare = true;
        bitva_begin = true;
        Mikki_Mouse.position.set(Mous.position.x, Mous.position.y, Mous.position.z);
        camera.position.set(Mous_position_x, Mous_position_y - 100, Mous_position_z);
        scene.remove(pravila);
        DHTMLSound(soundpath + "labirint.mp3", "span_sound_golos_za_kadrom", "");
    }


    if (!bitva_v_rasgare) {
        return;
    }

    x_previous = Mous.position.x;
    z_previous = Mous.position.z;

    // движение влево
    if (Key.isDown(Key.VK_LEFT)) {
        //if (Mous.position.x > -600)
        {
            phi = phi - 0.03;
        }

    }

    if (Key.isDown(Key.VK_RIGHT)) {
        //if (Mous.position.x < 450)
        {
            phi = phi + 0.03;
        }

    }

    // движение вперед
    if (Key.isDown(Key.VK_UP)) {
        // if (Mous.position.x > -600)
        {
            Mous.position.x = Mous.position.x + 10 * Math.cos(phi);
            Mous.position.z = Mous.position.z + 10 * Math.sin(phi);

            camera.position.x = Mous.position.x;
            camera.position.z = Mous.position.z;

        }

    }

    // движение назад
    if (Key.isDown(Key.VK_DOWN)) {
        //if (Mous.position.x < 450)
        {
            Mous.position.x = Mous.position.x - 20 * Math.cos(phi);
            Mous.position.z = Mous.position.z - 20 * Math.sin(phi);

            camera.position.x = Mous.position.x;
            camera.position.z = Mous.position.z;
        }

    }
    var a, b, delta_x, delta_z;
    var flag = false; // мыш не воткнулся в стену
    for (i = 0; i < 2 * visota + 1; i++) {
        for (j = 0; j < 4 * shirina + 1; j++) {
            if (labirint[i][j] > 0) {

                b = b0 - i * cub_length;
                a = a0 + j * cub_width;
                delta_x = Math.abs(Mous.position.x - a) - cub_width / 2;
                delta_z = Math.abs(Mous.position.z - b) - cub_length / 2;
                if ((delta_x < 10) && (delta_z < 10) && Math.floor(labirint[i][j]) == 1) {
                    flag = true;
                } // мыш воткнулся в стену
                if ((delta_x < 10) && (delta_z < 10) && labirint[i][j] == 2) {
                    end_game();
                } // мыш вышел из лабиринта				   
            }

        }
    }


    delta_x = Math.abs(Mous.position.x - blok.position.x);
    delta_z = Math.abs(Mous.position.z - blok.position.z);
    if ((delta_x < cub_width) && (delta_z < cub_length) && (kusok_syra.visible == true)) {
        flag = true;
    } // мыш воткнулся в блок	     

    if (flag) {
        Mous.position.x = x_previous;
        Mous.position.z = z_previous;
        camera.position.x = x_previous;
        camera.position.z = z_previous;
    }

}



function end_game()

{
    DHTMLSoundMute("span_sound_golos_za_kadrom");
    kusok_syra.visible = false;
    sound_play = true;
    sound_time = 0;
    DHTMLSound(soundpath + "mous_est_syr.mp3", "span_sound_game", "");

    setTimeout(
        function() {

            bitva_v_rasgare = false;
        }, 3000)

}




function AddLight() {
    light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 1, 0);
    scene.add(light);
}


function AddCamera() {

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(Mous_position_x + 700, Mous_position_y + 200, Mous_position_z + 1000);

}


function AddPol() {

    //создаем наш "пол". Это будет псевдокуб со сторонами в 600х600 и глубиной 5
    var material = new THREE.MeshBasicMaterial({
        color: 0x016001,
        opacity: 1
    });

    var pol = new THREE.Mesh(new THREE.BoxGeometry((4 * shirina + 1) * cub_width, (2 * visota + 1) * cub_length, 5), material);

    //устанавливаем позицию нашему полу
    pol.position.y = -84;
    pol.position.x = (4 * shirina) * cub_width / 2 + a0;
    pol.position.z = -(2 * visota) * cub_length / 2 + b0;
    //и разворачиваем его по оси х так, чтобы он был параллелен ей.
    pol.rotation.x = 90 * Math.PI / 180;
    //добавляем к сцене
    scene.add(pol);
}


function Add_menu() {
    pravila = new THREE.Mesh(
        new THREE.BoxGeometry(500, 500, 500),
        new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture('textures/pravila.png'),
            overdraw: true
        })
    );
    pravila.position.x = 0;
    pravila.position.y = 400;
    pravila.position.z = -500;
    pravila.rotation.y = Math.PI / 6;
    scene.add(pravila);
}


function AddSteni() {

    var directions = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
    var skyGeometry = new THREE.BoxGeometry(5000, 5000, 5000);

    var materialArray = [];
    for (var i = 0; i < 6; i++)
        materialArray.push(new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture("textures/dawnmountain-" + directions[i] + ".png"),
            side: THREE.BackSide
        }));
    var skyMaterial = new THREE.MeshFaceMaterial(materialArray);
    var skyBox = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(skyBox);
}



function Add_Mouse() {

    Mous = new THREE.Mesh(
        new THREE.BoxGeometry(20, 130, 20),
        new THREE.MeshBasicMaterial({
            color: Math.random() * 0xffffff,
            opacity: 1
        }));
    Mous.position.z = Mous_position_z;
    Mous.position.y = Mous_position_y;
    Mous.position.x = Mous_position_x;
    Mous.visible = false;
    scene.add(Mous);


    var zvet_mouse = 0xf2ddc6;
    Mikki_Mouse = new THREE.Object3D();
    var x0 = 120;
    // нога
    var material = new THREE.MeshBasicMaterial({
        color: zvet_mouse,
        opacity: 1
    });

    var radius_top = 3;
    var radius_bottom = 3;
    var heigth = 30;
    var osnovanie = 16;
    var cylinder1 = new THREE.Mesh(
        new THREE.CylinderGeometry(radius_top, radius_bottom, heigth, osnovanie), material);

    cylinder1.position.y = -141;
    cylinder1.position.x = -156 + x0;
    cylinder1.position.z = 20;
    //cylinder1.rotation.x = Math.PI/2;
    //добавляем к сцене
    Mikki_Mouse.add(cylinder1);

    // нога2
    var material = new THREE.MeshBasicMaterial({
        color: zvet_mouse,
        opacity: 1
    });

    var radius_top = 3;
    var radius_bottom = 3;
    var heigth = 30;
    var osnovanie = 16;
    var cylinder1 = new THREE.Mesh(
        new THREE.CylinderGeometry(radius_top, radius_bottom, heigth, osnovanie), material);

    cylinder1.position.y = -141;
    cylinder1.position.x = -156 + x0;
    cylinder1.position.z = -20;
    //cylinder1.rotation.x = Math.PI/2;
    //добавляем к сцене
    Mikki_Mouse.add(cylinder1);


    // нога3
    var material = new THREE.MeshBasicMaterial({
        color: zvet_mouse,
        opacity: 1
    });

    var radius_top = 3;
    var radius_bottom = 3;
    var heigth = 30;
    var osnovanie = 16;
    var cylinder1 = new THREE.Mesh(
        new THREE.CylinderGeometry(radius_top, radius_bottom, heigth, osnovanie), material);

    cylinder1.position.y = -141;
    cylinder1.position.x = -105 + x0;
    cylinder1.position.z = -20;
    //cylinder1.rotation.x = Math.PI/2;
    //добавляем к сцене
    Mikki_Mouse.add(cylinder1);

    // нога4
    var material = new THREE.MeshBasicMaterial({
        color: zvet_mouse,
        opacity: 1
    });

    var radius_top = 3;
    var radius_bottom = 3;
    var heigth = 30;
    var osnovanie = 16;
    var cylinder1 = new THREE.Mesh(
        new THREE.CylinderGeometry(radius_top, radius_bottom, heigth, osnovanie), material);

    cylinder1.position.y = -141;
    cylinder1.position.x = -105 + x0;
    cylinder1.position.z = 20;
    //cylinder1.rotation.x = Math.PI/2;
    //добавляем к сцене
    Mikki_Mouse.add(cylinder1);


    // хвост
    var material = new THREE.MeshBasicMaterial({
        color: zvet_mouse,
        opacity: 1
    });

    var radius_top = 3;
    var radius_bottom = 3;
    var heigth = 60;
    var osnovanie = 16;
    var cylinder1 = new THREE.Mesh(
        new THREE.CylinderGeometry(radius_top, radius_bottom, heigth, osnovanie), material);

    cylinder1.position.y = -132;
    cylinder1.position.x = -75 + x0;
    cylinder1.position.z = 0;
    cylinder1.rotation.z = Math.PI / 3;
    //добавляем к сцене
    Mikki_Mouse.add(cylinder1);


    //	задняя часть
    var material = new THREE.MeshBasicMaterial({
        color: zvet_mouse,
        opacity: 1
    });

    var radius = 22;
    var shar2 = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 50, 11), material);

    shar2.position.z = 0;
    shar2.position.x = -111 + x0;
    shar2.position.y = -119; // высота

    Mikki_Mouse.add(shar2);

    // глаз

    var material = new THREE.MeshLambertMaterial({
        color: 0x000000,
        opacity: 1
    });

    var radius = 5;
    shar = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 50, 11), material);

    shar.position.x = -169 + x0;
    shar.position.z = 16;
    shar.position.y = -106; // высота

    Mikki_Mouse.add(shar);

    var material = new THREE.MeshLambertMaterial({
        color: 0x000000,
        opacity: 1
    });

    var radius = 5;
    shar = new THREE.Mesh(new THREE.SphereGeometry(radius, 50, 11), material);

    shar.position.x = -169 + x0;
    shar.position.z = -16;
    shar.position.y = -106; // высота

    Mikki_Mouse.add(shar);

    // нос
    var material = new THREE.MeshBasicMaterial({
        color: zvet_mouse,
        opacity: 1
    });

    var radius_top = 1;
    var radius_bottom = 22;
    var heigth = 45;
    var osnovanie = 16;
    var cylinder1 = new THREE.Mesh(
        new THREE.CylinderGeometry(radius_top, radius_bottom, heigth, osnovanie), material);

    cylinder1.position.y = -119;
    cylinder1.position.x = -177 + x0;
    cylinder1.position.z = 0;
    cylinder1.rotation.z = Math.PI / 2;
    //cylinder1.rotation.y = -Math.PI/2;
    //добавляем к сцене
    Mikki_Mouse.add(cylinder1);

    // шарик на носу
    var material = new THREE.MeshLambertMaterial({
        color: 0x000000,
        opacity: 1
    });

    var radius = 5;
    shar = new THREE.Mesh(new THREE.SphereGeometry(radius, 50, 11), material);

    shar.position.x = -198 + x0;
    shar.position.z = 0;
    shar.position.y = -116; // высота

    Mikki_Mouse.add(shar);


    // уши 

    // ухо 1
    var material = new THREE.MeshBasicMaterial({
        color: 0x000000,
        opacity: 1
    });

    var radius_top = 15;
    var radius_bottom = 15;
    var heigth = 3;
    var osnovanie = 25;
    var cylinder2 = new THREE.Mesh(
        new THREE.CylinderGeometry(radius_top, radius_bottom, heigth, osnovanie), material);

    cylinder2.position.y = -98;
    cylinder2.position.x = -158 + x0;
    cylinder2.position.z = 20;
    cylinder2.rotation.z = Math.PI / 2;
    //добавляем к сцене
    Mikki_Mouse.add(cylinder2);

    // ухо 2
    var material = new THREE.MeshBasicMaterial({
        color: 0x000000,
        opacity: 1
    });

    var radius_top = 15;
    var radius_bottom = 15;
    var heigth = 3;
    var osnovanie = 25;
    var cylinder2 = new THREE.Mesh(
        new THREE.CylinderGeometry(radius_top, radius_bottom, heigth, osnovanie), material);

    cylinder2.position.y = -98;
    cylinder2.position.x = -158 + x0;
    cylinder2.position.z = -20;
    cylinder2.rotation.z = Math.PI / 2;
    //добавляем к сцене
    Mikki_Mouse.add(cylinder2);


    //туловище
    var material = new THREE.MeshBasicMaterial({
        color: zvet_mouse,
        opacity: 1
    });

    var radius_top = 22;
    var radius_bottom = 22;
    var heigth = 50;
    var osnovanie = 25;
    var cylinder2 = new THREE.Mesh(
        new THREE.CylinderGeometry(radius_top, radius_bottom, heigth, osnovanie), material);

    cylinder2.position.y = -119;
    cylinder2.position.x = -133 + x0;
    cylinder2.position.z = 0;
    cylinder2.rotation.z = Math.PI / 2;
    //добавляем к сцене
    Mikki_Mouse.add(cylinder2);


    // ус1
    var material = new THREE.MeshBasicMaterial({
        color: 0x000000,
        opacity: 1
    });

    var radius_top = 1;
    var radius_bottom = 1;
    var heigth = 80;
    var osnovanie = 16;
    var cylinder1 = new THREE.Mesh(
        new THREE.CylinderGeometry(radius_top, radius_bottom, heigth, osnovanie), material);

    cylinder1.position.y = -117;
    cylinder1.position.x = -188 + x0;
    cylinder1.position.z = -5;
    cylinder1.rotation.x = -Math.PI / 2.5;
    //добавляем к сцене
    Mikki_Mouse.add(cylinder1);


    // ус2
    var material = new THREE.MeshBasicMaterial({
        color: 0x000000,
        opacity: 1
    });

    var radius_top = 1;
    var radius_bottom = 1;
    var heigth = 80;
    var osnovanie = 16;
    var cylinder1 = new THREE.Mesh(
        new THREE.CylinderGeometry(radius_top, radius_bottom, heigth, osnovanie), material);

    cylinder1.position.y = -117;
    cylinder1.position.x = -188 + x0;
    cylinder1.position.z = -5;
    cylinder1.rotation.x = Math.PI / 2.5;
    //добавляем к сцене
    Mikki_Mouse.add(cylinder1);

    // ус3
    var material = new THREE.MeshBasicMaterial({
        color: 0x000000,
        opacity: 1
    });

    var radius_top = 1;
    var radius_bottom = 1;
    var heigth = 80;
    var osnovanie = 16;
    var cylinder1 = new THREE.Mesh(
        new THREE.CylinderGeometry(radius_top, radius_bottom, heigth, osnovanie), material);

    cylinder1.position.y = -117;
    cylinder1.position.x = -188 + x0;
    cylinder1.position.z = -5;
    cylinder1.rotation.x = Math.PI / 2;
    //добавляем к сцене
    Mikki_Mouse.add(cylinder1);




    Mikki_Mouse.position.set(Mous.position.x + 1500, Mous.position.y, Mous.position.z);

    //Mikki_Mouse.rotation.y = Math.PI;

    scene.add(Mikki_Mouse);

}



function Add_Orientir() {

    orientir = new THREE.Mesh(
        new THREE.BoxGeometry(100, 100, 100),
        new THREE.MeshBasicMaterial({
            color: Math.random() * 0xffffff,
            opacity: 1
        }));
    phi = -Math.PI / 2;
    orientir.position.x = radius_obsora * Math.cos(phi);
    orientir.position.z = radius_obsora * Math.sin(phi);
    orientir.position.y = Mous_position_y;
    orientir.visible = false;
    scene.add(orientir);
}



function Add_labirint() {
    display(maze(visota, shirina));
    var zvet;
    sound_play = true;
    sound_time = 0;
    var flag_stena, length_stena, i0, j0;
    var mirror_added = false;


    for (i = 0; i < 2 * visota + 1; i++) {
        length_stena = 0;
        flag_stena = false;
        for (j = 0; j < 4 * shirina + 1; j++) {
            if (labirint[i][j] == 1) {
                if (!flag_stena) {
                    flag_stena = true;
                    i0 = i;
                    j0 = j;
                }
                length_stena = length_stena + 1;
            }

            if ((labirint[i][j] != 1) || (j == 4 * shirina)) {



                if (flag_stena) {

                    k = getRandom(1, 7);
                    if (k == 1) {
                        zvet = 0x08457e;
                    }
                    if (k == 2) {
                        zvet = 0x08667e;
                    }
                    if (k == 3) {
                        zvet = 0x30d5c8;
                    }
                    if (k == 4) {
                        zvet = 0x6f30d5;
                    }
                    if (k == 5) {
                        zvet = 0x1a4780;
                    }
                    if (k == 6) {
                        zvet = 0x003153;
                    }
                    if (k == 7) {
                        zvet = 0x008cf0;
                    }


                    if (length_stena > 1) {

                        var cube = new THREE.Mesh(
                            new THREE.BoxGeometry(length_stena * cub_width, cub_height, cub_length),
                            new THREE.MeshBasicMaterial({
                                color: zvet,
                                opacity: 1
                            })); // color: Math.random() * 0xffffff


                        cube.position.z = b0 - i * cub_length;
                        cube.position.y = 0;
                        cube.position.x = a0 + j0 * cub_width + (length_stena - 1) * cub_width / 2;
                        scene.add(cube);
                        for (k = j0; k < j; k++) {
                            labirint[i][k] = 1.1;
                        }
                        if (j == 4 * shirina) {
                            labirint[i][j] = 1.1;
                        }
                    }

                    flag_stena = false;
                    length_stena = 0;

                }

            }

            if (labirint[i][j] == 2) { // сыр в конце туннеля
                var crateTexture = new THREE.ImageUtils.loadTexture('textures/syr.jpg');
                var crateMaterial = new THREE.MeshBasicMaterial({
                    map: crateTexture
                });
                kusok_syra = new THREE.Mesh(
                    new THREE.BoxGeometry(cub_width / 4, cub_height / 4, cub_length / 4),
                    crateMaterial); // color: Math.random() * 0xffffff
                kusok_syra.position.z = b0 - i * cub_length;
                kusok_syra.position.y = -60;
                kusok_syra.position.x = a0 + j * cub_width;
                kusok_syra.rotation.y = Math.PI / 4;
                scene.add(kusok_syra);


                // чтобы к сыру нельзя было подойти с улицы, добавим блок ))
                blok = new THREE.Mesh(
                    new THREE.BoxGeometry(cub_width, cub_height, cub_length),
                    new THREE.MeshBasicMaterial({
                        color: 0x000000,
                        opacity: 1
                    }));
                blok.position.z = b0 - (i) * cub_length;
                blok.position.y = 0;
                blok.position.x = a0 + (j + 1) * cub_width;
                blok.visible = false;
                scene.add(blok);


            }

        }
    }



    for (j = 0; j < 4 * shirina + 1; j++) {
        length_stena = 0;
        flag_stena = false;
        for (i = 0; i < 2 * visota + 1; i++) {
            if (labirint[i][j] == 1) {
                if (!flag_stena) {
                    flag_stena = true;
                    i0 = i;
                    j0 = j;
                }
                length_stena = length_stena + 1;
            }

            if ((labirint[i][j] != 1) || (i == 2 * visota)) {
                if (flag_stena) {

                    k = getRandom(1, 7);
                    if (k == 1) {
                        zvet = 0x08457e;
                    }
                    if (k == 2) {
                        zvet = 0x08667e;
                    }
                    if (k == 3) {
                        zvet = 0x30d5c8;
                    }
                    if (k == 4) {
                        zvet = 0x6f30d5;
                    }
                    if (k == 5) {
                        zvet = 0x1a4780;
                    }
                    if (k == 6) {
                        zvet = 0x003153;
                    }
                    if (k == 7) {
                        zvet = 0x008cf0;
                    }


                    var cube = new THREE.Mesh(
                        new THREE.BoxGeometry(cub_width, cub_height, length_stena * cub_length),
                        new THREE.MeshBasicMaterial({
                            color: zvet,
                            opacity: 1
                        })); // color: Math.random() * 0xffffff


                    cube.position.z = b0 - i0 * cub_length - (length_stena - 1) * cub_length / 2;
                    cube.position.y = 0;
                    cube.position.x = a0 + j * cub_width;
                    scene.add(cube);

                    flag_stena = false;
                    length_stena = 0;

                }

            }


        }
    }




}


function Add_labirint_old() {
    display(maze(visota, shirina));
    var zvet;
    sound_play = true;
    sound_time = 0;

    for (i = 0; i < 2 * visota + 1; i++) {
        for (j = 0; j < 4 * shirina + 1; j++) {
            if (labirint[i][j] == 1) {
                k = String(getRandom(1, 4));
                if (k == 1) {
                    zvet = 0x08457e;
                }
                if (k == 2) {
                    zvet = 0x08667e;
                }
                if (k == 3) {
                    zvet = 0x30d5c8;
                }
                if (k == 4) {
                    zvet = 0x6f30d5;
                }
                k = String(getRandom(1, 22));


                if (k == 22) {
                    var crateTexture = new THREE.ImageUtils.loadTexture('textures/kot' + 3 + '.jpg');
                    var crateMaterial = new THREE.MeshBasicMaterial({
                        map: crateTexture
                    });

                    var materials = [
                        //делаем каждую сторону своего цвета
                        crateMaterial, // правая сторона
                        new THREE.MeshBasicMaterial({
                            color: zvet
                        }), // левая сторона
                        new THREE.MeshBasicMaterial({
                            color: zvet
                        }), //верх
                        new THREE.MeshBasicMaterial({
                            color: zvet
                        }), // низ
                        new THREE.MeshBasicMaterial({
                            color: zvet
                        }), // лицевая сторона
                        new THREE.MeshBasicMaterial({
                            color: zvet
                        }) // задняя сторона
                    ];

                }

                if (k == 21) {
                    var crateTexture = new THREE.ImageUtils.loadTexture('textures/kot' + 5 + '.jpg');
                    var crateMaterial = new THREE.MeshBasicMaterial({
                        map: crateTexture
                    });

                    var materials = [
                        //делаем каждую сторону своего цвета
                        new THREE.MeshBasicMaterial({
                            color: zvet
                        }), // правая сторона
                        new THREE.MeshBasicMaterial({
                            color: zvet
                        }), // левая сторона
                        new THREE.MeshBasicMaterial({
                            color: zvet
                        }), //верх
                        new THREE.MeshBasicMaterial({
                            color: zvet
                        }), // низ
                        crateMaterial, // лицевая сторона
                        new THREE.MeshBasicMaterial({
                            color: zvet
                        }) // задняя сторона
                    ];

                }

                if (k == 20) {
                    var crateTexture = new THREE.ImageUtils.loadTexture('textures/kot' + 1 + '.jpg');
                    var crateMaterial = new THREE.MeshBasicMaterial({
                        map: crateTexture
                    });

                    var materials = [
                        //делаем каждую сторону своего цвета
                        new THREE.MeshBasicMaterial({
                            color: zvet
                        }), // правая сторона
                        new THREE.MeshBasicMaterial({
                            color: zvet
                        }), // левая сторона
                        new THREE.MeshBasicMaterial({
                            color: zvet
                        }), //верх
                        new THREE.MeshBasicMaterial({
                            color: zvet
                        }), // низ
                        new THREE.MeshBasicMaterial({
                            color: zvet
                        }), // лицевая сторона
                        crateMaterial // задняя сторона
                    ];

                }

                if (k >= 20) {
                    var cube = new THREE.Mesh(
                        new THREE.BoxGeometry(cub_width, cub_height, cub_length), new THREE.MeshFaceMaterial(materials));
                } else {
                    var cube = new THREE.Mesh(
                        new THREE.BoxGeometry(cub_width, cub_height, cub_length),
                        new THREE.MeshBasicMaterial({
                            color: zvet,
                            opacity: 1
                        })); // color: Math.random() * 0xffffff
                }

                cube.position.z = b0 - i * cub_length;
                cube.position.y = 0;
                cube.position.x = a0 + j * cub_width;
                scene.add(cube);


            }


            if (labirint[i][j] == 2) { // сыр в конце туннеля
                var crateTexture = new THREE.ImageUtils.loadTexture('textures/syr.jpg');
                var crateMaterial = new THREE.MeshBasicMaterial({
                    map: crateTexture
                });
                kusok_syra = new THREE.Mesh(
                    new THREE.BoxGeometry(cub_width / 4, cub_height / 4, cub_length / 4),
                    crateMaterial); // color: Math.random() * 0xffffff
                kusok_syra.position.z = b0 - i * cub_length;
                kusok_syra.position.y = -60;
                kusok_syra.position.x = a0 + j * cub_width;
                kusok_syra.rotation.y = Math.PI / 4;
                scene.add(kusok_syra);

                // чтобы к сыру нельзя было подойти с улицы, добавим блок ))
                blok = new THREE.Mesh(
                    new THREE.BoxGeometry(cub_width, cub_height, cub_length),
                    new THREE.MeshBasicMaterial({
                        color: 0x000000,
                        opacity: 1
                    }));
                blok.position.z = b0 - (i) * cub_length;
                blok.position.y = 0;
                blok.position.x = a0 + (j + 1) * cub_width;
                blok.visible = false;
                scene.add(blok);
            }

        }
    }
    // почему то в углу не хватает одного кубика. добавим ))
    var cube = new THREE.Mesh(
        new THREE.BoxGeometry(cub_width, cub_height, cub_length),
        new THREE.MeshBasicMaterial({
            color: zvet,
            opacity: 1
        })); // color: Math.random() * 0xffffff


    cube.position.z = b0 - 0 * cub_length;
    cube.position.y = 0;
    cube.position.x = a0 + (j - 1) * cub_width;
    scene.add(cube);
}




function DHTMLSound(surl, id, loop) {
    try {
        document.getElementById(id).innerHTML = "<audio src='" + surl + "' autoplay='autoplay' " + loop + "></audio>";
    } catch (exception) {}
}

function DHTMLSoundMute(id) {
    try {
        document.getElementById(id).innerHTML = "";
    } catch (exception) {}
}


function getRandom(min, max) { //  Случайное число между min и max
        return Math.floor(Math.random() * (max - min + 1)) + min;
}