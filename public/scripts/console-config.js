const body = document.querySelector('body')
const btn = document.getElementById('theme')
const computador = document.querySelector('.computador')

setInterval(()=>{
    let tamanhoH = getComputedStyle(computador).height.split('p')
    let tamanhoW = getComputedStyle(computador).width.split('p')
    if(tamanhoW[0] !== (tamanhoH[0])*1.26){
        computador.style.width = `${tamanhoH[0]*1.26}px`
    }
}, 100)

btn.addEventListener('click', ()=>{
    console.log(window.getComputedStyle(body).getPropertyValue("background-color"))
    if(window.getComputedStyle(body).getPropertyValue("background-color") == 'rgb(0, 0, 0)'){
        body.style.backgroundColor = 'white'
        btn.style.backgroundImage = "url('/styles/lamp.svg')"
        btn.style.border = '2px solid black';
        computador.style.border = '7px solid black';
    }else {
        btn.style.backgroundImage = "url('/styles/lamp-apagada.svg')"
        body.style.backgroundColor = 'black'
        btn.style.border = '2px solid white';
        computador.style.border = 'none';
    }
})

const btnOpen = document.getElementById('play')
btnOpen.addEventListener('click', ()=>{
    document.getElementById('down-icon').style.display = 'none'
    computador.style.display = 'flex';
    btnOpen.style.display = 'none';
    document.querySelector('.qr-code').style.animation = 'aparece 1s linear';
    setTimeout(()=>{
        animateText(0)
    }, 1500)
})

const text = document.getElementById('text');
const textContent = text.innerHTML;
text.innerHTML = '';

// Função para adicionar letras gradualmente
function animateText(index) {
    if (index < textContent.length) {
        text.innerHTML += textContent.charAt(index); // Adiciona a próxima letra
        index++;
        setTimeout(() => animateText(index), 100); // Chama recursivamente após um intervalo de tempo
    }
}

//adicionar cash se for reiniciado e não perder o valor do id e voltar pra array
let random_ID = parseInt(Math.random() * 100000000);
async function link(){
    console.log(random_ID);

    const response = await fetch('/config', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({mensagem_front : random_ID}),
    });
    const result = await response.json();
    console.log("Success:", result.mensagem_back);
    return result.mensagem_back;
}

const code = document.getElementById("qr-code");

async function gerarQRCode() {
    var textoParaQRCode = await link();
    var qrcode = new QRCode(code, {
        text: textoParaQRCode,
        width: 140,
        height: 140
    });
}
gerarQRCode();

const socket = io();

// Lidar com mensagens recebidas do servidor
const canvas = document.getElementById('canvas')
let direction = ""

socket.on('mensagem', (mensagem) => {
    let msg = mensagem;
    console.log(msg)
    if(msg == "conectado"){
        code.style.display = 'none'
        canvas.style.display = 'block';
    }
    if(msg=='esquerda'){
        direction=msg;
    }else if(msg=='direita'){
        direction=msg;
    }else if(msg=='cima'){
        direction=msg;
    }else if(msg=='baixo'){
        direction=msg;
    }
});

const ctx = canvas.getContext("2d");
const tamanho = 30
let cobra = [
    {x : 300, y : 300},
    {x : 330, y : 300},
]
let contadorComida = 0
let timeLoop = 300
let comida = {
    x : random(),
    y : random(),
    color:"green"
}
function random(){
    let numeroAleatorio = Math.round(Math.random() * ((canvas.width - tamanho)-0) + 0)
    return Math.round(numeroAleatorio / 30) *30
}

function drawComida(){
    let {x, y, color} = comida

    ctx.shadowColor = color
    ctx.shadowBlur = 6
    ctx.fillStyle = color
    ctx.fillRect(x, y, tamanho, tamanho)
    ctx.shadowBlur = 0
}

function draw(){
    ctx.fillStyle = "#ddd"
    // ctx.fillRect(cobra[0].x, cobra[0].y, tamanho, tamanho)

    cobra.forEach((e, i) => {
        if(i== cobra.length-1){
            ctx.fillStyle = "red"
        }
        ctx.fillRect(e.x, e.y, tamanho, tamanho)
    })
}

function drawGrid(){
    ctx.lineWidth = 1
    ctx.strokeStyle = "rgb(56, 56, 56)"


    for(let i = 30; i< canvas.width; i+=30){
        ctx.beginPath()
        ctx.lineTo(i, 0)
        ctx.lineTo(i, 600)
        ctx.stroke()

        ctx.beginPath()
        ctx.lineTo(0, i)
        ctx.lineTo(600, i)
        ctx.stroke()
    }
}

function moverCobra(){
    if(!direction) return
    const head = cobra[cobra.length-1]
    cobra.shift()

    if(direction == "direita"){
        cobra.push({ x : head.x + tamanho, y : head.y})
    }
    if(direction == "esquerda"){
        cobra.push({ x : head.x - tamanho, y : head.y})
    }
    if(direction == "cima"){
        cobra.push({ x : head.x, y : head.y - tamanho})
    }
    if(direction == "baixo"){
        cobra.push({ x : head.x, y : head.y + tamanho})
    }
}

function comeu(){
    const head = cobra[cobra.length-1]

    if(head.x == comida.x && head.y == comida.y){
        cobra.push(head)

        let x = random()
        let y = random()

        while(cobra.find((position) => position.x == x && position.y == y)){
            x = random()
            y = random()
        }
        contadorComida++
        comida.x = x
        comida.y = y
        comida.color = 'green'   

        console.log(contadorComida)     
        if(contadorComida%3==0){
            timeLoop = timeLoop-20
            console.log('timeLoop', timeLoop)
        }
    }
}

function colision(){
    const head = cobra[cobra.length-1]
    const canvasLimit = canvas.width

    const parede = head.x < 0 ||head.x > canvasLimit-30 || head.y < 0 || head.y > canvasLimit-30
    const selfColision = cobra.find((position, i) => {
        return i < cobra.length -2 && position.x == head.x && position.y == head.y
    })
    if(parede || selfColision){
        direction = undefined;
        document.getElementById('play-over').style.display = 'block'
        timeLoop = 300
    }
}

let loopId
function loop(tL){
    clearInterval(loopId)
    ctx.clearRect(0, 0, 600, 600)
    drawGrid()
    drawComida()
    draw()
    colision()
    moverCobra()
    comeu()

    loopId = setTimeout(() => {
        loop(timeLoop)
    }, tL)
}

loop(timeLoop)

document.getElementById('play-over').addEventListener('click', ()=>{
    cobra = [
        {x : 300, y : 300},
        {x : 330, y : 300},
    ]
    document.getElementById('play-over').style.display = 'none'
})