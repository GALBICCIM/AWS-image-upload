import React, { useState } from "react";

const ImageUpload: React.FC = () => {
   const [file, setFile] = useState<File | null>(null);
   const [preview, setPreview] = useState<string>("");
   const [message, setMessage] = useState<string>("");

   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
         const selectedFile = e.target.files[0];

         setFile(selectedFile);
         setPreview(URL.createObjectURL(selectedFile));
      }
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!file) {
         setMessage("사진을 선택해 주세요.");

         return;
      }

      const formData = new FormData();
      formData.append("image", file);

      try {
         const response = await fetch("http://localhost:3000/upload", {
            method: "POST",
            body: formData,
         });
         const result = await response.json();

         setMessage(result.message || "업로드를 성공적으로 완료했습니다.");
      } catch (e) {
         setMessage("파일을 올리는 데에 문제가 생겼습니다.");
         console.error(e);
      }
   };

   return (
      <div>
         <h1>이미지 업로드하기</h1>

         {preview && <img src={preview} alt="Preview" style={{ maxWidth: "200px" }} />}
         {message && <p>{message}</p>}
         <form onSubmit={handleSubmit}>
            <input type="file" accept="image/" onChange={handleFileChange} style={{ marginBottom: "30px" }} />
            <br />
            <button type="submit">제출하기</button>
         </form>
      </div>
   );
};

export default ImageUpload;
