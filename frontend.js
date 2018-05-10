var config = require('./config/config.json');

var Dropbox = require('dropbox');

var shell = require('electron').shell;

var http = require('https');

var request = require('request');

const fs = require('fs');

let $ = require('jquery');

var imageTypes = Array("jpg", "jpeg", "png", "tiff", "tif", "gif", "bmp", "svg");
var archiveTypes = Array("zip", "7z", "rar", "tar", "bz2", "gz");
var musicfileTypes = Array("mp3", "ogg", "oga", "moga", "wav", "wma", "m4a", "m4b", "m4p", "au", "aac", "aiff");
var videofileTypes = Array("mp4", "mov", "flac", "webm", "mkv");
var documentfileTypes = Array("doc", "docx", "txt", "odt");
var spreadsheetfileTypes = Array("xlsx", "xlsm", "xltx", "xltm", "ods", "ots", "odg", "otg");
var codefileTypes = Array("pl", "py", "rb", "sh", "go", "r", "c", "h", "cpp", "hpp", "php", "r", "cs", "js");
var stylesheetfileType = Array("css", "scss", "less");
var htmlfileTypes = Array("html", "xhtml", "htm");

// Folder Items

var edropx = {};

edropx.global = {};

edropx.global.default_download_directory = require('os').homedir() + "/Downloads/";

// Importing this adds a right-click menu with 'Inspect Element' option
const remote = require('electron').remote;
const {Menu, MenuItem} = remote;

let rightClickData = null

const rightClickMenu = new Menu();

rightClickMenu.append(new MenuItem({

  label: 'Download File/Folder',

  click: () => {

  	console.log("rightClickMenu#Download File/Folder#$(rightClickData.t).attr(\"data-file-path\"): ", $(rightClickData.t).attr("data-file-path"));
    
    edropx_get_shared_link(edropx.global.dbx, $(rightClickData.t).attr("data-file-path"), false, false, true);

  }

}));

rightClickMenu.append(new MenuItem({

  label: 'Preview',

  click: () => {
    
    console.log("Not yet Implemented")

  }

}));

rightClickMenu.append(new MenuItem({

  label: 'Get Sharing Link',

  click: (ev) => {

  	console.log("rightClickMenu#Get Sharing Link#$(rightClickData.t).attr(\"data-file-path\"): ", $(rightClickData.t).attr("data-file-path"));

  	console.log(rightClickData.t);

  	edropx_get_shared_link(edropx.global.dbx, $(rightClickData.t).attr("data-file-path"));
    
    //console.log("Not yet Implemented");

  }

}));

rightClickMenu.append(new MenuItem({

  label: 'Inspect Element',

  click: () => {
    remote.getCurrentWindow().inspectElement(rightClickData.x, rightClickData.y)
  }

}));

window.addEventListener('contextmenu', (e) => {

	e.preventDefault()
	rightClickData = {x: e.x, y: e.y, t: e.target}
  	rightClickMenu.popup(remote.getCurrentWindow())

}, false);


remote.getCurrentWindow().$ = $;

// Download File From URL

function edropx_download_file_from_url(url, dest, download_dir=null, cb=null) {

	if(download_dir == null) {

		download_dir = edropx.global.default_download_directory;

	}

	dest = download_dir + dest;

	console.log("edropx_download_file_from_url#fs.writeFile Writing to: " + dest);

    var file = fs.createWriteStream(dest);
    var sendReq = request.get(url);

    var cur = 0;
    var total = 0;

    let fileSize;

    //return;

    // verify response code
    sendReq.on('response', function(response) {
        if (response.statusCode !== 200) {
            console.log('Response status was ' + response.statusCode);
            return false;
        }

        fileSize = response.headers[ 'content-length' ];

        total = fileSize / 1048576;

        console.log( "File Size is : " + fileSize );

    });

    sendReq.on('data', function (chunk) {

    	console.log("Chunk Length: " + chunk.length);

    	cur += chunk.length;

    	var dwn_message = "Downloading " + (100.0 * cur / fileSize).toFixed(2) + "% " + (cur / 1048576).toFixed(2) + " mb\r" + ".<br/> Total size: " + total.toFixed(2) + " mb";

    	//edropx_display_info("dstatus", dwn_message);

    	edropx_display_progress("dstatus", (100.0 * cur / fileSize).toFixed(2), fileSize);

    	console.log(dwn_message);
	
	});


    // check for request errors
    sendReq.on('error', function (err) {
        fs.unlink(dest);
        console.log(err.message);
        return false;
    });

    sendReq.pipe(file);

    file.on('finish', function() {

    	console.log("file.on finish");

    	edropx_display_success("dstatus", "File Downloaded to " + dest);

        file.close();  // close() is async, call callback after close completes.
    });

    file.on('error', function(err) { // Handle errors
        fs.unlink(dest); // Delete the file async. (But we don't check the result)
        console.log(err.message);
        return false;
    });
};


// Display Messages using Bootstrap

function edropx_display_error(element_id, message) {

	$("#" + element_id).html("<div class=\"alert alert-danger\"><strong>Error:</strong>" + message + "</div>");

}

function edropx_display_success(element_id, message) {

	$("#" + element_id).html("<div class=\"alert alert-success\"><strong>Success:</strong>" + message + "</div>");

}

function edropx_display_info(element_id, message) {

	$("#" + element_id).html("<div class=\"alert alert-info\"><strong>Info:</strong>" + message + "</div>");

}

function edropx_display_progress(element_id, value_now, value_max) {

	$("#" + element_id).html("<div class=\"progress\"><div class=\"progress-bar\" role=\"progressbar\" style=\"width: 25%\" aria-valuenow=\""+value_now+"\" aria-valuemin=\"0\" aria-valuemax=\""+value_max+"\"></div></div>");

}

function getFileExtension(filename) {

  return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase();

}
