let selectedFiles = [];

function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();

    document.getElementById('dropArea').classList.add('hover');

    document.querySelector('.uprec').classList.add('fade');
}

function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();

    document.getElementById('dropArea').classList.remove('hover');

    document.querySelector('.uprec').classList.add('fade');

    const files = event.dataTransfer.files;
    addFiles(files);
}

document.getElementById('fileID').addEventListener('change', (event) => {
    addFiles(event.target.files);

    document.querySelector('.uprec').classList.add('fade');
});

function addFiles(files) {
    const fileNamesContainer = document.getElementById('fileNames');

    if (selectedFiles.length === 0) {
        fileNamesContainer.style.display = 'block'; 
    }

    Array.from(files).forEach((file) => {

        if (!selectedFiles.some((f) => f.name === file.name)) {
            selectedFiles.push(file); 

            const fileNameElement = document.createElement('p');
            fileNameElement.textContent = file.name;
            fileNamesContainer.appendChild(fileNameElement);
        }
    });

    updateFileInput();
}

function updateFileInput() {
    const fileInput = document.getElementById('fileID');
    const dataTransfer = new DataTransfer();

    selectedFiles.forEach((file) => {
        dataTransfer.items.add(file);
    });

    fileInput.files = dataTransfer.files;
}

document.getElementById('dropArea').addEventListener('dragleave', () => {
    document.getElementById('dropArea').classList.remove('hover');

    if (!selectedFiles.length) {
        document.querySelector('.uprec').classList.remove('fade');
    }
});

// are you css because js or js because css