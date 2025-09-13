import OpenAI from "openai";
import type { Case, InsertAiPrediction } from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface SeverityAnalysis {
  severity: "Low" | "Medium" | "High" | "Critical";
  confidence: number;
  reasoning: string;
  riskFactors: string[];
}

export interface CaseRecommendations {
  immediateActions: string[];
  followUpRequired: string[];
  regulatoryNotifications: string[];
  additionalDataNeeded: string[];
}

export interface AIAnalysisResult {
  severity: SeverityAnalysis;
  recommendations: CaseRecommendations;
  confidence: number;
  processingTime: number;
}

/**
 * AI-powered pharmacovigilance case analysis service
 * Provides severity assessment and recommendations for adverse drug reactions
 */
export class AIAnalysisService {
  private modelName = "gpt-5";
  private modelVersion = "2025-08-07";

  /**
   * Analyzes a pharmacovigilance case for severity and provides recommendations
   */
  async analyzeCase(caseData: Case): Promise<AIAnalysisResult> {
    const startTime = Date.now();

    try {
      const systemPrompt = this.buildSystemPrompt();
      const userPrompt = this.buildUserPrompt(caseData);

      const response = await openai.chat.completions.create({
        model: this.modelName,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        // Note: gpt-5 only supports default temperature
      });

      const analysisResult = JSON.parse(response.choices[0].message.content || "{}");
      const processingTime = (Date.now() - startTime) / 1000;

      return {
        severity: {
          severity: this.validateSeverity(analysisResult.severity?.level),
          confidence: Math.max(0, Math.min(1, analysisResult.severity?.confidence || 0)),
          reasoning: analysisResult.severity?.reasoning || "No reasoning provided",
          riskFactors: Array.isArray(analysisResult.severity?.riskFactors) 
            ? analysisResult.severity.riskFactors 
            : []
        },
        recommendations: {
          immediateActions: Array.isArray(analysisResult.recommendations?.immediateActions)
            ? analysisResult.recommendations.immediateActions
            : [],
          followUpRequired: Array.isArray(analysisResult.recommendations?.followUpRequired)
            ? analysisResult.recommendations.followUpRequired
            : [],
          regulatoryNotifications: Array.isArray(analysisResult.recommendations?.regulatoryNotifications)
            ? analysisResult.recommendations.regulatoryNotifications
            : [],
          additionalDataNeeded: Array.isArray(analysisResult.recommendations?.additionalDataNeeded)
            ? analysisResult.recommendations.additionalDataNeeded
            : []
        },
        confidence: Math.max(0, Math.min(1, analysisResult.overallConfidence || 0)),
        processingTime
      };
    } catch (error) {
      console.error("AI analysis error:", error);
      throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Creates an AI prediction record for storage
   */
  async createPredictionRecord(
    caseId: string, 
    analysisResult: AIAnalysisResult
  ): Promise<InsertAiPrediction> {
    return {
      caseId,
      modelName: this.modelName,
      modelVersion: this.modelVersion,
      confidence: analysisResult.confidence.toString(),
      prediction: {
        severity: analysisResult.severity,
        recommendations: analysisResult.recommendations,
        analysisTimestamp: new Date().toISOString()
      },
      recommendation: this.formatRecommendationSummary(analysisResult.recommendations),
      processingTime: analysisResult.processingTime.toString(),
      humanReviewed: false
    };
  }

  private buildSystemPrompt(): string {
    return `You are an expert pharmacovigilance analyst specialized in adverse drug reaction assessment. 

Your role is to analyze adverse drug reaction (ADR) cases according to international pharmacovigilance standards including ICH E2B guidelines and provide:

1. SEVERITY ASSESSMENT: Classify the severity as Low, Medium, High, or Critical based on:
   - Patient safety implications
   - Life-threatening potential
   - Hospitalization requirements
   - Disability or significant incapacity
   - Congenital anomaly/birth defect
   - Death or life-threatening events

2. RECOMMENDATIONS: Provide actionable recommendations for:
   - Immediate actions required
   - Follow-up investigations needed
   - Regulatory notifications required
   - Additional data collection needs

RESPONSE FORMAT: Respond with JSON in this exact structure:
{
  "severity": {
    "level": "Low|Medium|High|Critical",
    "confidence": 0.0-1.0,
    "reasoning": "detailed explanation",
    "riskFactors": ["factor1", "factor2"]
  },
  "recommendations": {
    "immediateActions": ["action1", "action2"],
    "followUpRequired": ["followup1", "followup2"],
    "regulatoryNotifications": ["notification1"],
    "additionalDataNeeded": ["data1", "data2"]
  },
  "overallConfidence": 0.0-1.0
}

Consider Korean pharmaceutical regulations and adverse event reporting standards when applicable.`;
  }

  private buildUserPrompt(caseData: Case): string {
    return `Please analyze this adverse drug reaction case:

CASE DETAILS:
- Case Number: ${caseData.caseNumber}
- Patient: ${caseData.patientAge}세 ${caseData.patientGender}
- Drug: ${caseData.drugName}${caseData.drugDosage ? ` (${caseData.drugDosage})` : ''}
- Adverse Reaction: ${caseData.adverseReaction}
- Reaction Description: ${caseData.reactionDescription || 'Not provided'}
- Current Severity: ${caseData.severity}
- Current Status: ${caseData.status}
- Date of Reaction: ${caseData.dateOfReaction || 'Not specified'}
- Concomitant Medications: ${caseData.concomitantMeds || 'None reported'}
- Medical History: ${caseData.medicalHistory || 'Not provided'}
- Outcome: ${caseData.outcome || 'Unknown'}
- Report Date: ${caseData.dateReported}

Please provide a comprehensive pharmacovigilance analysis with severity assessment and recommendations according to international standards.`;
  }

  private validateSeverity(severity: string): "Low" | "Medium" | "High" | "Critical" {
    const validSeverities = ["Low", "Medium", "High", "Critical"];
    return validSeverities.includes(severity) ? severity as any : "Medium";
  }

  private formatRecommendationSummary(recommendations: CaseRecommendations): string {
    const sections = [];
    
    if (recommendations.immediateActions.length > 0) {
      sections.push(`즉시 조치: ${recommendations.immediateActions.join(', ')}`);
    }
    
    if (recommendations.followUpRequired.length > 0) {
      sections.push(`후속 조치: ${recommendations.followUpRequired.join(', ')}`);
    }
    
    if (recommendations.regulatoryNotifications.length > 0) {
      sections.push(`규제 당국 보고: ${recommendations.regulatoryNotifications.join(', ')}`);
    }
    
    if (recommendations.additionalDataNeeded.length > 0) {
      sections.push(`추가 데이터 필요: ${recommendations.additionalDataNeeded.join(', ')}`);
    }
    
    return sections.join(' | ') || '추가 권장사항 없음';
  }
}

// Singleton instance
export const aiAnalysisService = new AIAnalysisService();