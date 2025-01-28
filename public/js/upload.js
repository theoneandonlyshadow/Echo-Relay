const droparea = document.querySelector(".drop_box"),
  button = droparea.querySelector("button"),
  input = droparea.querySelector("input");

let files;

button.onclick = () => {
  input.click(); 
};


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

input.addEventListener("change", function (e) {
  files = Array.from(e.target.files);

  let fileList = files
      .map((file) => {
          const fileSize = formatFileSize(file.size);
          return `<li>
                      <h4>${file.name} - ${fileSize}</h4>
                  </li>`;
      })
      .join("");

  let filedata = `
      <form action="/upload" method="POST" enctype="multipart/form-data">
          <div class="form">
              <ul>${fileList}</ul>
              <input type="file" name="files" multiple style="display: none;" value="${files
                  .map((file) => file.name)
                  .join(', ')}">
                  <br>
<<<<<<< HEAD
                  <input type="password" placeholder="(Optional Password )" maxlength="12" name="password" style="background-color: transparent; max-width: 200px;">
=======
                  <p>Enable password protection?</p>
                  <input type="password" placeholder="(Optional Password )" maxlength="12" minlength="6" name="password" style="background-color: transparent; max-width: 200px;">
>>>>>>> c4b6cba7dd3c7576ebe38f267018696fa6fa4553
                  <br>
              <button type="submit" class="btn">Upload</button>
          </div>
      </form>`;

  droparea.innerHTML = filedata;

  const forminput = droparea.querySelector('input[type="file"]');
  forminput.files = e.target.files;
});

//I get depressed when I try to comprehend this function
async function downloadFile() {
    try {
        const fileId = document.getElementById('recid').value.trim();
        if (!fileId) {
            alert('Please enter a valid file ID.');
            return;
        }

        const response = await fetch(`/receive/${encodeURIComponent(fileId)}`);

        if (!response.ok) {
            alert(`Failed to download the file. Status: ${response.status}`);
            console.error('Response:', response);
            return;
        }

        const contentDisposition = response.headers.get('Content-Disposition');
        const fileName = contentDisposition
            ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') || 'downloaded_file'
            : 'downloaded_file';

        const fileBlob = await response.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(fileBlob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

    } catch (error) {
        console.error('Download failed:', error);
        alert('An error occurred while downloading the file.');
    }
}
