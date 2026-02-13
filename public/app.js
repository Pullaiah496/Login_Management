// Frontend logic for register/login using fetch
document.addEventListener('DOMContentLoaded', () => {
  const regForm = document.getElementById('regForm')
  if (regForm) {
    regForm.addEventListener('submit', (e) => {
      e.preventDefault()
      const form = document.getElementById('regForm')
      const fd = new FormData(form)

      fetch('/register', {
        method: 'POST',
        body: fd
      })
      .then(r => r.json())
      .then(data => {
        document.getElementById('msg').innerText = data.message
        if (data.success) {
          setTimeout(()=> window.location.href = 'index.html', 800)
        }
      })
      .catch(err => document.getElementById('msg').innerText = 'Network error')
    })
  }

  const loginBtn = document.getElementById('loginBtn')
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      const u = document.getElementById('login-username').value
      const p = document.getElementById('login-password').value

      const body = new URLSearchParams()
      body.append('username', u)
      body.append('password', p)

      fetch('/login', {
        method: 'POST',
        headers: {'Content-Type':'application/x-www-form-urlencoded'},
        body: body
      })
      .then(r => r.json())
      .then(data => {
        document.getElementById('msg').innerText = data.message
        if (data.success) {
          // save username and photo to localStorage to show on dashboard
          localStorage.setItem('username', data.username)
          localStorage.setItem('photo', data.photo)
          setTimeout(()=> window.location.href = 'dashboard.html', 700)
        }
      })
      .catch(err => document.getElementById('msg').innerText = 'Network error')
    })
  }
})