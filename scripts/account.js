function signup(form) {
    if (!form.checkValidity()) return false;

    fetch('/api/account/create', {
        method: 'POST',
        body: new FormData(form),
    })
        .then(res => res.json())
        .then(json => {
            if (json.created) {
                alert('Account created, you can now login.');
                isLoggedIn();
            } else alert('Account not created. Username may already be used.');
        });

    return false;
}

function login(form) {
    if (!form.checkValidity()) return false;

    fetch('/api/account/login', {
        method: 'POST',
        body: new FormData(form),
    })
        .then(res => res.json())
        .then(json => {
            if (json.token) {
                window.localStorage.setItem('token', json.token);
                form.elements['username'].classList.remove('is-invalid');
                form.elements['password'].classList.remove('is-invalid');
                form.elements['username'].classList.add('is-valid');
                form.elements['password'].classList.add('is-valid');
                isLoggedIn();
            } else {
                form.elements['username'].classList.remove('is-valid');
                form.elements['password'].classList.remove('is-valid');
                form.elements['username'].classList.add('is-invalid');
                form.elements['password'].classList.add('is-invalid');
            }
        });

    return false;
}

function authenticatedFetch(url, method = 'GET', body = undefined) {
    const token = window.localStorage.getItem('token');
    if (token === null) return new Promise((_, r) => r(403));

    return fetch(url, {
        method: method,
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: body,
    })
        .then(res => {
            if (res.status === 200) {
                return res.json();
            } else {
                throw res.status;
            }
        });
}

function validate() {
    authenticatedFetch('/api/account/validate')
        .then(json => {
            if (json.valid) alert('Your token is valid!');
        })
        .catch(status => {
            alert(status);
        });

    return false;
}

function list() {
    authenticatedFetch('/api/account/list')
        .then(json => {
            console.log(json);
        })
        .catch(status => {
            alert(status);
        });

    return false;
}

function isLoggedIn() {
    authenticatedFetch('/api/account/validate')
        .then(json => {
            if (json.valid) {
                const token = window.localStorage.getItem('token');
                const payload = JSON.parse(atob(token.split('.')[1]));
                document.getElementById('logInStatus').innerText = "Logged in as " + payload.username;
            }
        });
}

window.addEventListener('load', isLoggedIn);

// Example starter JavaScript for disabling form submissions if there are invalid fields
(function () {
    'use strict'

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation');

    // Loop over them and prevent submission
    Array.prototype.slice.call(forms)
        .forEach(function (form) {
            form.addEventListener('submit', function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                }

                form.classList.add('was-validated');
            }, false);
        });
})();
