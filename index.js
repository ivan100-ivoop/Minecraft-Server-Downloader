const request = require('request'), fs = require('fs'), _cliProgress = require('cli-progress');
const filename = "test";

const downloader = (url, filename, callback) => {

    const progressBar = new _cliProgress.SingleBar({
        format: '{bar} {percentage}% | ETA: {eta}s'
    }, _cliProgress.Presets.shades_classic);

    const file = fs.createWriteStream(filename);
    let receivedBytes = 0
    

    request.get(url)
    .on('response', (response) => {
        if (response.statusCode !== 200) {
            return callback('Response status was ' + response.statusCode);
        }

        const totalBytes = response.headers['content-length'];
        progressBar.start(totalBytes, 0);
    })
    .on('data', (chunk) => {
        receivedBytes += chunk.length;
        progressBar.update(receivedBytes);
    })
    .pipe(file)
    .on('error', (err) => {
        fs.unlink(filename);
        progressBar.stop();
        return callback(err.message);
    });

    file.on('finish', () => {
        progressBar.stop();
        file.close(callback);
    });

    file.on('error', (err) => {
        fs.unlink(filename); 
        progressBar.stop();
        return callback(err.message);
    });
}

function getMC(type, version){
	if(type != null && version != null){
		fs.readFile('manifest_version.json', {encoding:'utf8', flag:'r'}, (err, data) => {
			var response = `Not Found Or Missing Version Use ${filename} list!.`;
		    if(!err){
		    	data = JSON.parse(data)[type];
		    	data.forEach(json=>{
		    		if(json["version"] === version){
		    			response = `Version: ${json["version"]} \r\n Release Date: ${json["relase_date"]} \r\n Size: ${json["size"]} \r\n Visit: ${json["page_url"]} \r\n Download: ${json["download_url"]} \r\n`;
		    		}
		    	})
		    	console.log(response);
		    }else{
		    	console.error(err);
		    }
		 })
	}else{
		console.error(`Hmmmm Have Error Use ${filename} ? or ${filename} help`);
	}
}

function getTypes(){
	fs.readFile('manifest_version.json', {encoding:'utf8', flag:'r'}, (err, data) => {
		var response = "Missing Versions!.";
	    if(!err){
	    	data = JSON.parse(data);
	    	Object.keys(data).forEach(json=>{
		    	console.log(json);
		    })
	    }else{
	    	console.error(err);
	    }
	 })
}

function getHelp() {
	console.log(`\r\n Usage: \r\n\r\n Help: ${filename} help or test ? \r\n Open Server Page: ${filename} open <type> <verion> \r\n List Supports: ${filename} list \r\n Download: ${filename} download <type> <version> <path> \r\n Info: ${filename} info <type> <verion> \r\n\r\n Example: \r\n ${filename} info spigot 1.18 \r\n ${filename} download spigort 1.18 C:/ \r\n ${filename} download spigot 1.18 \r\n ${filename} open spigot 1.18\r\n`);
}

function download(args){
	if(args != null){
		const version = args[4] || null;
		const path_get = args[5] || "";
		const type = args[3] || null;
		if(type != null && version != null){
			fs.readFile('manifest_version.json', {encoding:'utf8', flag:'r'}, (err, data) => {
				var response = null;
			    if(!err){
			    	data = JSON.parse(data)[type];
			    	if(data != undefined && data != null){
				    	data.forEach(json=>{
				    		if(json["version"] === version){
				    			response = json;
				    		}
				    	})
				    	if(response != null){
				    		downloader(response["download_url"], `${path_get}server.jar`, (e) => {
				    			if(!e){
					    			console.log(`Saved: ${type}-${version} as ${path_get}server.jar`);
					    		}
				    		});
				    	}else{
				    		console.log(`Not Found Or Missing Version Use ${filename} list!.`);
				    	}
				    }else{
				    	console.log(`Not Found Or Missing Type Use ${filename} list!.`);
				    }
			    }else{
			    	console.error(err);
			    }
			 })
		}else{
			console.error(`Hmmmm Have Error Use: ${filename} ? or ${filename} help`);
		}	
	}else{
		console.error(`Hmmmm Have Error Missing version type path Use: ${filename} ? or ${filename} help`);
	}
}

function openWeb(argv){
	if(argv != null){
		const type = argv[3]|| null;
		const version = argv[4] || null;
		if(type != null && version != null){
		fs.readFile('manifest_version.json', {encoding:'utf8', flag:'r'}, (err, data) => {
			var response = `Not Found Or Missing Version Use ${filename} list!.`;
		    if(!err){
		    	data = JSON.parse(data)[type];
		    	data.forEach(json=>{
		    		if(json["version"] === version){
		    			response = `Version: ${json["version"]} \r\n Release Date: ${json["relase_date"]} \r\n Size: ${json["size"]} \r\n Visit: ${json["page_url"]} \r\n Download: ${json["download_url"]} \r\n`;
		    			var start = (process.platform == 'darwin'? 'open': process.platform == 'win32'? 'start': 'xdg-open');
		    			require('child_process').exec(start + ' ' + json["page_url"]);
		    		}
		    	})
		    	console.log(response);
		    }else{
		    	console.error(err);
		    }
		 })
	}else{
		console.error(`Hmmmm Have Error Use ${filename} ? or ${filename} help`);
	}
	}else{
		console.error(`Hmmmm Have Error Missing version type path Use: ${filename} ? or ${filename} help`);
	}
}

switch(process.argv[2]){
	case "list":
	    getTypes();
	    break;
	case "help":
	    getHelp();
	    break;
	case "?":
	    getHelp();
	    break;
	case "download":
	    download(process.argv || null);
	    break;
	 case "open":
	    openWeb(process.argv || null);
	    break;
	case "info":
	    getMC(process.argv[3] || null, process.argv[4] || null)
	    break;
	default:
	    getHelp();
	    break;
}