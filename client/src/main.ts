import { createApp } from 'vue'
import App from './App.vue'

import './assets/main.css'

createApp(App).mount('#app')

async function login() {
    var test = await fetch('/api/auth/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({
            username: "testboi",
            password: "testpassword"
        })
    })

    alert(await test.json())
}

login()