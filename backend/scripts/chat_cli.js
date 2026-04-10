const axios = require('axios');
const readline = require('readline');

const API_BASE_URL = process.env.CLI_API_URL || 'http://localhost:5000';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const ask = (question) =>
    new Promise((resolve) => rl.question(question, (answer) => resolve(answer.trim())));

async function login() {
    const email = await ask('Email: ');
    const password = await ask('Password: ');

    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
    });

    return {
        token: response.data.token,
        user: response.data.user,
    };
}

async function sendMessage(token, message) {
    const response = await axios.post(
        `${API_BASE_URL}/api/ai/ask`,
        { question: message },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    );

    return response.data.answer;
}

async function main() {
    console.log('Nextaro Terminal AI Chat');
    console.log('Type "exit" to quit.\n');

    try {
        const session = await login();
        console.log(`\nLogged in as ${session.user?.fullName || session.user?.email || 'user'}\n`);

        while (true) {
            const message = await ask('You: ');

            if (!message) {
                continue;
            }

            if (message.toLowerCase() === 'exit') {
                break;
            }

            try {
                console.log('AI: thinking...\n');
                const answer = await sendMessage(session.token, message);
                console.log(`AI:\n${answer}\n`);
            } catch (error) {
                if (error.response?.data) {
                    console.error('AI Error:', error.response.data.message || error.response.data.error || 'Request failed');
                } else {
                    console.error('AI Error:', error.message);
                }
                console.log('');
            }
        }
    } catch (error) {
        if (error.response?.data) {
            console.error('Login failed:', error.response.data.message || 'Request failed');
        } else {
            console.error('Login failed:', error.message);
        }
    } finally {
        rl.close();
    }
}

main();
