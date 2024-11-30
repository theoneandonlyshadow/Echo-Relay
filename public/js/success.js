async function copyshi() {
    try {
        const text = document.getElementById('dlink').innerHTML;
        await navigator.clipboard.writeText(text);
    } catch (err) {
        alert(err);
    }
}


// not workin. gotta fix.