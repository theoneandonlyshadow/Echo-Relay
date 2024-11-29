const droparea = document.querySelector(".drop_box"),
  button = droparea.querySelector("button"),
  input = droparea.querySelector("input");

let files;

button.onclick = () => {
  input.click(); 
};


input.addEventListener("change", function (e) {
  files = Array.from(e.target.files);

  let fileList = files
    .map(
      (file) =>
        `<li>
          <h4>${file.name}</h4>
        </li>`
    )
    .join("");

  let filedata = `
    <form action="/upload" method="POST" enctype="multipart/form-data">
      <div class="form">
        <ul>${fileList}</ul>
        <input type="file" name="files" multiple style="display: none;" value="${files.map(file => file.name).join(', ')}">
        <button type="submit" class="btn">Upload</button>
      </div>
    </form>`;
  
  droparea.innerHTML = filedata;

  const forminput = droparea.querySelector('input[type="file"]');
  forminput.files = e.target.files;
});

// password protection logic in this file please