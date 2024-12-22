async function copyshi() {
    try {
        const text = document.getElementById('dlink').innerHTML;
        await navigator.clipboard.writeText(text);
    } catch (err) {
        alert(err);
    }
}

async function deleteFile() {
    try {
        const fileLink = document.getElementById('dlink').innerHTML;
        const url = new URL(fileLink);
        const fileId = url.searchParams.get('id');

        const response = await fetch(`/delete/${fileId}`, {
            method: 'DELETE',
        });

    } catch (err) {
        alert(`Error: ${err.message}`);
    }
}
// not workin. gotta fix.