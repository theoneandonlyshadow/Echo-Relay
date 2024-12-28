async function copyshi() {
    try {
        const text = document.getElementById('dlink').value;
        await navigator.clipboard.writeText(text);
    } catch (err) {
        alert(err);
    }
}

async function deleteFile() {
    try {
        const fileLink = document.getElementById('dlink').value;
        const url = new URL(fileLink);
        const fileId = url.searchParams.get('id');

        const response = await fetch(`/delete/${fileId}`, {
            method: 'DELETE',
        });

    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}
