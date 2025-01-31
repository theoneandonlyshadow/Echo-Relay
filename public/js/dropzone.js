// this file is only for drag n drop feature.

let selectedFiles = [];

// drag n drop event to accept files to drop
function handleDragOver(event) {
    event.preventDefault(); // prevents from opening the files in the browser
    event.stopPropagation(); // i think this has somethin to do with firing events.

    document.getElementById('dropArea').classList.add('hover'); //I hope you know what you're doing.

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
function removeFile(fileName, event) {
    if (event) event.preventDefault(); // Prevent unintended form submission

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
        document.querySelector('.uprec').classList.remove('fade');
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
