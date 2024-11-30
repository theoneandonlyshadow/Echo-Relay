function myFunction() {
    var copyText = document.getElementById("myInput");
    copyText.select();
    document.execCommand("copy");
  var tooltip = document.getElementById("myTooltip");
    tooltip.innerHTML = "URL Copied: " + copyText.value;
  }
  
  function outFunc() {
    var tooltip = document.getElementById("myTooltip");
    tooltip.innerHTML = "Copy URL to clipboard";
  }

  