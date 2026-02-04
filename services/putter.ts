
import { Threat, ThreatSeverity } from "../types";

/**
 * Putter.ts Framework
 * Optimized for fetching and normalizing global threat data from Abuse.ch
 */

const THREATFOX_API = "https://threatfox-api.abuse.ch/api/v1/";
const URLHAUS_RECENT = "https://urlhaus-api.abuse.ch/v1/urls/recent/";

export class Putter {
  static async fetchThreatFox(): Promise<Partial<Threat>[]> {
    try {
      const response = await fetch(THREATFOX_API, {
        method: "POST",
        body: JSON.stringify({ query: "get_iocs", days: 1 })
      });
      
      if (!response.ok) throw new Error("Network response was not ok");
      
      const data = await response.json();
      if (data.query_status !== "ok") return [];
      
      return data.data.slice(0, 15).map((ioc: any) => ({
        id: ioc.id.toString(),
        srcIP: ioc.ioc.split(':')[0],
        type: ioc.threat_type_desc || ioc.threat_type,
        severity: ioc.confidence_level > 85 ? ThreatSeverity.CRITICAL : 
                  ioc.confidence_level > 60 ? ThreatSeverity.HIGH : ThreatSeverity.MEDIUM,
        source: "THREATFOX",
        asn: ioc.asn || "N/A",
        asnOwner: ioc.as_name || "Unknown Authority",
        countryCode: ioc.country || "??",
        riskScore: ioc.confidence_level || 50,
        threatVector: ioc.threat_type || "Network IOC",
      }));
    } catch (e) {
      console.warn("Putter: ThreatFox fetch failed or CORS blocked. Returning empty.");
      return [];
    }
  }

  static async fetchURLhaus(): Promise<Partial<Threat>[]> {
    try {
      const response = await fetch(URLHAUS_RECENT);
      if (!response.ok) throw new Error("URLhaus network response was not ok");
      const data = await response.json();
      if (data.query_status !== "ok") return [];

      return data.urls.slice(0, 15).map((url: any) => ({
        id: url.id.toString(),
        srcIP: new URL(url.url).hostname,
        type: `Malware: ${url.threat || 'Payload'}`,
        severity: ThreatSeverity.HIGH,
        source: "URLHAUS",
        asn: url.asn || "N/A",
        asnOwner: url.as_name || "Unknown Authority",
        countryCode: url.countrycode || "??",
        riskScore: 92,
        threatVector: "HTTP_PAYLOAD",
      }));
    } catch (e) {
      return [];
    }
  }
}
