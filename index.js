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
    socketsReference.forEach(element => {
    })
    //exclui da lista
    let indice = socketsReference.indexOf(socket);
    if (indice !== -1) {
      socketsReference.splice(indice, 1);
    }
  });
  
});

// Inicie o servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor ouvindo na porta ${PORT}`);
});
