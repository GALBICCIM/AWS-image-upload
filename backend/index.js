const express = require("express");
const multer = require("multer");
const AWS = require("aws-sdk");
const fs = require("fs");
const { KeyObject } = require("crypto");

require("dotenv").config();

const app = express();
const PORT = 3000;

const storage = multer.diskStorage({
   destination: "uploads/",
   filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
   },
});
const upload = multer({ storage });
const s3 = new AWS.S3({
   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
   region: process.env.AWS_REGION,
});

const uploadS3 = (filePath, bucketName, key) => {
   const fileContent = fs.readFileSync(filePath);

   return s3
      .upload({
         Bucket: bucketName,
         Key: key,
         Body: fileContent,
      })
      .promise();
};

app.post("/upload", upload.single("image"), async (req, res) => {
   try {
      const file = req.file;

      if (!file) {
         return res.status(400).send({ message: "업로드된 파일이 없습니다." });
      }

      const filePath = file.path;
      const key = file.filename;

      await uploadS3(filePath, process.env.AWS_BUCKET_NAME, key);

      if (process.env.AWS_BACKUP_NAME) {
         await uploadS3(filePath, process.env.AWS_BUCKET_NAME, key);
      }

      fs.unlinkSync(filePath); // 로컬 파일 삭제

      res.status(200).send({ message: "파일 업로드 및 백업이 성공적으로 완료됐습니다." });
   } catch (e) {
      console.error(e);
      res.status(500).send({ message: "파일을 업로드하는 데에 문제가 생겼습니다." });
   }
});

app.listen(PORT, () => console.log(`Running on http://localhost:${PORT}`));
