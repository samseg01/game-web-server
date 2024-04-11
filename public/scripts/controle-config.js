function tamanho(){
    const controle = document.querySelector('.controle');
    let altura = getComputedStyle(controle).height.split('p')[0];
    let largura = getComputedStyle(controle).width.split('p')[0];
    
    if(parseInt(largura) !== parseInt(2*altura)){
        controle.style.height = (parseInt(largura/2))+'px';
    }
    
}
setInterval(tamanho, 100);

const socket = io();

window.addEventListener('load', function() {
    socket.emit('mensagem', 'conectado');
});
// Enviar uma mensagem para o servido
// Lidar com mensagens recebidas do servidor
socket.on('mensagem', (mensagem) => {
// console.log('Mensagem do servidor:', mensagem);
});


document.getElementById('esquerda').addEventListener('click', () =>{
    socket.emit('mensagem', 'esquerda');
})
document.getElementById('direita').addEventListener('click', () =>{
    socket.emit('mensagem', 'direita');
})
document.getElementById('cima').addEventListener('click', () =>{
    socket.emit('mensagem', 'cima');
})
document.getElementById('baixo').addEventListener('click', () =>{
    socket.emit('mensagem', 'baixo');
})