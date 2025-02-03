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

            document.getElementById('deletesucc').addEventListener('click', function() {
                window.location.href = '/';
            }, true);

            document.getElementById('fileUploaded').innerHTML = 'File Deleted';
            
            let widgets = document.getElementsByClassName('widget-centered');
            while (widgets.length > 0) {
                widgets[0].remove();
            }
            document.getElementById("transitionToDaDelete").style.display = "block";
            document.getElementById('transitionToDaDelete').innerHTML = '<br> <br>';
            document.getElementById('deletesucc').innerHTML = 'Go back to Upload';
        }
        else {
            const err = await response.json();
            document.getElementById('fileUploaded').innerHTML = `${err.message}`;
            let widgets = document.getElementsByClassName('widget-centered');
            while (widgets.length > 0) {
                widgets[0].remove();
            }
            document.getElementById("transitionToDaDelete").style.display = "block";
            document.getElementById('transitionToDaDelete').innerHTML = '<br> <br>';
            document.getElementById('deletesucc').innerHTML = 'Go back to Upload';
        }
    } catch (error) {
        document.getElementById('fileUploaded').innerHTML = `${error.message}`;
            let widgets = document.getElementsByClassName('widget-centered');
            while (widgets.length > 0) {
                widgets[0].remove();
            }
            document.getElementById("transitionToDaDelete").style.display = "block";
            document.getElementById('transitionToDaDelete').innerHTML = '<br> <br>';
            document.getElementById('deletesucc').innerHTML = 'Go back to Upload';
    }
}
