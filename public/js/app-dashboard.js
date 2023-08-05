const jwt = localStorage.getItem('jwt');
let tokenData;

if (jwt) {
    try {
        const base64Url = jwt.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        tokenData = JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Invalid JWT');
    }
}

const form = document.getElementById('sensei-forms');

if (tokenData && tokenData.account === 'sensei') {
    form.style.display = 'block';
} else {
    form.style.display = 'none';
}

window.onload = async function () {
    const jwt = JSON.parse(atob(localStorage.getItem('jwt').split('.')[1]));
    if (jwt.account === "sensei") {
        document.getElementById("uploadForm").style.display = "block";
    }

    const response = await fetch('/api/admin/files', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('jwt')
        }
    });

    if (response.ok) {
        const files = await response.json();
        const fileList = document.getElementById('fileList');
        files.forEach(file => {
            const listItem = document.createElement('li');
            listItem.textContent = '/uploads/' + file;
            fileList.appendChild(listItem);
        });
    }
}

const executeForm = document.getElementById('executeForm');

executeForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const filePath = document.getElementById('filePath').value;

    const response = await fetch('/api/admin/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        },
        body: JSON.stringify({ filePath })
    });

    const data = await response.json();

    if (response.ok) {
        alert('Script executed successfully.');
    } else {
        alert('Failed to execute script: ' + data.error);
    }
});


