const express = require('express');
const http = require('http');
const { hostname } = require('os');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);


// Defina a rota padrão para servir seu cliente
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/console.html');
});
app.get('/KJDCIA7899nm8u7N9yn987NO', (req, res) => {
  res.sendFile(__dirname + '/views/controle.html');
});
app.get('/getconfig', (req, res) => {
  // Simula a obtenção de dados no backend
  const dadosDoBackend = { mensagem: `http://${hostname()}:${PORT}/KJDCIA7899nm8u7N9yn987NO` };

  res.json(dadosDoBackend);
});
// Lógica de conexão Socket.IO
const pares = new Map();

io.on('connection', (socket) => {
  console.log('Novo cliente conectado');

  // Obtém o IP do cliente
  const ip = socket.handshake.address;
  console.log('ip ', ip);

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

    console.log(`Dispositivos ${socket.id} e ${outroSocket.id} emparelhados.`);
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
    console.log(`Cliente desconectado: ${socket.id}`);

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

// Inicie o servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor ouvindo na porta ${PORT}`);
});
