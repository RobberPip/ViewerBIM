using System;
using System.IO;
using System.Threading.Tasks;
using Autodesk.Revit.DB;
using Autodesk.Revit.UI;
using Autodesk.Revit.DB.IFC;
using Amazon;
using Amazon.S3;
using Amazon.S3.Model;
using System.Windows;

namespace LoaderPlugin.Commands
{
    public class ExportIfcAndUpload
    {
        private const string accessKey = "YCAJETDZVTVvaW6_nEMU5gjoH";
        private const string secretKey = "YCPYGKRnv2drQPsur9osqiU2Xorcz0FbwElPL0QD";
        private const string bucketName = "bimline";
        private static readonly RegionEndpoint region = RegionEndpoint.USEast1;

        public Result Execute(ExternalCommandData commandData, ref string message, ElementSet elements)
        {
            try
            {
                Document doc = commandData.Application.ActiveUIDocument.Document;
                string tempPath = Path.GetTempPath();
                string fileName = doc.Title + ".ifc";
                string ifcFilePath = Path.Combine(tempPath, fileName);

                // Указываем имя каталога (папки) для файла
                string directoryName = "yourFolderName/"; // укажите имя каталога
                string ifcFilePathInFolder = Path.Combine(tempPath, directoryName, fileName);

                // Создаем каталог в локальной системе перед экспортом (если нужно)
                string folderPath = Path.Combine(tempPath, directoryName);
                if (!Directory.Exists(folderPath))
                {
                    Directory.CreateDirectory(folderPath);
                }

                using (Transaction tx = new Transaction(doc, "Export IFC"))
                {
                    tx.Start();
                    ExportIFC(doc, ifcFilePathInFolder);
                    tx.Commit();
                }

                Task.Run(() => UploadToS3(ifcFilePathInFolder, directoryName)).Wait();
                Task.Run(() => File.Delete(ifcFilePathInFolder));

                // Создаем постоянную ссылку
                string permanentDownloadUrl = GetPermanentDownloadUrl(directoryName, fileName);
                message = $"Файл успешно загружен. Ссылка для скачивания: {permanentDownloadUrl}";

                MessageBox.Show(message);
                return Result.Succeeded;
            }
            catch (Exception ex)
            {
                message = ex.Message;
                return Result.Failed;
            }
        }

        private void ExportIFC(Document doc, string filePath)
        {
            IFCExportOptions options = new IFCExportOptions { FileVersion = IFCVersion.IFC4x3 };
            doc.Export(Path.GetDirectoryName(filePath), Path.GetFileName(filePath), options);
        }

        private async Task UploadToS3(string filePath, string directoryName)
        {
            var config = new AmazonS3Config
            {
                ServiceURL = "https://s3.yandexcloud.net", // для Yandex Cloud
            };

            using (var client = new AmazonS3Client(accessKey, secretKey, config))
            {
                await UploadFileAsync(client, bucketName, filePath, directoryName);
            }
        }

        private static async Task UploadFileAsync(AmazonS3Client client, string bucketName, string filePath, string directoryName)
        {
            // Добавляем "папку" в ключ объекта
            var key = directoryName + Path.GetFileName(filePath); // ключ с папкой
            var request = new PutObjectRequest
            {
                BucketName = bucketName,
                Key = key,
                FilePath = filePath,
                CannedACL = S3CannedACL.PublicRead // Делает файл публичным
            };

            await client.PutObjectAsync(request);
        }

        // Метод для получения постоянной ссылки на файл
        private string GetPermanentDownloadUrl(string directoryName, string fileName)
        {
            // Стандартный URL для доступа к файлу
            return $"https://{bucketName}.s3.yandexcloud.net/{directoryName}{fileName}";
        }
    }
}
