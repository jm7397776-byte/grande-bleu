const https = require("https");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const BASE_URL = "api.searchad.naver.com";

function getCredentials() {
  const apiKey = process.env.NAVER_API_KEY;
  const secretKey = process.env.NAVER_SECRET_KEY;
  const customerId = process.env.NAVER_CUSTOMER_ID;
  return { apiKey, secretKey, customerId };
}

function uploadImage(imagePath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(imagePath)) {
      reject(new Error(`파일이 존재하지 않습니다: ${imagePath}`));
      return;
    }

    const { apiKey, secretKey, customerId } = getCredentials();
    const timestamp = String(Date.now());
    const method = "POST";
    const apiPath = "/ncc/files";
    const message = `${timestamp}.${method}.${apiPath}`;
    const signature = crypto.createHmac("sha256", secretKey).update(message).digest("base64");

    const boundary = `----FormBoundary${Date.now()}`;
    const fileName = path.basename(imagePath);
    const fileData = fs.readFileSync(imagePath);

    const header =
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n` +
      `Content-Type: image/${path.extname(imagePath).slice(1)}\r\n\r\n`;
    const footer = `\r\n--${boundary}--\r\n`;

    const headerBuffer = Buffer.from(header);
    const footerBuffer = Buffer.from(footer);
    const body = Buffer.concat([headerBuffer, fileData, footerBuffer]);

    const options = {
      hostname: BASE_URL,
      path: apiPath,
      method,
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        "Content-Length": body.length,
        "X-Timestamp": timestamp,
        "X-API-KEY": apiKey,
        "X-Customer": customerId,
        "X-Signature": signature,
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data ? JSON.parse(data) : null);
        } else {
          reject(new Error(`이미지 업로드 오류 [${res.statusCode}]: ${data}`));
        }
      });
    });

    req.on("error", (err) => {
      reject(new Error(`네트워크 오류: ${err.message}`));
    });

    req.write(body);
    req.end();
  });
}

function listImages(imagesDir) {
  if (!fs.existsSync(imagesDir)) {
    return [];
  }

  const validExtensions = [".jpg", ".jpeg", ".png", ".gif"];
  return fs
    .readdirSync(imagesDir)
    .filter((file) => validExtensions.includes(path.extname(file).toLowerCase()))
    .map((file) => ({
      name: file,
      path: path.join(imagesDir, file),
      size: fs.statSync(path.join(imagesDir, file)).size,
    }));
}

function uploadAllImages(imagesDir) {
  const images = listImages(imagesDir);
  if (images.length === 0) {
    return Promise.resolve({ uploaded: 0, results: [] });
  }

  const uploads = images.map((img) =>
    uploadImage(img.path)
      .then((result) => ({ file: img.name, status: "success", result }))
      .catch((err) => ({ file: img.name, status: "failed", error: err.message })),
  );

  return Promise.all(uploads).then((results) => ({
    uploaded: results.filter((r) => r.status === "success").length,
    failed: results.filter((r) => r.status === "failed").length,
    results,
  }));
}

module.exports = {
  uploadImage,
  listImages,
  uploadAllImages,
};
