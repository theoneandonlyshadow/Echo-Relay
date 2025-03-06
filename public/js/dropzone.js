// this file is only for drag n drop feature.

let selectedFiles = [];

// drag n drop event to accept files to drop
function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('dropArea').classList.add('hover');

    document.getElementById('dropArea').classList.add('hover');
    document.querySelector('.uprec').classList.add('fade');
}

// drop files to upload
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
        const uniqueFile = {
            name: file.name,
            size: file.size,
            file: file,
            timestamp: Date.now()
        };

        selectedFiles.push(uniqueFile);

        const fileItem = document.createElement('div');
        fileItem.classList.add('file-item');
        fileItem.innerHTML = `
            <span class="file-name">${file.name}</span>
            <span class="file-size">${formatFileSize(file.size)}</span>
            <button class="delete-btn" onclick="removeFile('${uniqueFile.timestamp}')">❌</button>
        `;

        fileNamesContainer.appendChild(fileItem);
    });

    updateFileInput();
}

// if files are in Kb, Mb, or Gb, it displays it instead of using Mb and having decimals and shi
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

// remove files using the "❌"
function removeFile(timestamp) {
    selectedFiles = selectedFiles.filter((file) => file.timestamp !== parseInt(timestamp));
    const fileNamesContainer = document.getElementById('fileNames');
    const fileItems = fileNamesContainer.querySelectorAll('.file-item');
    fileItems.forEach((item) => {
        if (item.querySelector('.delete-btn').getAttribute('onclick').includes(timestamp)) {
            fileNamesContainer.removeChild(item);
        }
    });

    updateFileInput();
    if (selectedFiles.length === 0) {
        fileNamesContainer.style.display = 'none';
        document.querySelector('.uprec').classList.remove('fade');
    }
}

function updateFileInput() {
    const fileInput = document.getElementById('fileID');
    const fileList = new DataTransfer();

    selectedFiles.forEach((file) => {
        fileList.items.add(file);
    });

    const newFileInput = fileInput.cloneNode();
    newFileInput.files = fileList.files;
    fileInput.parentNode.replaceChild(newFileInput, fileInput);
    document.querySelector('.uprec').classList.remove('fade');
}

// are you css because js or js because css
