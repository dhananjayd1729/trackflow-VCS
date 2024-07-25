import path from "path";
import fs from "fs/promises"
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
}
// const track = new Trackflow();