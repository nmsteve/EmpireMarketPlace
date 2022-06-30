const fs = require('fs')

fs.readFile('./metadata/_metadata.json','utf8', function read(error, data){
    if(error) {
        throw error
    }

    processFile(data)
})

function processFile(content){

    const neonPet = JSON.parse(content)
    let limit = 0
    
    neonPet.forEach(element => {
     limit++

     if(limit <=5 ) {

        element['image'] = `https://ipfs.io/ipfs/QmNbGZUvTPrymw4szNTDuqzCtxWMxuraMSVXFrWHBjccZd/${limit}.png`
    

        fs.writeFile(`./metadata/json/ ${element['edition']}.json`, JSON.stringify(element,null,2),(err)=>{
            if(err) throw err
            console.log(`${element['edition']}.json`)
            

        })
        

     }
        
    
    });


 }
