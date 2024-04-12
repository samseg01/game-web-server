const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const io = socketIO(server)

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/console.html');
});
app.get('/admin', (req, res) => {
  res.sendFile(__dirname + '/public/admin.html');
})

app.get('/134013dj8njin30dsnk33', (req,res) => {
  res.send(geraArrayResposta(socketsReference)).json;
})

let boo = false;
let UID;

app.use(bodyParser.json());
app.post('/config', (req, res) => {
  UID = req.body.mensagem_front;
  boo = true;

  console.log('>>> GAME_CONSOLE LIGADO!!!');
  res.send({mensagem_back : `http://${req.headers.host}/KJDCIA7899nm8u7N9yn987NO&${UID}`});
});
let i=1;

setInterval(() =>{
  if(boo==true){
    app.get(`/KJDCIA7899nm8u7N9yn987NO&${UID}`, (req, res) => {
      //uuUID vindo do link aberto na tela 1
      UID = parseInt(req.url.split('&')[1]);
      res.sendFile(__dirname + '/public/controle.html');
    });
  }
}, 1000);

function geraArrayResposta(reference){
  let saida = []
  reference.forEach(element => {
    let space1 = Array.from(element[0]);
    let space2 = element[1];

    let array = [space1, space2];
    saida.push(array);
  })
  return saida;
}

let socketsReference = [];

io.on('connection', (socket) => {
  console.log(`>>> Novo cliente conectado | socket id: ${socket.id} | UID: ${UID}`);

  let socketIdTela = {'socket' : socket ,'UID' : UID};
                  //[SmI9vUmNBZ-6_qAGAAAD, 18499632]
                  //{'socket' : SmI9vUmNBZ-6_qAGAAAD, 'UID' : 18499632}

  //verifica se o UID do socket da sessão já é referente a uma sala já existente
  //se for referente a uma sala existete, adiciona o socket a sala
  //se não for referente, determina que a sala não existe, assim cria a sala com o UID do socket da sessão e adiciona o socket
  if(socketsReference.length === 0){
    let sala = criaSala();
    console.log('>>> sala criada:', sala);
    adicionaUsuario(socketIdTela, sala);
    //======> PRIMEIRA POSIÇÃO DO ARRAY PREENCHIDA
  }else if(socketsReference.length > 0){
    if(verificaSalaUIDexistente(socketsReference, socketIdTela.UID) === true){
      adicionaUsuario(socketIdTela,'');
    }else if(verificaSalaUIDexistente(socketsReference, socketIdTela.UID) === false){
      let sala = criaSala();
      console.log('> sala criada:', sala);
      adicionaUsuario(socketIdTela, sala);
    }                
  }

  function verificaSalaUIDexistente(reference, socketUID){
    //[ Set(2) { 'SmI9vUmNBZ-6_qAGAAAD', '148442-BR01' }, 18499632 ]
    for(let i=0; i<reference.length; i++){
      let element = reference[i];
      if(element[1] === socketUID){
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
    if(salaCriada === null || salaCriada === ""){
      //verifica se ha uma sala com UID ja existente
      socketsReference.forEach(element =>{
      //[ Set(2) { 'SmI9vUmNBZ-6_qAGAAAD', '148442-BR01' }, 18499632 ]
        if(element[1] === socketO.UID){
          let array = Array.from(element[0]);
          let sala = array[1];
          //socketO[0] === socket
          //socketO[1] === UID
          socketO.socket.join(sala);

          console.log('[ALERT] > Já existe uma sala com esse UID');        
          console.log(`> Usuario adicionado a sala - ${sala} :`,socket.id);
          let socketArray = [socket.rooms, socketO.UID];
          socketsReference.push(socketArray);
          console.log('[OK] > SALA FECHADA COM DOIS DISPOSITIVOS');
        }
      })
    }else{
      socketO.socket.join(salaCriada);

      console.log(`> Usuario adicionado a sala - ${salaCriada} :`,socket.id);
      let socketArray = [socket.rooms, socketIdTela.UID];
      socketsReference.push(socketArray);

    }
  }
  console.table(socketsReference)

  // Lógica para lidar com eventos do cliente
  socket.on('mensagem', (mensagem) => {
    console.log(mensagem)
    console.log(socketIdTela.socket.id, socketIdTela.socket.rooms, socketIdTela.UID)
    id = socket.id;

    let room
    let roomArray
    let idSocket

    //socketsReference
    //[ Set(2) { 'SmI9vUmNBZ-6_qAGAAAD', '148442-BR01' }, 18499632 ]
    socketsReference.forEach(element => {
      room = element[0];
      roomArray = Array.from(room);
      idSocket = roomArray[0];

      if(socket.id == idSocket){
        console.log(`>>> Mensagem recebida de ${id} que pertence a sala ${roomArray[1]}: ${mensagem}`);
        let sala = roomArray[1];
        io.to(sala).emit('mensagem', mensagem);
      }
    })
  });

  socket.on('disconnect', () => {
    console.log(`>>> Cliente desconectado: ${socket.id}`);
    let indice;
    for(let i=0; i<socketsReference.length; i++){
      // indice = socketsReference.indexOf(socket);
      let linha = socketsReference[i]
      let primeiroSpace = Array.from(linha[0]);
      sockeId = primeiroSpace[0];
      if(sockeId === socket.id){
        indice = socketsReference[i];
        break;
      }
    }
    //exclui da lista
    if (indice !== -1) {
      socketsReference.splice(indice, 1);
      console.table(socketsReference)
      if(socketsReference.length === 0){
        console.log('> não há clients logados.');
      }
    }
  });
  
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor ouvindo na porta ${PORT}`);
});
