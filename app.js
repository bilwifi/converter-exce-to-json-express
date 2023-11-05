const express = require("express");
const multer = require("multer");
const excelToJson = require("convert-excel-to-json");
const fs = require("fs-extra");
const bodyParser = require("body-parser");

const app = express();
const port = 8000;

app.use(bodyParser.urlencoded({ extended: true }));
const upload = multer({ dest: "uploads/" });

app.post("/read", upload.single("file"), (req, res) => {
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

    const calculerMontantConversion = (amount) => {
      switch (sous_compte) {
        case "unites":
          return amount;
        case "voix":
          return amount * 60;
        case "data":
          return amount * 1024;
        case "sms":
          return amount; // SMS aussi egale à 1 ??????
        default:
          return 0;
      }
    };

    const ajouterColonnes = (row) => ({
      sous_compte,
      validite: parseInt(validite),
      montant_conversion: calculerMontantConversion(row.amont || 0),
    });

    // let strTxt = ``;
    // const dataFormat = excelData[sheetName || "Feuille 1"].map((row) => {
    //   const r = {
    //     ...row,
    //     ...ajouterColonnes(row),
    //   };

    //   strTxt += `${r.msisdn},${r.compte},${r.amont},${r.montant_conversion},${r.validite};`;
    //   return r;
    // });

    fs.remove(filePath);

    // Vérifier si la requête est faite via un navigateur
    const isBrowser = /(MSIE|Edge|Firefox|Chrome|Safari)/.test(
      req.headers["User-Agent"]
    );

    // Renvoyer un fichier texte à télécharger si la requête est faite via un navigateur
    // if (isBrowser) {
    // const newFilePath = `uploads/${req.file.originalname}_converted.txt`
    //   res.setHeader("Content-Type", "text/csv");
    //   fs.writeFileSync(newFilePath, strTxt);
    //   res.download(newFilePath, strTxt, (err) => {
    //     if (err) throw err;
    //   });
    //   fs.remove(newFilePath); // si tu veux stocker le fichier dans le server pour l'historique : commente cette ligne
    // } else {
    //   // Renvoyer un JSON si la requête n'est pas faite via un navigateur
    //   res.status(200).json(dataFormat);
    // }



    // Retour de Json sans rajouter des colonnes suplemntaire
    res.status(200).json(excelData);

  } catch (err) {
    res.status(500);
  }
});

app.listen(port, () => {
  console.log("Le server est démaré PORT", port);
});
