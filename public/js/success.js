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
            document.getElementById('fileUploaded').innerHTML = 'File Deleted';
            
            // Remove all elements with class 'widget-centered'
            let widgets = document.getElementsByClassName('widget-centered');
            while (widgets.length > 0) {
                widgets[0].remove();
            }
        
            document.getElementById('deletesucc').innerHTML = 'Go back to Upload';
        }
        
        else {
            const err = await response.json();
            alert(`Error: ${err.message || 'Failed to delete file'}`);
        }
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}
