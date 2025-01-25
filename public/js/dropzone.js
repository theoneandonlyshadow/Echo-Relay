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
        if (!selectedFiles.some((f) => f.name === file.name && f.size === file.size)) {
            selectedFiles.push(file);
            const fileItem = document.createElement('div');
            fileItem.classList.add('file-item');
            fileItem.innerHTML = `
                <span class="file-name">${file.name}</span>
                <span class="file-size">${formatFileSize(file.size)}</span>
                <button class="delete-btn" onclick="removeFile('${file.name}')">❌</button>
            `;

            fileNamesContainer.appendChild(fileItem);
        }
    });

    updateFileInput();
}

function formatFileSize(size) {
    if (size >= 1024 * 1024 * 1024) {
        return (size / (1024 * 1024 * 1024)).toFixed(2) + " GB";
    } else if (size >= 1024 * 1024) {
        return (size / (1024 * 1024)).toFixed(2) + " MB";
    } else if (size >= 1024) {
        return (size / 1024).toFixed(2) + " KB";
    } else {
        return size + " Bytes";
    }
}

function removeFile(fileName) {
    selectedFiles = selectedFiles.filter((file) => file.name !== fileName);
    const fileNamesContainer = document.getElementById('fileNames');
    const fileItems = fileNamesContainer.querySelectorAll('.file-item');
    fileItems.forEach((item) => {
        if (item.querySelector('.file-name').textContent === fileName) {
            fileNamesContainer.removeChild(item);
        }
    });

    updateFileInput();
    if (selectedFiles.length === 0) {
        fileNamesContainer.style.display = 'none';
    }
}

function updateFileInput() {
    const fileInput = document.getElementById('fileID');
    const dataTransfer = new DataTransfer();

    selectedFiles.forEach((file) => {
        dataTransfer.items.add(file);
    });

    fileInput.files = dataTransfer.files;
}

// are you css because js or js because css