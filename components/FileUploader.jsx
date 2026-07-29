"use client";

import { useState, useRef } from "react";

const FileUploader = ({ folderPath, setImageUrl = () => {} }) => {
  const fileInputRef = useRef(null);
  const [uploadedData, setUploadedData] = useState([]);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const handleFileUpload = async () => {
    if (!fileInputRef.current?.files.length) {
      alert("Please select files to upload.");
      return;
    }

    const files = fileInputRef.current.files;
    const uploadedResponses = [];
    const encodedFolderPath = encodeURIComponent(folderPath);

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const originalFileName = file.name.replace(/\.[^/.]+$/, "");
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload?folder=${encodedFolderPath}&public_id=${encodeURIComponent(
        originalFileName
      )}`;

      try {
        const response = await fetch(uploadUrl, { method: "POST", body: formData });
        const data = await response.json();
        if (data.secure_url) uploadedResponses.push(data);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }

    if (uploadedResponses.length > 0) {
      setUploadedData((prev) => [...prev, ...uploadedResponses]);
      setImageUrl(uploadedResponses[0]?.secure_url);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white p-5 sm:p-12">
      <h3 className="mb-4 text-xl font-bold text-text">Uploading to: {folderPath}</h3>

      <div className="flex items-center gap-3">
        <input
          type="file"
          ref={fileInputRef}
          multiple
          className="w-full rounded-lg border border-card-border px-3.5 py-2.5 text-sm text-text"
        />
        <button
          type="button"
          onClick={handleFileUpload}
          className="shrink-0 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover"
        >
          Upload
        </button>
      </div>

      <div id="data">
        <div className="mt-4 mb-8 flex flex-wrap gap-3">
          {uploadedData.map((data, index) => (
            <div key={index} className="w-[calc(25%-9px)] overflow-hidden rounded-lg border border-card-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.secure_url} alt={data.original_filename} className="w-full p-3" />
              <div className="bg-[#0f172a] px-3 py-2 text-xs text-white">{data.original_filename}</div>
            </div>
          ))}
        </div>

        {uploadedData.map((data, index) => (
          <div key={index}>
            <p className="mb-2 text-sm">
              <b>Stored URL: </b>
              <a href={data.secure_url} target="_blank" rel="noopener noreferrer" className="text-accent underline">
                {data.secure_url}
              </a>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileUploader;
