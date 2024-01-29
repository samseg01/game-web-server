const express = require('express');
const http = require('http');
const { hostname } = require('os');
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
  id = req.body.mensagem_front

  console.log('>> id: ',id);
  console.log(['host: '+req.headers.host, 'protocolo: '+req.protocol, 'ip: '+req.ip, 'ips: '+req.ips]);

  getPage2(id);
  res.send({mensagem_back : `http://${req.headers.host}/KJDCIA7899nm8u7N9yn987NO&id=${req.body.mensagem_front}`});
});

function getPage2(){
  app.get(`/KJDCIA7899nm8u7N9yn987NO&id=${id}`, (req, res) => {
    res.sendFile(__dirname + '/views/controle.html');
    connection(id);
  });
}

  // const dispositivos = new Map();
async function connection(ID){

  const pares = new Map();

  io.on('connection', (socket) => {
    console.log('>>> Novo cliente conectado | socket id: ',socket.id, ' | UID: ', ID);
    // Obtém o IP do cliente
    const ip = socket.handshake.address;
    //console.log('ip ', ip, typeof(ip));

    // Adicione o socket à lista de espera
    const socketsEmEspera = Array.from(io.sockets.sockets.values())
      .filter((s) => s !== socket && !pares.has(s.id) && s.handshake.address === ip);

    if (socketsEmEspera.length > 0) {
      // Encontre um par disponível e emparelhe
      const outroSocket = socketsEmEspera[Math.floor(Math.random() * socketsEmEspera.length)];
      pares.set(socket.id, outroSocket.id);
      pares.set(outroSocket.id, socket.id);

      // Informe ambos os lados do emparelhamento
      io.to(socket.id).emit('pareamento', { parceiro: outroSocket.id });
      io.to(outroSocket.id).emit('pareamento', { parceiro: socket.id });

      console.log(`>>> Dispositivos ${socket.id} e ${outroSocket.id} emparelhados.`);
    } else {
      // Não há dispositivos suficientes para emparelhamento, aguarde
      console.log(`Aguardando mais dispositivos para emparelhamento: ${socket.id}`);
    }

    // Lógica para lidar com eventos do cliente
    socket.on('mensagem', (mensagem) => {
      console.log(`Mensagem recebida de ${socket.id}: ${mensagem}`);

      // Enviar a mensagem de volta para o parceiro
      const parceiroId = pares.get(socket.id);
      io.to(parceiroId).emit('mensagem', mensagem);
    });

    // Lidar com desconexões
    socket.on('disconnect', () => {
      console.log(`>>> Cliente desconectado: ${socket.id}`);

      // Remova o par do mapa
      const parceiroId = pares.get(socket.id);
      if (parceiroId) {
        pares.delete(socket.id);
        pares.delete(parceiroId);

        // Informe o parceiro sobre a desconexão
        io.to(parceiroId).emit('desconectar');
        console.log(`Dispositivos ${socket.id} e ${parceiroId} desconectados.`);
      }
    });
  });
}


// Inicie o servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor ouvindo na porta ${PORT}`);
});
