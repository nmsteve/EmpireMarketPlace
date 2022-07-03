const fs = require('fs')
require('dotenv')

fs.readFile('./metadata/_metadata.json','utf8', function read(error, data){
    if(error) {
        throw error
    }

    processFile(data)
})

async function processFile(content){

    const neonPet = JSON.parse(content)
    let limit = 0
    
    neonPet.forEach(element => {
     limit++
     if(limit <= 50 ) {


    
        element['image'] = `https://ipfs.io/ipfs/QmdutXFii1Wb9VDW36eFtabJ2W5WH4jQ1JfSLDd27uRk8P/${limit}.png`
        element["external_url"] = `https://drive.google.com/drive/folders/1wjI8PgnPXlqpvUdAk4kK7NMEclt5fqEL`
    
    
        fs.writeFile(`./metadata/json/ ${element['edition']}.json`, JSON.stringify(element,null,2),(err)=>{
            if(err) throw err
            console.log(`${element['edition']}.json`)
            

        })
        

     }
        
    
    });


 }
