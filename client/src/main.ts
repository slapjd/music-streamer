import { createApp } from 'vue'
import App from './App.vue'

import './assets/layout.css'

createApp(App).mount('#app')

export async function login() {
    var res = await fetch('/api/auth/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({
            username: "testboi",
            password: "testpassword"
        })
    })

    if (res.ok) alert("LOGIN SUCCESS")
    else alert("LOGIN FAIL")
}

export async function logout() {
    var res = await fetch('/api/auth/', {
        method: 'DELETE'
    })

    if (res.ok) alert("LOGOUT SUCCESS")
    else alert("LOGOUT FAIL")
}

window.onload = function() {
    document.getElementById("loginButton").onclick = login
    document.getElementById("logoutButton").onclick = logout
}