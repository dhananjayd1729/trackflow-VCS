import path from "path";
import fs from "fs/promises"
import crypto from "crypto"
class Trackflow{
    
    constructor(repoPath = "."){
        this.repoPath = path.join(repoPath, ".track");
        this.objectsPath = path.join(this.repoPath, 'objects');
        this.headPath = path.join(this.repoPath, 'HEAD');
        this.indexPath = path.join(this.repoPath, 'index');
        this.init();
    }

    async init(){
        await fs.mkdir(this.objectsPath, {recursive: true});
        try {
            await fs.writeFile(this.headPath, '', {flag: 'wx'}); //wx refers to write only(exclusive). fails if file exists.
            await fs.writeFile(this.indexPath, JSON.stringify([]), {flag: 'wx'})
        } catch (error) {
            console.log("Already initialised the .track folder");
        }
    }
    hashObject(content){
        return crypto.createHash('sha1').update(content, 'utf-8').digest('hex');
    }

    async add(fileToBeAdded){
        const fileData = await fs.readFile(fileToBeAdded, {encoding: 'utf-8'});
        const fileHash = this.hashObject(fileData);
        console.log(fileHash)
        const hashedObjectPath = path.join(this.objectsPath, fileHash);
        await fs.writeFile(hashedObjectPath, fileData);
        await this.updateStagingArea(fileToBeAdded, fileHash)
        console.log(`Added ${fileToBeAdded}`)
    }

    async updateStagingArea(filePath, fileHash){
        const index = JSON.parse(await fs.readFile(this.indexPath, {encoding: 'utf-8'}));
        index.push({path: filePath, hash: fileHash});
        await fs.writeFile(this.indexPath, JSON.stringify(index));
    }

    async commit(message){
        const index = JSON.parse(await fs.readFile(this.indexPath, {encoding:'utf-8'}));
        const parentCommit = await this.getCurrentHead();
        const commitData = {
            message,
            timeStamp: new Date().toISOString(),
            files: index,
            parent: parentCommit
        }
        const commitHash = this.hashObject(JSON.stringify(commitData));
        const commitPath = path.join(this.objectsPath, commitHash);
        await fs.writeFile(commitPath, JSON.stringify(commitData));
        await fs.writeFile(this.headPath, commitHash);
        await fs.writeFile(this.indexPath, JSON.stringify([]));
        console.log(`Successfully created a commit: ${commitHash}`)
    }
    getCurrentHead(){
        try {
            return fs.readFile(this.headPath, {encoding:'utf-8'});
        } catch (error) {
            return null;
        }
    }
}

