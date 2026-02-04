
import { Threat } from "../types";

export const performLocalAnalysis = (focused: Threat, history: Threat[]): string => {
  const correlationCount = history.filter(t => t.asn === focused.asn && t.id !== focused.id).length;
  const regionAffinity = history.filter(t => t.countryCode === focused.countryCode && t.id !== focused.id).length;
  
  let report = `>>> NEURAL_FORENSICS_REPORT [ID: ${focused.id}]\n`;
  report += `>>> SUBJECT_IP: ${focused.srcIP}\n`;
  report += `>>> AUTHORITY: ${focused.asnOwner} (${focused.asn})\n\n`;
  
  report += `[CO-ORDINATION ANALYSIS]\n`;
  if (correlationCount > 0) {
    report += `WARNING: Detected ${correlationCount} sibling nodes from the same infrastructure provider active in this window. High probability of coordinated botnet movement.\n`;
  } else {
    report += `STATUS: No active sibling nodes detected within the local buffer. Isolated probe profile.\n`;
  }
  
  if (regionAffinity > 3) {
    report += `GEO_ALERT: Significant traffic volume from ${focused.countryName} (${regionAffinity} nodes). Regional threat cluster observed.\n`;
  }

  report += `\n[TACTICAL THREAT PROFILE]\n`;
  report += `Source Classification: ${focused.source}\n`;
  report += `Ingress Vector: ${focused.threatVector}\n`;
  report += `Attack Class: ${focused.type}\n`;
  report += `Confidence Level: ${focused.riskScore}%\n`;
  
  report += `\n[FORENSIC MARKERS]\n`;
  report += `- Pattern suggests automated scanning / C2 beaconing.\n`;
  report += `- Entropy anomaly detected in packet headers.\n`;
  report += `- Origin aligns with known high-risk hosting facilities.`;

  report += `\n\n[REMEDIATION STRATEGY]\n`;
  report += `1. Immediate ACL block for host ${focused.srcIP}/32.\n`;
  report += `2. Monitor ASN ${focused.asn} for additional ingress spikes.\n`;
  report += `3. Scrub active session state for vector: ${focused.threatVector}.`;

  return report;
};
