
const axios = require('axios');
require('dotenv').config();

const emailArg = process.argv[2];
const passwordArg = process.argv[3];
const email = emailArg || process.env.TEST_LOGIN_EMAIL || 'test@example.com';
const password = passwordArg || process.env.TEST_LOGIN_PASSWORD || 'password123';

async function testLogin() {
    try {
        if (email === 'test@example.com' && password === 'password123') {
            console.log('Using default sample credentials. Pass email/password as args or set TEST_LOGIN_EMAIL and TEST_LOGIN_PASSWORD.');
        }

        const response = await axios.post('http://localhost:5000/api/auth/login', {
            email,
            password
        });
        console.log('Login Successful:', response.data);
    } catch (error) {
        if (error.response) {
            console.error('Login Failed:', error.response.data);
        } else {
            console.error('Login Error:', error.message);
        }
    }
}

testLogin();
