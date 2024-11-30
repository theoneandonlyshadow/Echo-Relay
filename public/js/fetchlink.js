const params = new URLSearchParams(window.location.search);
const link = params.get('link');

if (link) {
    document.getElementById('downloadLink').href = link;
} else {
    document.body.innerHTML = "<h1>Error: Bad file upload. No download link available.</h1>";
}