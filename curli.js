const readline = require('readline');
const fs = require("fs");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function rlq (prompt) {
  return new Promise((resolve, reject) => {
    rl.question(prompt + " ", answer => {
      resolve(answer);
    });
  });
}

function makeDataStringFromKeyValuePairs(formType, kvps) {
  if(formType === "form") {
    const formData = kvps.map(({ key, value }) => `"${key}=${parseMacros(value)}"`);
    return "-d " + formData.join(" -d ");
  }

  return "";
}

function parseMacros(value) {
  const now = new Date();
  const year = now.getFullYear();
  const monthNum = now.getMonth()+1;
  const month = monthNum < 10 ? `0${monthNum}` : ''+monthNum;
  const day = now.getDate();
  const hourNum = now.getHours();
  const hours = hourNum < 10 ? `0${hourNum}` : ''+hourNum;
  const minuteNum = now.getMinutes();
  const minutes = minuteNum < 10 ? `0${minuteNum}` : ''+minuteNum;

  return value.replace("::now::", ''+year+month+day+hours+minutes);
}

(async function main() {
  const mode = process.argv[2]; // load or interactive

  let url = "";
  let verb = "";
  let kvps = [];
  let formType = "";
  let saved = require("./saved.json");
  const loadKey = process.argv[3];

  if(mode === "load") {
    if(loadKey === "")
      throw new Error("You must specify a form to load");
    
    url = saved[loadKey].url;
    verb = saved[loadKey].verb;
    formType = saved[loadKey].formType;
    kvps = saved[loadKey].data;
  }
  else
  {
    url = await rlq("Which URL?");
    verb = (await rlq("Which verb?")).toUpperCase();

    if(!["POST", "GET", "PUT", "PATCH", "DELETE", "OPTIONS"].includes(verb))
      throw new Error("unknown verb");

    formType = (await rlq("Send data? (form, json, no)")).toLowerCase();

    if(!["form", "json", "no"].includes(formType))
      throw new Error("Unknown data");


    kvps = [];
    
    if(formType !== "no") {
      let key = "";
      let value = "";
      
      do {
        key = await rlq("Parameter Key (blank to end)");
        
        if(key)
        {
          value = await rlq("Parameter Value");
          kvps.push({ key, value });
        }
      }
      while( key.trim() !== "" )
    }
    
    
    let saveName = await rlq("Save form with name? (blank=no)");
    let confirmName = "";
    
    if(saveName !== "")
    {
      const saved = require('./saved.json');
      while(saved[saveName] && saveName != confirmName) {
        confirmName = await rlq(`Name '${saveName}' exists. Overwrite? (retype to confirm, new name to choose new)`);
      }
      
      confirmName = saveName;
      
      saved[confirmName] = {
        url,
        verb,
        formType,
        data: kvps
      }
      
      fs.writeFile("./saved.json", JSON.stringify(saved, null, 2), err => {
        if(err)
        throw err;
        
        console.log("Form saved.");
      })
    }
  }
  
  const dataString = makeDataStringFromKeyValuePairs(formType, kvps);
  const curlCommand = `curl -v -X${verb} ${dataString} ${url}`;
  console.log(curlCommand);  
  process.exit(0);
})();