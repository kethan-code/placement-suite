export type AnswerValidationCategory = 'PARROT' | 'IRRELEVANT' | 'PARTIAL' | 'MEANINGFUL';

export interface TurnEvaluation {
  question: string;
  answer: string;
  classification: AnswerValidationCategory;
  critique: string;
}

export interface MockHrEvaluation {
  answerValidation: AnswerValidationCategory;
  validationReason: string;
  overallScore: number;
  scores: {
    communication: number;
    confidence: number;
    problemSolving: number;
    behavioralFit: number;
  };
  feedbackSummary: string;
  strengths: string[];
  areasForImprovement: string[];
  proTipForNextInterview: string;
  questionEvaluations: TurnEvaluation[];
}

export const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'to', 'of', 'in', 'for',
  'on', 'with', 'at', 'by', 'from', 'up', 'about', 'into', 'over', 'after',
  'what', 'which', 'who', 'whom', 'whose', 'this', 'that', 'these', 'those',
  'am', 'it', 'its', 'can', 'could', 'will', 'would', 'shall', 'should',
  'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'so',
  'um', 'uh', 'you', 'your', 'yours', 'yourself', 'my', 'myself', 'me', 'i',
  'tell', 'describe', 'share', 'explain', 'give', 'one', 'some'
]);

export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractTokens(text: string): string[] {
  return normalizeText(text)
    .split(' ')
    .filter(t => t.length > 1);
}

export function extractKeywords(text: string): string[] {
  return extractTokens(text).filter(t => !STOP_WORDS.has(t));
}

/**
 * Checks if candidate is echoing or repeating the interviewer's question.
 * Crucially differentiates pure repetition (PARROT) from repetition followed by an answer.
 */
export function detectQuestionEcho(question: string, answer: string): {
  isEcho: boolean;
  hasSubstantiveAnswer: boolean;
  overlapRatio: number;
  newKeywords: string[];
} {
  const normQ = normalizeText(question);
  const normA = normalizeText(answer);

  if (!normA) {
    return { isEcho: false, hasSubstantiveAnswer: false, overlapRatio: 0, newKeywords: [] };
  }

  // Exact or identical match
  if (normQ === normA) {
    return { isEcho: true, hasSubstantiveAnswer: false, overlapRatio: 1.0, newKeywords: [] };
  }

  const qKeywords = extractKeywords(question);
  const aKeywords = extractKeywords(answer);
  const qTokens = extractTokens(question);
  const aTokens = extractTokens(answer);

  const qKeywordSet = new Set(qKeywords);
  const qTokenSet = new Set(qTokens);

  // New keywords in answer not present in question
  const newKeywords = aKeywords.filter(k => !qKeywordSet.has(k));

  // Compute token overlap ratio
  const matchingTokens = aTokens.filter(t => qTokenSet.has(t));
  const overlapRatio = aTokens.length > 0 ? matchingTokens.length / aTokens.length : 0;

  // Interrogative / Question-rephrase patterns (e.g. "Which skill or tool have you learned...")
  const isInterrogativeForm = /^(what|which|can you|how|tell me|who|where|why)\b/i.test(normA) || answer.trim().endsWith('?');

  // Check if answer contains significant substantive new content (e.g. Test 6: question repeated, then Python project explained)
  // If there are 4+ new non-stopword keywords, or distinct technical/project nouns, it's NOT an echo
  const hasSubstantiveAnswer = newKeywords.length >= 4 || (
    newKeywords.length >= 2 && aTokens.length > qTokens.length + 3
  );

  if (hasSubstantiveAnswer) {
    return { isEcho: false, hasSubstantiveAnswer: true, overlapRatio, newKeywords };
  }

  // Pure repetition / rephrase conditions:
  // 1. Overlap is very high (>= 70%) and no substantive new keywords
  if (overlapRatio >= 0.7 && newKeywords.length <= 1) {
    return { isEcho: true, hasSubstantiveAnswer: false, overlapRatio, newKeywords };
  }

  // 2. Rephrased question with no answer (e.g. Test 2: "Which skill or tool have you recently learned on your own outside college?")
  // Almost all keywords match question synonyms (skill, tool, learned, outside, college) and ends or acts as a question without declaring an answer
  if (isInterrogativeForm && newKeywords.length <= 2 && overlapRatio >= 0.5) {
    return { isEcho: true, hasSubstantiveAnswer: false, overlapRatio, newKeywords };
  }

  // 3. Answer is extremely short echo (e.g. "Outside coursework", "Taught myself")
  if (aTokens.length <= 4 && overlapRatio >= 0.8 && newKeywords.length === 0) {
    return { isEcho: true, hasSubstantiveAnswer: false, overlapRatio, newKeywords };
  }

  return { isEcho: false, hasSubstantiveAnswer: false, overlapRatio, newKeywords };
}

/**
 * Extracts Q&A pairs from conversation history.
 */
export function extractQAPairs(conversation: { speaker: string; text: string }[]): { question: string; answer: string }[] {
  const pairs: { question: string; answer: string }[] = [];
  let lastQuestion = '';

  for (const item of conversation) {
    if (item.speaker === 'interviewer') {
      lastQuestion = item.text;
    } else if (item.speaker === 'candidate' && lastQuestion) {
      pairs.push({ question: lastQuestion, answer: item.text });
      lastQuestion = '';
    }
  }

  return pairs;
}

/**
 * Deterministically checks a single Q&A pair and assigns preliminary classification.
 */
export function classifyTurn(question: string, answer: string): {
  classification: AnswerValidationCategory;
  reason: string;
} {
  const echo = detectQuestionEcho(question, answer);

  if (echo.isEcho && !echo.hasSubstantiveAnswer) {
    return {
      classification: 'PARROT',
      reason: 'The candidate repeated or paraphrased the interview question without providing an actual answer.'
    };
  }

  const normA = normalizeText(answer);
  const aKeywords = extractKeywords(answer);

  // If answer has substantive answer even if it started with repetition (Test 6)
  if (echo.hasSubstantiveAnswer) {
    // If it contains concrete details and examples (e.g. project, practical, problem)
    const isDetailed = aKeywords.length >= 10 || /(project|developed|built|created|application|solved|system|database|management|experience)/i.test(answer);
    return {
      classification: isDetailed ? 'MEANINGFUL' : 'PARTIAL',
      reason: isDetailed 
        ? 'The candidate provided a relevant, concrete answer with supporting details despite an opening repetition.'
        : 'The candidate provided a relevant response but it lacks deeper detail or examples.'
    };
  }

  // Answer is very short (under 5 words or <= 2 keywords)
  if (aKeywords.length <= 2) {
    return {
      classification: 'PARTIAL',
      reason: 'The answer is too brief or incomplete to demonstrate comprehensive understanding.'
    };
  }

  return {
    classification: 'MEANINGFUL',
    reason: 'The response contains substantive content addressing the topic.'
  };
}

/**
 * Backend Validation & Score Enforcement:
 * Ensures strict enforcement of evaluation rules (1/10 for PARROT / IRRELEVANT,
 * wiping hallucinated strengths, validating and calculating overall rating consistently).
 */
export function enforceEvaluationRules(
  rawEvaluation: any,
  conversation: { speaker: string; text: string }[]
): MockHrEvaluation {
  const qaPairs = extractQAPairs(conversation);

  // Per-turn deterministic check
  const turnEvaluations: TurnEvaluation[] = qaPairs.map((pair, idx) => {
    const turnCheck = classifyTurn(pair.question, pair.answer);
    const aiTurnEval = rawEvaluation?.questionEvaluations?.[idx];

    let finalClassification: AnswerValidationCategory = turnCheck.classification;

    // If deterministic check flags PARROT, strictly enforce it!
    if (turnCheck.classification === 'PARROT') {
      finalClassification = 'PARROT';
    } else if (aiTurnEval?.classification) {
      const aiClass = String(aiTurnEval.classification).toUpperCase().trim();
      if (['PARROT', 'IRRELEVANT', 'PARTIAL', 'MEANINGFUL'].includes(aiClass)) {
        // If AI flagged IRRELEVANT, accept IRRELEVANT
        if (aiClass === 'IRRELEVANT') {
          finalClassification = 'IRRELEVANT';
        } else if (aiClass === 'PARROT') {
          finalClassification = 'PARROT';
        } else if (aiClass === 'PARTIAL' || aiClass === 'MEANINGFUL') {
          // If turn check didn't flag PARROT, honor AI's deeper contextual classification
          finalClassification = aiClass as AnswerValidationCategory;
        }
      }
    }

    let critique = aiTurnEval?.critique || turnCheck.reason;
    if (finalClassification === 'PARROT') {
      critique = 'The response repeated or paraphrased the interview question without providing an actual answer.';
    } else if (finalClassification === 'IRRELEVANT') {
      critique = 'The response does not address the question asked and contains no useful relevant information.';
    }

    return {
      question: pair.question,
      answer: pair.answer,
      classification: finalClassification,
      critique
    };
  });

  // Overall classification logic across turns
  let overallClassification: AnswerValidationCategory = 'MEANINGFUL';

  if (turnEvaluations.length > 0) {
    const parrotCount = turnEvaluations.filter(t => t.classification === 'PARROT').length;
    const irrelevantCount = turnEvaluations.filter(t => t.classification === 'IRRELEVANT').length;
    const partialCount = turnEvaluations.filter(t => t.classification === 'PARTIAL').length;
    const meaningfulCount = turnEvaluations.filter(t => t.classification === 'MEANINGFUL').length;

    // If all turns are parrot, or single turn is parrot
    if (parrotCount === turnEvaluations.length) {
      overallClassification = 'PARROT';
    } else if (irrelevantCount === turnEvaluations.length) {
      overallClassification = 'IRRELEVANT';
    } else if (parrotCount + irrelevantCount === turnEvaluations.length) {
      overallClassification = parrotCount >= irrelevantCount ? 'PARROT' : 'IRRELEVANT';
    } else if (meaningfulCount > 0 && parrotCount === 0 && irrelevantCount === 0) {
      overallClassification = partialCount > meaningfulCount ? 'PARTIAL' : 'MEANINGFUL';
    } else if (meaningfulCount > 0) {
      overallClassification = 'PARTIAL'; // Had some invalid turns but some meaningful
    } else {
      overallClassification = 'PARTIAL';
    }
  }

  // Also check top-level rawEvaluation.answerValidation from AI
  if (rawEvaluation?.answerValidation) {
    const aiOverallClass = String(rawEvaluation.answerValidation).toUpperCase().trim();
    if (['PARROT', 'IRRELEVANT', 'PARTIAL', 'MEANINGFUL'].includes(aiOverallClass)) {
      // Deterministic PARROT override: if candidate strictly parroted, keep PARROT
      const anyTurnParrot = turnEvaluations.some(t => t.classification === 'PARROT');
      const allTurnsInvalid = turnEvaluations.every(t => t.classification === 'PARROT' || t.classification === 'IRRELEVANT');
      
      if (allTurnsInvalid && anyTurnParrot) {
        overallClassification = 'PARROT';
      } else if (allTurnsInvalid) {
        overallClassification = 'IRRELEVANT';
      } else if (aiOverallClass === 'PARROT' || aiOverallClass === 'IRRELEVANT') {
        overallClassification = aiOverallClass as AnswerValidationCategory;
      } else if (overallClassification !== 'PARROT' && overallClassification !== 'IRRELEVANT') {
        overallClassification = aiOverallClass as AnswerValidationCategory;
      }
    }
  }

  // ------------------------------------------------------------------------
  // STRICT SCORING ENFORCEMENT
  // ------------------------------------------------------------------------
  let communication = 1;
  let confidence = 1;
  let problemSolving = 1;
  let behavioralFit = 1;
  let overallScore = 1;

  let feedbackSummary = '';
  let strengths: string[] = [];
  let areasForImprovement: string[] = [];
  let proTip = rawEvaluation?.proTipForNextInterview || 'Structure answers using concrete examples: action taken, tools used, and measurable result.';
  let validationReason = '';

  if (overallClassification === 'PARROT') {
    // ENFORCE EXACTLY 1/10
    communication = 1;
    confidence = 1;
    problemSolving = 1;
    behavioralFit = 1;
    overallScore = 1;
    validationReason = 'Question repeated or echoed without providing an actual answer.';

    feedbackSummary = 'The response repeated the interview question without providing an actual answer. As a result, no relevant knowledge, reasoning, or experience could be demonstrated. To improve, identify a specific skill you learned, explain how you developed it, and provide a practical example of how you used it.';

    // Zero unearned strengths
    strengths = ['No measurable candidate skills or answers demonstrated in this response.'];
    areasForImprovement = [
      'Answer directly in your own words rather than echoing the interviewer\'s question.',
      'State specific tools, technical concepts, or experiences relevant to the topic.',
      'Provide a tangible project or classroom scenario where you applied the concept.'
    ];
    proTip = 'When an interviewer asks a question, pause for 2 seconds to formulate your thoughts, then state your answer directly starting with a concrete experience.';

  } else if (overallClassification === 'IRRELEVANT') {
    // ENFORCE EXACTLY 1/10
    communication = 1;
    confidence = 1;
    problemSolving = 1;
    behavioralFit = 1;
    overallScore = 1;
    validationReason = 'Response does not address the question asked and contains no useful relevant information.';

    feedbackSummary = 'The response was completely unrelated to the interview question asked. To improve, ensure your answer directly focuses on the specific prompt, avoiding off-topic background details.';

    strengths = ['No relevant candidate skills demonstrated for the question asked.'];
    areasForImprovement = [
      'Listen closely to the question\'s core objective before speaking.',
      'Stay strictly focused on the requested topic rather than sharing unrelated information.',
      'If you are unfamiliar with a topic, be honest and mention adjacent tools or concepts you do know.'
    ];
    proTip = 'If an interview question surprises you, don\'t deflect to unrelated topics. It is much better to say: "I haven\'t worked with that specific tool yet, but I have experience with..."';

  } else {
    // PARTIAL or MEANINGFUL: Evaluate fairly from AI or defaults
    const rawScores = rawEvaluation?.scores || {};

    const clamp = (val: any, min: number, max: number, fallback: number) => {
      const num = typeof val === 'number' ? val : parseFloat(val);
      if (isNaN(num)) return fallback;
      return Math.min(Math.max(Math.round(num * 10) / 10, min), max);
    };

    if (overallClassification === 'PARTIAL') {
      // Partial scores should be fair (typically 3 to 6 out of 10)
      communication = clamp(rawScores.communication, 2, 7, 5);
      confidence = clamp(rawScores.confidence, 2, 7, 5);
      problemSolving = clamp(rawScores.problemSolving, 2, 6, 4);
      behavioralFit = clamp(rawScores.behavioralFit, 2, 7, 4.5);
      validationReason = 'Answer contains relevant elements but lacks sufficient depth, explanation, or examples.';
      
      feedbackSummary = rawEvaluation?.feedbackSummary || 'The response addressed parts of the question but lacked concrete examples, depth of reasoning, or supporting evidence.';
      strengths = Array.isArray(rawEvaluation?.strengths) && rawEvaluation.strengths.length > 0
        ? rawEvaluation.strengths
        : ['Demonstrated foundational awareness of the topic.'];
      areasForImprovement = Array.isArray(rawEvaluation?.areasForImprovement) && rawEvaluation.areasForImprovement.length > 0
        ? rawEvaluation.areasForImprovement
        : ['Elaborate with specific projects, technical decisions, or practical outcomes.'];
    } else {
      // MEANINGFUL: Evaluated on merit (typically 6 to 10 out of 10)
      communication = clamp(rawScores.communication, 4, 10, 8);
      confidence = clamp(rawScores.confidence, 4, 10, 8);
      problemSolving = clamp(rawScores.problemSolving, 4, 10, 7.5);
      behavioralFit = clamp(rawScores.behavioralFit, 4, 10, 8);
      validationReason = 'Answer directly addressed the question with appropriate explanation and supporting details.';

      feedbackSummary = rawEvaluation?.feedbackSummary || 'The response provided a clear, relevant, and well-structured answer with meaningful context and practical details.';
      strengths = Array.isArray(rawEvaluation?.strengths) && rawEvaluation.strengths.length > 0
        ? rawEvaluation.strengths
        : ['Clear and relevant response that directly addressed the core question.', 'Demonstrated practical understanding with concrete context.'];
      areasForImprovement = Array.isArray(rawEvaluation?.areasForImprovement) && rawEvaluation.areasForImprovement.length > 0
        ? rawEvaluation.areasForImprovement
        : ['Continue quantifying project impact or metrics when discussing outcomes.'];
    }

    // Consistent overall rating calculation
    overallScore = Math.round(((communication + confidence + problemSolving + behavioralFit) / 4) * 10) / 10;
  }

  return {
    answerValidation: overallClassification,
    validationReason,
    overallScore,
    scores: {
      communication,
      confidence,
      problemSolving,
      behavioralFit
    },
    feedbackSummary,
    strengths,
    areasForImprovement,
    proTipForNextInterview: proTip,
    questionEvaluations: turnEvaluations
  };
}

/**
 * Complete fallback evaluator if Gemini is unreachable.
 */
export function generateFallbackEvaluation(conversation: { speaker: string; text: string }[]): MockHrEvaluation {
  return enforceEvaluationRules({}, conversation);
}
