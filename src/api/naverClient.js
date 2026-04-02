require("dotenv").config();
const crypto = require("crypto");
const https = require("https");

const BASE_URL = "api.searchad.naver.com";

function getCredentials() {
  const apiKey = process.env.NAVER_API_KEY;
  const secretKey = process.env.NAVER_SECRET_KEY;
  const customerId = process.env.NAVER_CUSTOMER_ID;

  if (!apiKey || !secretKey || !customerId) {
    throw new Error(
      "네이버 API 인증 정보가 없습니다. .env 파일에 NAVER_API_KEY, NAVER_SECRET_KEY, NAVER_CUSTOMER_ID를 설정하세요.",
    );
  }

  return { apiKey, secretKey, customerId };
}

function generateSignature(timestamp, method, path, secretKey) {
  const message = `${timestamp}.${method}.${path}`;
  return crypto.createHmac("sha256", secretKey).update(message).digest("base64");
}

function buildHeaders(method, path) {
  const { apiKey, secretKey, customerId } = getCredentials();
  const timestamp = String(Date.now());
  const signature = generateSignature(timestamp, method, path, secretKey);

  return {
    "Content-Type": "application/json; charset=UTF-8",
    "X-Timestamp": timestamp,
    "X-API-KEY": apiKey,
    "X-Customer": customerId,
    "X-Signature": signature,
  };
}

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const headers = buildHeaders(method, path);
    const options = {
      hostname: BASE_URL,
      path,
      method,
      headers,
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
          reject(new Error(`API 오류 [${res.statusCode}]: ${data}`));
        }
      });
    });

    req.on("error", (err) => {
      reject(new Error(`네트워크 오류: ${err.message}`));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

function get(path) {
  return request("GET", path);
}

function post(path, body) {
  return request("POST", path, body);
}

function put(path, body) {
  return request("PUT", path, body);
}

function del(path) {
  return request("DELETE", path);
}

module.exports = {
  get,
  post,
  put,
  del,
  getCredentials,
  generateSignature,
  buildHeaders,
};
