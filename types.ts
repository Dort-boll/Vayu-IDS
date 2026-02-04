
export enum ThreatSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export interface Threat {
  id: string;
  timestamp: number;
  srcIP: string;
  type: string;
  severity: ThreatSeverity;
  source: string;
  neuralScore: number;
  riskScore: number;
  asn: string;
  asnOwner: string;
  countryCode: string;
  countryName: string;
  coordinates: string;
  lat: string;
  lon: string;
  threatVector: string;
  firstSeen: string;
}

export interface NeuralStats {
  threatCount: number;
  abuseCount: number;
  accuracy: number;
  entropy: number;
  uptime: number;
}
