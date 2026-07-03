import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.ENCRYPTION_KEY || "default-secret-key-32-bytes!!";

export function encrypt(text: string): string {
    return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
}

export function decrypt(encrypted: string): string {
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
}

export function encryptArray(arr: string[]): string[] {
    return arr.map(item => encrypt(item));
}

export function decryptArray(arr: string[]): string[] {
    return arr.map(item => decrypt(item));
}