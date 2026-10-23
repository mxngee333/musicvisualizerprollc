import { db } from './firebase.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export class LicenseManager {
  constructor() {
    this.maxExports = 7;
    this.licenseKeyStore = '_mvp_lic'; // Obfuscated key name
    this._deviceHash = null; // Cache the hash so we don't fetch IP repeatedly
  }

  // Generates a deep server-side fingerprint utilizing IP Address + Browser fingerprinting
  // This makes it virtually impossible for casual users to bypass via cache clearing
  async _getStorageKey() {
    if (this._deviceHash) return this._deviceHash;
    
    let ip = "0.0.0.0";
    try {
      // Fetch public IP
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      ip = data.ip;
    } catch (e) {
      console.warn("Could not fetch IP, falling back to browser-only fingerprint");
    }

    const dataStr = [
      ip,
      navigator.userAgent,
      screen.width,
      screen.height,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      navigator.hardwareConcurrency || 1,
      navigator.language
    ].join('|');
    
    // Simple fast hash
    let hash = 0;
    for (let i = 0; i < dataStr.length; i++) {
      const char = dataStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    this._deviceHash = '_auth_' + Math.abs(hash).toString(16);
    return this._deviceHash;
  }

  async getExportCount() {
    try {
      const hash = await this._getStorageKey();
      const docRef = doc(db, 'usage_limits', hash);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data().exports || 0;
      }
    } catch (e) {
      console.error("Firestore read error:", e);
    }
    
    // Fallback to local storage if DB fails or is offline
    const val = localStorage.getItem(await this._getStorageKey());
    return val ? parseInt(val, 10) : 0;
  }

  async incrementExportCount() {
    try {
      const current = await this.getExportCount();
      const hash = await this._getStorageKey();
      
      // Update local storage as a backup
      localStorage.setItem(hash, current + 1);

      // Update Firestore securely (survives cache clears)
      const docRef = doc(db, 'usage_limits', hash);
      await setDoc(docRef, { exports: current + 1 }, { merge: true });
    } catch (e) {
      console.error("Firestore write error:", e);
    }
  }

  hasValidLicense() {
    return localStorage.getItem(this.licenseKeyStore) === 'true';
  }

  async canExport() {
    if (this.hasValidLicense()) return true;
    const count = await this.getExportCount();
    return count < this.maxExports;
  }

  // Verifies the license key via Gumroad API
  async verifyGumroadKey(productId, licenseKey) {
    try {
      const formData = new URLSearchParams();
      formData.append('product_id', productId);
      formData.append('license_key', licenseKey);

      const response = await fetch('https://api.gumroad.com/v2/licenses/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      });

      const data = await response.json();
      
      // If success is true and the purchase wasn't refunded or charged back
      if (data.success && data.purchase && !data.purchase.refunded && !data.purchase.chargebacked) {
        localStorage.setItem(this.licenseKeyStore, 'true');
        return { success: true };
      }
      return { success: false, message: data.message || "Invalid or refunded license key." };
    } catch (e) {
      console.error("Gumroad Verification Error:", e);
      return { success: false, message: "Network error. Could not reach Gumroad." };
    }
  }
}
