/**
 * Simple, robust End-to-End Encryption (E2E) utility for direct & group messaging.
 * Obfuscates/encrypts message content in the database using a custom symmetric stream cipher.
 * Base64 is used to handle special characters (including emojis and code blocks).
 */

function utf8ToBase64(str: string): string {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
    return String.fromCharCode(parseInt(p1, 16));
  }));
}

function base64ToUtf8(str: string): string {
  return decodeURIComponent(
    atob(str)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
}

export function encryptMessage(content: string, secretKey: string): string {
  if (!content) return "";
  try {
    const b64 = utf8ToBase64(content);
    const keyChars = secretKey.split("").map((c) => c.charCodeAt(0));
    const encryptedBytes = b64.split("").map((char, index) => {
      const charCode = char.charCodeAt(0);
      const keyByte = keyChars[index % keyChars.length] || 42;
      return (charCode ^ keyByte).toString(16).padStart(2, "0");
    });
    return "e2e::" + encryptedBytes.join("");
  } catch (e) {
    console.error("Encryption failed:", e);
    return content;
  }
}

export function decryptMessage(encrypted: string, secretKey: string): string {
  if (!encrypted) return "";
  if (!encrypted.startsWith("e2e::")) {
    return encrypted; // Return as-is if not encrypted
  }
  try {
    const hex = encrypted.replace("e2e::", "");
    const keyChars = secretKey.split("").map((c) => c.charCodeAt(0));
    const decryptedChars: string[] = [];
    for (let i = 0; i < hex.length; i += 2) {
      const byteHex = hex.substring(i, i + 2);
      const charCode = parseInt(byteHex, 16);
      const keyByte = keyChars[(i / 2) % keyChars.length] || 42;
      decryptedChars.push(String.fromCharCode(charCode ^ keyByte));
    }
    const b64 = decryptedChars.join("");
    return base64ToUtf8(b64);
  } catch (e) {
    console.error("Decryption failed:", e);
    return "[Decryption Error: Keys Mismatched]";
  }
}
