
import { Threat, ThreatSeverity } from "../types";
import { Putter } from "./putter";

const GEO_DATA: Record<string, { name: string; lat: string; lon: string }> = {
  "DE": { name: "Germany", lat: "52.52", lon: "13.40" },
  "RU": { name: "Russia", lat: "55.75", lon: "37.61" },
  "US": { name: "USA", lat: "37.77", lon: "-122.41" },
  "CN": { name: "China", lat: "39.90", lon: "116.40" },
  "IN": { name: "India", lat: "28.61", lon: "77.20" },
  "BR": { name: "Brazil", lat: "-23.55", lon: "-46.63" },
  "KP": { name: "North Korea", lat: "39.03", lon: "125.75" },
  "UA": { name: "Ukraine", lat: "50.45", lon: "30.52" },
  "GB": { name: "UK", lat: "51.50", lon: "-0.12" },
  "FR": { name: "France", lat: "48.85", lon: "2.35" },
  "NL": { name: "Netherlands", lat: "52.36", lon: "4.89" },
  "IL": { name: "Israel", lat: "31.76", lon: "35.21" },
  "JP": { name: "Japan", lat: "35.67", lon: "139.65" },
  "??": { name: "Deep Web Proxy", lat: "0.00", lon: "0.00" }
};

const ATTACK_TYPES = [
  "Ransomware_C2_Beacon",
  "Advanced_Phishing_Link",
  "Botnet_Drone_Poll",
  "SQL_Injection_Probe",
  "Zero_Day_Exploit_Scan",
  "Brute_Force_Attempt",
  "Cryptominer_Payload",
  "Lateral_Movement_Sync"
];

const generateRandomIP = () => {
  return Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.');
};

export const createMockThreat = (): Threat => {
  const codes = Object.keys(GEO_DATA);
  const countryCode = codes[Math.floor(Math.random() * codes.length)];
  const geo = GEO_DATA[countryCode];
  const severity = Math.random() > 0.85 ? ThreatSeverity.CRITICAL : ThreatSeverity.HIGH;

  return {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: Date.now(),
    srcIP: generateRandomIP(),
    type: ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)],
    severity,
    source: "VAYU_HEURISTICS",
    neuralScore: 0.85 + (Math.random() * 0.1),
    riskScore: Math.floor(Math.random() * 30 + 70),
    asn: "AS" + Math.floor(Math.random() * 90000 + 1000),
    asnOwner: "Heuristic Cloud Compute",
    countryCode,
    countryName: geo.name,
    coordinates: `${geo.lat}, ${geo.lon}`,
    lat: geo.lat,
    lon: geo.lon,
    threatVector: "Heuristic Network Anomaly",
    firstSeen: new Date().toISOString()
  };
};

export class NeuralBus {
  private channel: BroadcastChannel;

  constructor() {
    this.channel = new BroadcastChannel('vayu_ids_threat_stream');
  }

  pub(threat: Threat) {
    this.channel.postMessage(threat);
  }

  sub(callback: (threat: Threat) => void) {
    this.channel.onmessage = (event) => {
      callback(event.data);
    };
  }

  async fetchLiveIntelligence(): Promise<Threat> {
    try {
      const realData = await Putter.fetchThreatFox();
      
      if (realData.length > 0) {
        const item = realData[Math.floor(Math.random() * realData.length)];
        const countryCode = item.countryCode || "??";
        const geo = GEO_DATA[countryCode] || GEO_DATA["??"];
        
        return {
          id: item.id?.toString() || Math.random().toString(36),
          timestamp: Date.now(),
          srcIP: item.srcIP || generateRandomIP(),
          type: item.type || ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)],
          severity: item.severity || ThreatSeverity.HIGH,
          source: item.source || "ABUSE.CH",
          neuralScore: 0.92,
          riskScore: item.riskScore || 88,
          asn: item.asn || "N/A",
          asnOwner: item.asnOwner || "Authority Node",
          countryCode,
          countryName: geo.name,
          coordinates: `${geo.lat}, ${geo.lon}`,
          lat: geo.lat,
          lon: geo.lon,
          threatVector: item.threatVector || "Live Network Probe",
          firstSeen: new Date().toISOString()
        };
      }
    } catch (e) {
      console.warn("NeuralBus: Live feed sync failed, falling back to heuristics.");
    }

    return createMockThreat();
  }
}
