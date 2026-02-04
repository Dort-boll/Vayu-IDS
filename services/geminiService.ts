
/**
 * Gemini Forensic Analysis Service (DEPRECATED)
 * Service disabled to prevent quota exhaustion errors (429).
 * Use services/forensicEngine.ts for local analysis.
 */
import { Threat } from "../types";

export const analyzeThreat = async (focused: Threat, history: Threat[]): Promise<string> => {
  return "ANALYSIS_ENGINE_OFFLINE: Use Local Forensic Engine.";
};
