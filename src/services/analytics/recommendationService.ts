import { storageService } from '../storage/storageService';
import { PracticeRecommendation, RecommendationFocus, WeakKeyAnalysis } from '@/types/analytics';
import { HeatmapService } from './heatmapService';
import { KeyboardLayout } from '@/types';

// Authentic Devanagari syllable and word banks keyed by target characters
const HINDI_WORD_BANK: Record<string, string[]> = {
  'क': ['कमल', 'कलम', 'कविता', 'किताब', 'कारण', 'कठिन', 'कृपा', 'कार्य'],
  'ख': ['खेत', 'खिड़की', 'खुशी', 'खोज', 'खेल', 'खनिज'],
  'ग': ['गति', 'गणित', 'गुलाब', 'गंभीर', 'ज्ञान', 'गौरव'],
  'घ': ['घर', 'घड़ी', 'घटना', 'घोषणा', 'घूमना'],
  'च': ['चक्र', 'चित्र', 'चार', 'चरण', 'चर्चा', 'चुनौती'],
  'छ': ['छात्र', 'छाया', 'छोटी', 'छवि', 'छत'],
  'ज': ['जल', 'जीवन', 'जनता', 'जरूरत', 'जांच', 'ज्योति'],
  'झ': ['झरना', 'झंडा', 'झील', 'झूठ'],
  'ट': ['टंकण', 'ट्रेन', 'टीम', 'टिकट', 'टुकड़ा'],
  'ठ': ['ठोस', 'ठंड', 'ठहरना', 'ठीक'],
  'ड': ['डाक', 'डर', 'डिजिटल', 'डॉक्टर'],
  'ढ': ['ढक्कन', 'ढाल', 'ढूंढना'],
  'त': ['तकनीक', 'तैयारी', 'ताकत', 'तस्वीर', 'तरंग', 'तुला'],
  'थ': ['थाली', 'थोड़ा', 'थकावट', 'स्थल'],
  'द': ['देश', 'दस्तावेज', 'दिशा', 'दीपक', 'दृष्टि', 'दिन'],
  'ध': ['ध्यान', 'धर्म', 'धैर्य', 'धनुष', 'ध्वनि'],
  'न': ['नियम', 'नवीन', 'नदी', 'नागरिक', 'न्याय', 'निर्णय'],
  'प': ['परीक्षा', 'प्रयास', 'पुस्तक', 'प्रशिक्षण', 'प्रगति', 'पानी'],
  'फ': ['फल', 'फसल', 'फूल', 'फैसला'],
  'ब': ['बच्चा', 'बुद्धि', 'बालक', 'बगिया', 'बचपन', 'बात'],
  'भ': ['भारत', 'भाषा', 'भविष्य', 'भावना', 'भवन', 'भोग'],
  'म': ['मस्तिष्क', 'मित्र', 'मनुष्य', 'मार्ग', 'मातृभूमि', 'महान'],
  'य': ['योजना', 'योग्यता', 'यात्रा', 'याद', 'यथार्थ'],
  'र': ['राष्ट्र', 'रचना', 'रेखा', 'रंग', 'रोशनी', 'रात'],
  'ल': ['लक्ष्य', 'लिखित', 'लोकतंत्र', 'लाभ', 'लहर'],
  'व': ['विकास', 'विचार', 'विद्यालय', 'विज्ञान', 'विद्या'],
  'श': ['शब्द', 'शांति', 'शिक्षा', 'शक्ति', 'शासन'],
  'ष': ['विशेष', 'भाषा', 'पुरुष', 'धनुष', 'हर्ष'],
  'स': ['सफलता', 'समय', 'समाज', 'सत्य', 'साधना', 'संस्कृति'],
  'ह': ['हाथ', 'हृदय', 'हिम्मत', 'हवा', 'हल'],
  'ि': ['दिन', 'मिलन', 'किला', 'गति', 'कवि', 'रवि', 'शशि'],
  'ी': ['दीपक', 'गीत', 'नदी', 'पानी', 'तीर', 'शीतल'],
  'ु': ['सुख', 'गुलाब', 'कुशल', 'गुरु', 'मुकुट', 'तुलसी'],
  'ू': ['सूरज', 'फूल', 'धूप', 'मूल', 'दूरी', 'पूजा'],
  'े': ['देश', 'सेवा', 'मेला', 'खेल', 'पेड़', 'नेता'],
  'ै': ['सैनिक', 'पैसा', 'मैदान', 'तैयार', 'बैल'],
  '्': ['सत्य', 'त्याग', 'न्याय', 'कष्ट', 'मार्ग', 'धर्म', 'प्रश्न'],
};

const ENGLISH_WORD_BANK: Record<string, string[]> = {
  'q': ['quick', 'quiet', 'quest', 'quality', 'queen', 'quote'],
  'w': ['water', 'world', 'write', 'power', 'window', 'worker'],
  'e': ['enter', 'every', 'energy', 'effort', 'expert', 'system'],
  'r': ['rapid', 'rhythm', 'result', 'report', 'record', 'reason'],
  't': ['target', 'timing', 'technique', 'training', 'talent'],
  'y': ['yield', 'yearly', 'yellow', 'youth', 'yesterday'],
  'u': ['unique', 'update', 'urgent', 'useful', 'understand'],
  'i': ['input', 'impact', 'insight', 'instant', 'improve'],
  'o': ['output', 'online', 'office', 'option', 'origin'],
  'p': ['practice', 'process', 'perfect', 'profile', 'program'],
  'a': ['accuracy', 'action', 'always', 'active', 'advance'],
  's': ['speed', 'student', 'system', 'skill', 'success', 'steady'],
  'd': ['desktop', 'detail', 'device', 'digital', 'direct'],
  'f': ['fast', 'focus', 'fluent', 'finger', 'future', 'figure'],
  'g': ['goal', 'great', 'guide', 'growth', 'global'],
  'h': ['habit', 'hand', 'health', 'honor', 'human'],
  'j': ['journey', 'judge', 'junior', 'justice', 'joint'],
  'k': ['keyboard', 'knowledge', 'keystroke', 'kinetic'],
  'l': ['learn', 'lesson', 'layout', 'leader', 'level'],
  'z': ['zone', 'zeal', 'zero', 'zigzag'],
  'x': ['exact', 'expert', 'example', 'extra', 'exercise'],
  'c': ['clear', 'course', 'correct', 'control', 'custom'],
  'v': ['value', 'valid', 'vital', 'verify', 'vision'],
  'b': ['balance', 'better', 'basic', 'benchmark', 'build'],
  'n': ['native', 'number', 'normal', 'notice', 'network'],
  'm': ['master', 'metric', 'method', 'memory', 'manual'],
};

export class RecommendationService {
  /**
   * Analyzes weak keys and generates targeted practice recommendations.
   */
  public static async generateRecommendations(
    profileId: string,
    layout: KeyboardLayout
  ): Promise<PracticeRecommendation[]> {
    const adapter = await storageService.getAdapter();
    const weakKeys = await HeatmapService.getWeakKeys(profileId, layout, 5, 88);

    const recommendations: PracticeRecommendation[] = [];
    const isHindi = layout.includes('hindi');

    if (weakKeys.length > 0) {
      // 1. Weak Key Targeted Remediation Drill
      const topWeak = weakKeys.slice(0, 4);
      const targetChars = topWeak.map((w) => w.char);
      const targetKeys = topWeak.map((w) => w.code);

      const drillText = this.buildDrillPassage(targetChars, isHindi);

      recommendations.push({
        id: `rec_${profileId}_weak_${Date.now()}`,
        profileId,
        focus: 'weak_keys',
        title: isHindi ? 'कमजोर कुंजियों का विशेष अभ्यास' : 'Targeted Weak-Key Precision Drill',
        description: isHindi
          ? `आपकी कुंजियों (${targetChars.join(', ')}) पर त्रुटि दर अधिक है। इस अभ्यास से सटीकता में 15% तक सुधार होगा।`
          : `High error rate detected on keys (${targetChars.join(', ')}). This drill restores finger coordination.`,
        targetKeys,
        targetChars,
        drillText,
        recommendedDurationMinutes: 3,
        targetAccuracy: 95,
        targetWpm: 25,
        createdAt: Date.now(),
      });
    }

    // 2. Rhythm & Flow Consistency Drill
    const rhythmChars = isHindi ? ['स', 'म', 'न', 'र', 'त', 'क'] : ['t', 'h', 'e', 'a', 'n', 'd'];
    recommendations.push({
      id: `rec_${profileId}_rhythm_${Date.now() + 1}`,
      profileId,
      focus: 'accuracy_refinement',
      title: isHindi ? 'लयबद्ध टंकण एवं सटीकता सुधार' : 'Rhythm & Cadence Flow Exercise',
      description: isHindi
        ? 'समान गति और बिना रुकावट के टाइप करने का अभ्यास करें।'
        : 'Focus on uniform keystroke intervals to eliminate micro-hesitations.',
      targetKeys: [],
      targetChars: rhythmChars,
      drillText: isHindi
        ? 'समय का सदुपयोग ही सफलता का सबसे बड़ा रहस्य है। सतत अभ्यास से हर कठिन कार्य सरल हो जाता है।'
        : 'Consistent typing speed is achieved by maintaining steady keystroke rhythm without rushing.',
      recommendedDurationMinutes: 5,
      targetAccuracy: 96,
      targetWpm: 35,
      createdAt: Date.now(),
    });

    // Save recommendations locally
    for (const rec of recommendations) {
      await adapter.savePracticeRecommendation(rec);
    }

    return recommendations;
  }

  /**
   * Retrieves saved recommendations for a student.
   */
  public static async getRecommendations(profileId: string): Promise<PracticeRecommendation[]> {
    const adapter = await storageService.getAdapter();
    const existing = await adapter.getPracticeRecommendations(profileId);
    if (existing.length > 0) {
      return existing.sort((a, b) => b.createdAt - a.createdAt);
    }
    // Generate fresh recommendations if none exist
    return this.generateRecommendations(profileId, 'hindi_inscript');
  }

  /**
   * Builds an authentic drill passage featuring target characters.
   */
  private static buildDrillPassage(targetChars: string[], isHindi: boolean): string {
    const words: string[] = [];

    if (isHindi) {
      targetChars.forEach((ch) => {
        const matchingWords = HINDI_WORD_BANK[ch] || [`${ch}म`, `${ch}ल`, `स${ch}`];
        words.push(...matchingWords);
      });

      if (words.length < 8) {
        words.push('अभ्यास', 'सफलता', 'प्रयास', 'नियम', 'सत्य');
      }

      // Shuffle and interleave
      return words.sort(() => 0.5 - Math.random()).slice(0, 15).join(' ');
    } else {
      targetChars.forEach((ch) => {
        const charLower = ch.toLowerCase();
        const matchingWords = ENGLISH_WORD_BANK[charLower] || [`${charLower}an`, `${charLower}et`];
        words.push(...matchingWords);
      });

      if (words.length < 8) {
        words.push('speed', 'focus', 'drill', 'accuracy', 'master');
      }

      return words.sort(() => 0.5 - Math.random()).slice(0, 15).join(' ');
    }
  }
}
