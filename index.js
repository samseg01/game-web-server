const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/console.html');
});

let boo = false;
let UID;

app.use(bodyParser.json());
app.post('/config', (req, res) => {
  UID = req.body.mensagem_front;
  boo = true;

  console.log('>>>> GAME_CONSOLE LIGADO!!!');
  res.send({mensagem_back : `http://${req.headers.host}/KJDCIA7899nm8u7N9yn987NO&${UID}`});
});
let i=1;

setInterval(() =>{
  if(boo==true){
    app.get(`/KJDCIA7899nm8u7N9yn987NO&${UID}`, (req, res) => {
      console.log('>>>>>>>>>>>> REQ', req.url);
      //uuUID vindo do link aberto na tela 1
      UID = parseInt(req.url.split('&')[1]);
      res.sendFile(__dirname + '/views/controle.html');
    });
  }
}, 1000);

let sala_cont = 0;
let sala;
let socketsReference = [];

io.on('connection', (socket) => {
  console.log('>>> Novo cliente conectado | socket id: ',socket.id, ' | UID: ', UID);

  let socketIdTela = [socket, UID];
                  //[SmI9vUmNBZ-6_qAGAAAD, 18499632]

  //verifica se o UID do socket da sessão já é referente a uma sala já existente
  //se for referente a uma sala existete, adiciona o socket a sala
  //se não for referente, determina que a sala não existe, assim cria a sala com o UID do socket da sessão e adiciona o socket
  if(socketsReference.length === 0){
    let sala = criaSala();
    console.log('>>> sala criada:', sala);
    adicionaUsuario(socketIdTela, sala);
    //======> PRIMEIRA POSIÇÃO DO ARRAY PREENCHIDA
  }else if(socketsReference.length > 0){
    if(verificaSalaUIDexistente(socketsReference, socketIdTela) === true){
      adicionaUsuario(socketIdTela,'');
    }else if(verificaSalaUIDexistente(socketsReference, socketIdTela) === false){
      let sala = criaSala();
      console.log('>>> sala criada:', sala);
      adicionaUsuario(socketIdTela, sala);
    }                
  }

  function verificaSalaUIDexistente(reference, socketUID){
    //[ Set(2) { 'SmI9vUmNBZ-6_qAGAAAD', '148442-BR01' }, 18499632 ]

    for(let i=0; i<reference.length; i++){
      let element = reference[i];
      if(element[1] === socketUID[1]){
        return true
      }
    }
    return false
  }
  function criaSala(){
    let salaString = String(parseInt(Math.random() * 1000000));
    return salaString+'-BR01';
  }  
  function adicionaUsuario(socketO, salaCriada){
    console.log(socketIO[1], salaCriada);
    if(salaCriada === null || salaCriada === ""){
      //verifica se ha uma sala com UID ja existente
      socketsReference.forEach(element =>{
      //[ Set(2) { 'SmI9vUmNBZ-6_qAGAAAD', '148442-BR01' }, 18499632 ]
        if(element[1] === socketO[1]){
            
          let array = Array.from(element[0]);
          let sala = array[1];
          //socketO[0] === socket
          //socketO[1] === UID
          socketO[0].join(sala);

          console.log('Já existe uma sala com esse UID');        
          console.log(`>>> Usuario adicionado a sala - ${sala} :`,socket.id);
          let socketArray = [socket.rooms, socketO[1]];
          socketsReference.push(socketArray);
          console.log('[OK] > SALA FECHADA COM DOIS DISPOSITIVOS');
        }
      })
    }else{
      socketO[0].join(salaCriada);

      console.log(`>>> Usuario adicionado a sala - ${salaCriada} :`,socket.id);
      let socketArray = [socket.rooms, socketIdTela[1]];
      socketsReference.push(socketArray);

    }
  }


  // Lógica para lidar com eventos do cliente
  socket.on('mensagem', (mensagem) => {
    id = socket.id;

    let room
    let roomArray
    let idSocket
    //socketsReference
    //[ Set(2) { 'SmI9vUmNBZ-6_qAGAAAD', '148442-BR01' }, 18499632 ]
    socketsReference.forEach(e => {
      room = e[0];
      roomArray = Array.from(room);
      idSocket = roomArray[0];
      if(socket.id == idSocket[0]){
        console.log(`>>> Mensagem recebida de ${id} que pertence a sala ${roomArray[1]}: ${mensagem}`);
      }
    })
    let enviado = false;
    socketsReference.forEach(element =>{
      let sala = roomArray[1];

      // if(array.includes(id)){
        //para mandar apenas uma vez a mensagem
        if(enviado === false){
          io.to(sala).emit('mensagem', mensagem);
          enviado = true;
        }
      // }

    })
  });

  socket.on('disconnect', () => {
    console.log(`>>> Cliente desconectado: ${socket.id}`);
    socketsReference.forEach(element => {
    })
    //exclui da lista
    let indice = socketsReference.indexOf(socket);
    if (indice !== -1) {
      socketsReference.splice(indice, 1);
    }
  });
  if(socketsReference.length === 0){
    console.log('> não há clients logados.');
  }
});
// }

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor ouvindo na porta ${PORT}`);
});
