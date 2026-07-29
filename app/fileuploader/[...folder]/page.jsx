import FileUploader from "@/components/FileUploader";

export default function FileUploaderPage({ params }) {
  const folderPath = params.folder.join("/");
  return <FileUploader folderPath={folderPath} />;
}
