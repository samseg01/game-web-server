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

app.use(bodyParser.json());

let id;

app.post('/config', (req, res) => {
  id = req.body.mensagem_front;

  console.log('>>>> GAME_CONSOLE LIGADO!!!');
  console.log('>> id: ',id, " | ", typeof(id));
  console.log(['host: '+ req.headers.host, 'protocolo: '+ req.protocol, 'ip: '+ req.ip, 'ips: '+ req.ips]);

  res.send({mensagem_back : `http://${req.headers.host}/KJDCIA7899nm8u7N9yn987NO`});

});

app.get(`/KJDCIA7899nm8u7N9yn987NO`, (req, res) => {
  res.sendFile(__dirname + '/views/controle.html');
});

const pares = new Map();

let sala_cont = 0;
let sala;
let socketsReference = [];

io.on('connection', (socket) => {
  console.log('>>> Novo cliente conectado | socket id: ',socket.id, ' | UID: ', id);


  function criaSala(){
    let salaString = String(parseInt(Math.random() * 1000000));
    return salaString;
  }

  if(sala_cont === 0){
    sala = criaSala();
    console.log('>>> sala criada:', sala)
  }
  if(sala_cont < 2){
    socket.join(sala);
    console.log(`>>> Usuario adicionado a sala - ${sala} :`,socket.id);
    socketsReference.push(socket);
    
    sala_cont = sala_cont+1;
  }

  if(sala_cont === 2){
    sala_cont=0;
    console.log(`> SALA ${sala} FECHADA!!! - CONTEM DOIS DISPOSITIVOS`);
  }

  // Lógica para lidar com eventos do cliente
  socket.on('mensagem', (mensagem) => {
    id = socket.id;

    socketsReference.forEach(element =>{
      let array = Array.from(element.rooms);
      let sala = array[1];
      if(socket.id == array[0]){
        console.log(`>>> Mensagem recebida de ${id} que pertence a sala ${sala}: ${mensagem}`);
      }
    })

      let enviado = false;
      socketsReference.forEach(element =>{
        let array = Array.from(element.rooms);
        let sala = array[1];

        if(array.includes(id)){
          //para mandar apenas uma vez a mensagem
          if(enviado === false){
            io.to(sala).emit('mensagem', mensagem);
            enviado = true;
          }
        }

      })
  });

  socket.on('disconnect', () => {
    console.log(`>>> Cliente desconectado: ${socket.id}`);
    console.log(socketsReference.length);
    socketsReference.forEach(element => {
    })
    //exclui da lista
    let indice = socketsReference.indexOf(socket);
    if (indice !== -1) {
      socketsReference.splice(indice, 1);
    }
  });

  // io.to(socket.id).emit('pareamento', { parceiro: outroSocket.id });
  // io.to(outroSocket.id).emit('pareamento', { parceiro: socket.id });
  

  // const ip = socket.handshake.address;

  // // Adicione o socket à lista de espera
  // const socketsEmEspera = Array.from(io.sockets.sockets.values())
  //   .filter((s) => s !== socket && !pares.has(s.id) && s.handshake.address === ip);

  // if (socketsEmEspera.length > 0) {
  //   // Encontre um par disponível e emparelhe
  //   const outroSocket = socketsEmEspera[Math.floor(Math.random() * socketsEmEspera.length)];
  //   pares.set(socket.id, outroSocket.id);
  //   pares.set(outroSocket.id, socket.id);

    // Informe ambos os lados do emparelhamento


    // console.log(`> Dispositivos ${socket.id} e ${outroSocket.id} emparelhados.`);
  // } else {
  //   // Não há dispositivos suficientes para emparelhamento, aguarde
  //   console.log(`Aguardando mais dispositivos para emparelhamento: ${socket.id}...`);
  // }

  

  // // Lidar com desconexões
  
});

// Inicie o servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor ouvindo na porta ${PORT}`);
});
