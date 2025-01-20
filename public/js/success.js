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
        const currentURL = window.location.href;
        const url = new URL(currentURL);
        const fileLink = url.searchParams.get('link');

        if(!fileLink) {
            alert('No file link provided');
            return;
        }
        
        const linkURL = new URL(fileLink);
        const fileId = linkURL.searchParams.get('id');

        const response = await fetch(`/delete/${fileId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            window.location.href = '/deleted' ;
        }
        else {
            const err = await response.json();
            alert(`Error: ${err.message || 'Failed to delete file'}`);
        }
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}
