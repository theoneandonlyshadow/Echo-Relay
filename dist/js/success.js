"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function copyshi() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const text = document.getElementById('dlink').value;
            yield navigator.clipboard.writeText(text);
        }
        catch (err) {
            alert(err);
        }
    });
}
function deleteFile() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const currentURL = window.location.href;
            const url = new URL(currentURL);
            const fileLink = url.searchParams.get('link');
            if (!fileLink) {
                alert('No file link provided');
                return;
            }
            const linkURL = new URL(fileLink);
            const fileId = linkURL.searchParams.get('id');
            const response = yield fetch(`/delete/${fileId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                document.getElementById('deletesucc').addEventListener('click', function () {
                    window.location.href = '/';
                }, true);
                document.getElementById('fileUploaded').innerHTML = 'File Deleted';
                let widgets = document.getElementsByClassName('widget-centered');
                while (widgets.length > 0) {
                    widgets[0].remove();
                }
                document.getElementById("transitionToDaDelete").style.display = "block";
                document.getElementById('transitionToDaDelete').innerHTML = '<br> <br>';
                document.getElementById('deletesucc').innerHTML = 'Go back to Upload';
            }
            else {
                const err = yield response.json();
                document.getElementById('fileUploaded').innerHTML = `${err.message}`;
                let widgets = document.getElementsByClassName('widget-centered');
                while (widgets.length > 0) {
                    widgets[0].remove();
                }
                document.getElementById("transitionToDaDelete").style.display = "block";
                document.getElementById('transitionToDaDelete').innerHTML = '<br> <br>';
                document.getElementById('deletesucc').innerHTML = 'Go back to Upload';
            }
        }
        catch (error) {
            document.getElementById('fileUploaded').innerHTML = `${error.message}`;
            let widgets = document.getElementsByClassName('widget-centered');
            while (widgets.length > 0) {
                widgets[0].remove();
            }
            document.getElementById("transitionToDaDelete").style.display = "block";
            document.getElementById('transitionToDaDelete').innerHTML = '<br> <br>';
            document.getElementById('deletesucc').innerHTML = 'Go back to Upload';
        }
    });
}
