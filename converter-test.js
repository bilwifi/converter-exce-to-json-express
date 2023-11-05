// const express = require("express");
// const multer = require("multer");
// const excelToJson = require("convert-excel-to-json");
// const fs = require("fs-extra");
// const bodyParser = require("body-parser");

// const app = express();
// const port = 3000;

// app.use(bodyParser.urlencoded({ extended: true }));
// const upload = multer({ dest: "uploads/" });

// app.post("/read", upload.single("file"), (req, res) => {
//   try {
//     const { validite, sous_compte, sheetName } = req.body;
//     if (!req.file?.filename)
//       return res.status(400).json("Aucun fichier trouvé");
//     if (!validite || !sous_compte)
//       return res.status(400).json("Vérifier les paramètres"); // tu peux rajouter d'autre vérification et validation
//     const filePath = "uploads/" + req.file.filename;
//     // convcersion du fichier excel en JSON
//     const excelData = excelToJson({
//       sourceFile: filePath,
//       header: {
//         rows: 1,
//       },
//       columnToKey: {
//         "*": "{{columnHeader}}",
//       },
//     });

//     const calculerMontantConversion = (amount) => {
//       switch (sous_compte) {
//         case "unites":
//           return amount;
//         case "voix":
//           return amount * 60;
//         case "data":
//           return amount * 1024;
//         case "sms":
//           return amount; // SMS aussi egale à 1 ??????
//         default:
//           return 0;
//       }
//     };

//     const ajouterColonnes = (row) => ({
//       sous_compte,
//       validite: parseInt(validite),
//       montant_conversion: calculerMontantConversion(row.amont || 0),
//     });

//     let strTxt = ``;
//     const dataFormat = excelData[sheetName || "Feuille 1"].map((row) => {
//       const r = {
//         ...row,
//         ...ajouterColonnes(row),
//       };

//       strTxt += `${r.msisdn},${r.compte},${r.amont},${r.montant_conversion},${r.validite};`;
//       return r;
//     });

// //  for (let objet of excelData[sheetName || "Feuille 1"]) {
// //     const newProperty = ajouterColonnes(objet)
// //     Object.assign(objet, newProperty)
// //   }

//     fs.remove(filePath);

//     // Vérifier si la requête est faite via un navigateur
//     const isBrowser = /(MSIE|Edge|Firefox|Chrome|Safari)/.test(
//       req.headers["User-Agent"]
//     );

//     // Renvoyer un fichier texte à télécharger si la requête est faite via un navigateur
//     if (isBrowser) {
//     const newFilePath = `uploads/${req.file.originalname}_converted.txt`
//       res.setHeader("Content-Type", "text/csv");
//       fs.writeFileSync(newFilePath, strTxt);
//       res.download(newFilePath, strTxt, (err) => {
//         if (err) throw err;
//       });
//       fs.remove(newFilePath); // si tu veux stocker le fichier dans le server pour l'historique : commente cette ligne
//     } else {
//       // Renvoyer un JSON si la requête n'est pas faite via un navigateur
//       res.status(200).json(dataFormat);
//     }

//   } catch (err) {
//     res.status(500);
//   }
// });

// app.listen(port, () => {
//   console.log("Le server est démaré PORT", port);
// });



const express = require("express");
const multer = require("multer");
const excelToJson = require("convert-excel-to-json");
const fs = require("fs-extra");
const bodyParser = require("body-parser");
const arrow = require("apache-arrow");

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
const upload = multer({ dest: "uploads/" });

app.post("/read", upload.single("file"), async (req, res) => {
  try {
    const { validite, sous_compte, sheetName } = req.body;
    if (!req.file?.filename)
      return res.status(400).json("Aucun fichier trouvé");
    if (!validite || !sous_compte)
      return res.status(400).json("Vérifier les paramètres"); // tu peux rajouter d'autre vérification et validation
    const filePath = "uploads/" + req.file.filename;
    // convcersion du fichier excel en JSON
    const excelData = excelToJson({
      sourceFile: filePath,
      header: {
        rows: 1,
      },
      columnToKey: {
        "*": "{{columnHeader}}",
      },
    });
console.log("JSON oK",)
console.log("JSON ==",array.tableFromArrays(excelData))
    // conversion du tableau JSON en tableau Arrow
    const table = arrow.Table.fromJson(excelData);

    console.log('conver table================>',table)

    // calcul du montant de conversion
    const montantConversion = table.column("amont").apply(
      (amount) => calculerMontantConversion(amount)
    );

    // ajout des colonnes supplémentaires
    table = table.withColumn("sous_compte", montantConversion);
    table = table.withColumn("validite", parseInt(validite));

    // conversion du tableau Arrow en JSON
    const dataFormat = table.toJson();

    // Vérifier si la requête est faite via un navigateur
    const isBrowser = /(MSIE|Edge|Firefox|Chrome|Safari)/.test(
      req.headers["User-Agent"]
    );

    // Renvoyer un fichier texte à télécharger si la requête est faite via un navigateur
    if (isBrowser) {
      const newFilePath = `uploads/${req.file.originalname}_converted.txt`;
      res.setHeader("Content-Type", "text/csv");
      fs.writeFileSync(newFilePath, dataFormat);
      res.download(newFilePath, dataFormat, (err) => {
        if (err) throw err;
      });
      fs.remove(newFilePath); // si tu veux stocker le fichier dans le server pour l'historique : commente cette ligne
    } else {
      // Renvoyer un JSON si la requête n'est pas faite via un navigateur
      res.status(200).json(dataFormat);
    }

  } catch (err) {
    res.status(500);
  }
});

app.listen(port, () => {
  console.log("Le server est démaré PORT", port);
});

// const express = require("express")
// const multer = require("multer")
// const xlsx = require("xlsx")
// const fs = require("fs-extra")
// const path = require("path")

// const app = express()
// const port = 3000

// const upload = multer({dest : "uploads/"})

// app.post('/read',upload.single("file"),async(req,res)=>{
//     try{
//         if(!req.file?.filename) return res.status(400).json("Aucun fichier trouvé")

//         const filePath = "uploads/" + req.file.filename;
//         // console.log('filePath',filePath)

//         const workbook = xlsx.readFile(filePath);
//         // console.log('ficjier lu,',workbook)
//         const worksheet = workbook.Sheets["Feuille 1"];

//         // console.log('worksheet',worksheet)

//         const jsonStream = xlsx.stream.json(worksheet);

//         console.log("jsonStream",jsonStream)

//         res.setHeader('Content-Type', 'application/json');
//         jsonStream.pipe(res);

//         await jsonStream.finished;

//         fs.remove(filePath)
//     }catch(err){
//         res.status(500)
//     }
// })

// app.listen(port,()=>{
//     console.log('Le server est démaré PORT',port)
// })

// const express = require("express")
// const multer = require("multer")
// const excelToJson = require("convert-excel-to-json")
// const fs = require("fs-extra")
// const path = require("path")
// const workerFarm = require("worker-farm")

// const app = express()
// const port = 3000

// const upload = multer({dest : "uploads/"})

// app.post('/read',upload.single("file"),async(req,res)=>{
//     try{
//         if(!req.file?.filename) return res.status(400).json("Aucun fichier trouvé")

//         const filePath = "uploads/" + req.file.filename;
//         console.log('filePath',filePath)

//         const workbook = excelToJson.readFile(filePath);
//         // console.log('workbook',workbook)
//         const worksheet = workbook.Sheets["Feuille 1"];

//         console.log('worksheet',worksheet)

//         const rows = worksheet.data.length;
//         const workerCount = Math.floor(rows / 2);

//         const farm = workerFarm({concurrency: workerCount});

//         const tasks = [];
//         for(let i = 0; i < rows; i++){
//             tasks.push(async(i) => {
//                 const json = excelToJson.stream.json(worksheet, {startRow: i + 1, startCol: 1});
//                 return json;
//             });
//         }

//         const results = await farm.map(tasks);

//         const jsonData = results.reduce((acc, json) => acc.concat(json), []);

//         res.setHeader('Content-Type', 'application/json');
//         res.send(jsonData);

//         fs.remove(filePath)
//     }catch(err){
//         res.status(500)
//     }
// })

// app.listen(port,()=>{
//     console.log('Le server est démaré PORT',port)
// })

// const express = require("express")
// const multer = require("multer")
// const xlsx = require("xlsx")
// const fs = require("fs-extra")

// const app = express()
// const port = 3000

// const upload = multer({dest : "uploads/"})

// app.post('/read',upload.single("file"),async(req,res)=>{
//     try{
//         if(!req.file?.filename) return res.status(400).json("Aucun fichier trouvé")

//         const filePath = "uploads/" + req.file.filename;
//         console.log('filePath',filePath)

//         const workbook = xlsx.readFile(filePath);
//         const worksheet = workbook.Sheets[0];

//         const jsonStream = xlsx.stream.json(worksheet);

//         res.setHeader('Content-Type', 'application/json');
//         jsonStream.pipe(res);

//         await jsonStream.finished;

//         fs.remove(filePath)
//     }catch(err){
//         res.status(500)
//     }
// })

// app.listen(port,()=>{
//     console.log('Le server est démaré PORT',port)
// })

// const express = require("express")
// const multer = require("multer")
// const xlsx = require("xlsx")
// const fs = require("fs-extra")
// const path = require("path")
// const workerFarm = require("worker-farm")

// const app = express()
// const port = 3000

// const upload = multer({dest : "uploads/"})

// app.post('/read',upload.single("file"),async (req,res)=>{
//     try{
//         if(!req.file?.filename) return res.status(400).json("Aucun fichier trouvé")

//         const filePath = "uploads/" + req.file.filename;
//         console.log('filePath',filePath)

//         const workbook = xlsx.readFile(filePath);
//         const worksheet = workbook.Sheets[0];

//         const rows = worksheet.data.length;
//         const workerCount = Math.floor(rows / 1000);

//         const farm = workerFarm({concurrency: workerCount});

//         const tasks = [];
//         for(let i = 0; i < rows; i++){
//             tasks.push(async(i) => {
//                 const json = xlsx.stream.json(worksheet, {startRow: i + 1, startCol: 1});
//                 return json;
//             });
//         }

//         const results = await farm.map(tasks);

//         const jsonData = results.reduce((acc, json) => acc.concat(json), []);

//         res.setHeader('Content-Type', 'application/json');
//         res.send(jsonData);

//         fs.remove(filePath);
//     }catch(err){
//         res.status(500)
//     }
// })

// app.listen(port,()=>{
//     console.log('Le server est démaré PORT',port)
// })
