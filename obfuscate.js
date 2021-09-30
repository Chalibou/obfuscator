const fs = require("fs");
const path = require("path")
const prompt = require('prompt-sync')({sigint: true});
const jsObfuscator = require('javascript-obfuscator');
const obfOptions = {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.4,
    debugProtection: false,
    debugProtectionInterval: false,
    disableConsoleOutput: true,
    identifierNamesGenerator: 'hexadecimal',
    log: false,
    numbersToExpressions: true,
    renameGlobals: false,
    rotateStringArray: true,
    selfDefending: true,
    shuffleStringArray: true,
    simplify: true,
    splitStrings: true,
    splitStringsChunkLength: 10,
    stringArray: true,
    stringArrayEncoding: ['base64'],
    stringArrayIndexShift: true,
    stringArrayWrappersCount: 2,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 4,
    stringArrayWrappersType: 'function',
    stringArrayThreshold: 0.75,
    transformObjectKeys: true,
    unicodeEscapeSequence: false
}

//Gather data from .env
const originPath = "F:/Code/Cotiz 1.2"//prompt("Enter the complete path of the source folder :");
const destinationPath = "F:/Code/Cotiz 1.2-prod"//prompt("Enter the complete path of the target folder :");

//Copy directory
copyDir(originPath,destinationPath);

async function copyDir(src,dest) {
    try {
        const avoidCopy = [
            '.git',
            '.gitignore',
            'package-lock.json',
            'node_modules',
            'https'
        ]
        const avoidObf = [
            'server',
            'en-EN.js',
            'es-ES.js',
            'xali_app.js',
            'math.js',
            'picker.js',
            'package.json',
        ]
        fs.mkdir(dest, { recursive: true },()=>{
            fs.readdir(src,{withFileTypes: true},(err,entries)=>{
                if(err) throw err;
                for (let entry of entries) {
                    let srcPath = path.join(src, entry.name);
                    let destPath = path.join(dest, entry.name);       
                    if (entry.isDirectory()) {
                        if(avoidCopy.some((elmt)=>{return elmt == entry.name})){
                            continue;
                        }
                        copyDir(srcPath, destPath);
                    }else{
                        if(avoidCopy.some((elmt)=>{return `${elmt}` == entry.name})){
                            continue;
                        }
                        //Check if file is a .js file
                        if (entry.name.includes(".js")) {
                            //Check if file has to be obfuscated
                            if(avoidObf.some((elmt)=>{return elmt == entry.name})||avoidObf.some((elmt)=>{return srcPath.includes(elmt)})){
                                //Just copy the file
                                fs.copyFile(srcPath, destPath,()=>{});
                                console.log("JS FILE COPIED : ", srcPath);
                            }else{
                                //Get file content
                                fs.readFile(srcPath,"utf8",(err,data)=>{
                                    if (err) throw err;
                                    //Obfuscate
                                    console.log(`----===== OBFUSCATING : ${entry.name} =====----`);
                                    const obfCode = jsObfuscator.obfuscate(data,obfOptions).getObfuscatedCode();
                                    //Write file in target
                                    fs.writeFile(destPath,obfCode,()=>{});
                                    console.log("JS FILE OBFUSCATED : ", srcPath);
                                }) 
                            }
                        }else{
                            fs.copyFile(srcPath, destPath,()=>{});
                            console.log("REGULAR FILE COPIED : ", srcPath);
                        }
                    }             
                }
            });
        });
        
    } catch (error) {
        throw error;
    }
}