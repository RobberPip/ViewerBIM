using System;
using System.IO;
using System.Threading.Tasks;
using Amazon;
using Amazon.S3;
using Amazon.S3.Transfer;
using Amazon.S3.Model;

namespace Projects
{
    public static class FileBase
    {
        public static async Task<string> UploadToS3(Stream inputStream, string fileName, string s3Folder, string projectFoleder)
        {
            var accessKey = Environment.GetEnvironmentVariable("AWS_ACCESS_KEY");
            var secretKey = Environment.GetEnvironmentVariable("AWS_SECRET_KEY");
            var bucketName = Environment.GetEnvironmentVariable("AWS_BUCKET_NAME");

            if (string.IsNullOrWhiteSpace(accessKey) ||
                string.IsNullOrWhiteSpace(secretKey) ||
                string.IsNullOrWhiteSpace(bucketName))
            {
                throw new InvalidOperationException("Yandex Object Storage credentials are missing in environment variables.");
            }

            // Формируем временную метку: год/месяц-день (например: 2025/05-27)
            string timestampFolder = DateTime.UtcNow.ToString("yyyy/MM-dd");

            // Формируем ключ (путь к объекту в бакете)
            string key = $"{s3Folder}/{projectFoleder}/{timestampFolder}/{fileName}".Replace("\\", "/");

            var config = new AmazonS3Config
            {
                ServiceURL = "https://s3.yandexcloud.net",
                ForcePathStyle = true
            };

            using var client = new AmazonS3Client(accessKey, secretKey, config);

            var uploadRequest = new TransferUtilityUploadRequest
            {
                InputStream = inputStream,
                BucketName = bucketName,
                Key = key,
                CannedACL = S3CannedACL.PublicRead
            };

            try
            {
                var transferUtility = new TransferUtility(client);
                await transferUtility.UploadAsync(uploadRequest);
            }
            catch (AmazonS3Exception s3Ex)
            {
                Console.WriteLine($"[Yandex S3 ERROR] {s3Ex.Message} ({s3Ex.StatusCode})");
                throw;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[UPLOAD ERROR] {ex.Message}");
                throw;
            }

            return $"https://{bucketName}.s3.yandexcloud.net/{key}";
        }
    }
}
