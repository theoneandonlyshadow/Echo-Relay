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
                      <a class="delete-btn" onclick="removeFile('${file.name}')">❌</a>
                  </li>`;
      })
      .join("");

      function removeFile(fileName) {
        selectedFiles = selectedFiles.filter((file) => file.name !== fileName);
        const fileNamesContainer = document.getElementById('fileNames');
        const fileItems = fileNamesContainer.querySelectorAll('.file-item');
        fileItems.forEach((item) => {
            if (item.querySelector('.file-name').textContent === fileName) {
                fileNamesContainer.removeChild(item);
            }
        });
    }


  let filedata = `
      <form action="/upload" method="POST" enctype="multipart/form-data">
          <div class="form">
              <ul>${fileList}</ul>
              <input type="file" name="files" multiple style="display: none;" value="${files
                  .map((file) => file.name)
                  .join(', ')}">
                  <br>
                  <input type="password" placeholder="(Optional Password )" maxlength="12" name="password" style="background-color: transparent; max-width: 200px;">
                  <br>
              <button type="submit" class="btn">Upload</button>
          </div>
      </form>`;

  droparea.innerHTML = filedata;

  const forminput = droparea.querySelector('input[type="file"]');
  forminput.files = e.target.files;
});

module.exports = { formatFileSize }

