const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let targetNumber = Math.floor(Math.random() * 100) + 1; // Загаданное число
let guesses = []; // История всех попыток

const broadcast = (message) => {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
};

wss.on('connection', (ws) => {
    console.log('A new player has connected');

    // Отправить текущую историю и уведомление о подключении
    ws.send(JSON.stringify({ type: 'update-history', guesses }));

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'guess') {
            const guess = data.guess;
            const difference = Math.abs(guess - targetNumber);

            guesses.push({ number: guess, difference });

            if (guess === targetNumber) {
                broadcast({ type: 'winner', guess });
            } else {
                broadcast({ type: 'update-history', guesses });
            }
        }

        if (data.type === 'reset') {
            targetNumber = Math.floor(Math.random() * 100) + 1; // Генерируем новое число
            guesses = []; // Очищаем историю
            broadcast({ type: 'reset', message: 'Game has been reset!' });
        }
    });

    ws.on('close', () => {
        console.log('A player has disconnected');
    });
});

console.log('WebSocket server is running on ws://localhost:8080');
