import { ExamDifficulty, ExamLanguage, ExamPassage } from '@/types/exam';

export const BUILTIN_EXAM_PASSAGES: ExamPassage[] = [
  // --- HINDI PASSAGES ---
  {
    id: 'pass_hi_beg_01',
    title: 'Hindi Beginner: National Unity & Character',
    titleHindi: 'राष्ट्रीय एकता एवं चरित्र निर्माण',
    language: 'Hindi',
    difficulty: 'beginner',
    text: 'भारत एक महान और प्राचीन देश है जहां विभिन्न जातियों और धर्मों के लोग मिलजुलकर रहते हैं। एकता में ही शक्ति है। जब देश के नागरिक अपने कर्तव्यों का निष्ठापूर्वक पालन करते हैं तो राष्ट्र का विकास स्वतः होता है। शिक्षा ही मनुष्य को सभ्य और जागरूक बनाती है। हमें सदैव सत्य और अहिंसा के मार्ग पर चलना चाहिए और देश की प्रगति में अपना योगदान देना चाहिए।',
    wordCount: 71,
    characterCount: 345,
  },
  {
    id: 'pass_hi_inter_01',
    title: 'Hindi Intermediate: Digital India & Governance',
    titleHindi: 'डिजिटल भारत और सुशासन',
    language: 'Hindi',
    difficulty: 'intermediate',
    text: 'डिजिटल क्रांति ने आधुनिक भारत के प्रशासनिक परिदृश्य को पूरी तरह से बदल दिया है। आज सरकारी योजनाओं का लाभ प्रत्यक्ष लाभ अंतरण के माध्यम से सीधे नागरिकों के बैंक खातों में पहुंच रहा है। इससे न केवल समय की बचत हुई है बल्कि बिचौलियों की भूमिका समाप्त होने से शासन में अभूतपूर्व पारदर्शिता आई है। कंप्यूटर शिक्षा और इंटरनेट कनेक्टिविटी ने ग्रामीण क्षेत्रों में भी विकास के नए द्वार खोले हैं। प्रत्येक युवा को डिजिटल साक्षरता प्राप्त कर इस प्रगति का हिस्सा बनना चाहिए।',
    wordCount: 81,
    characterCount: 462,
  },
  {
    id: 'pass_hi_adv_01',
    title: 'Hindi Advanced: CPCT Pattern Administrative Paragraph',
    titleHindi: 'सीपीसीटी परीक्षा प्रारूप: प्रशासनिक कार्य संस्कृति',
    language: 'Hindi',
    difficulty: 'advanced',
    text: 'लोकतांत्रिक शासन व्यवस्था में लोक सेवकों की कार्यकुशलता और समयबद्धता ही प्रशासन की सफलता का मुख्य पैमाना होती है। नागरिकों की शिकायतों का त्वरित निस्तारण करना और जनकल्याणकारी नीतियों को धरातल पर क्रियान्वित करना प्रत्येक विभाग का प्राथमिक उत्तरदायित्व है। ई-ऑफिस प्रणाली के प्रभावी क्रियान्वयन से पत्रावलियों के संचलन में तेजी आई है तथा निर्णय लेने की प्रक्रिया अधिक सुगम हुई है। प्रशासनिक सुधार आयोग ने भी यह संस्तुति की है कि पारदर्शिता और उत्तरदायित्व को सेवा नियमों का अनिवार्य अंग बनाया जाए ताकि जनसामान्य का शासन पर विश्वास निरंतर प्रगाढ़ बना रहे।',
    wordCount: 88,
    characterCount: 546,
  },
  {
    id: 'pass_hi_ultra_01',
    title: 'Hindi Ultra-Advanced: High Court Legal Judgement Dictation',
    titleHindi: 'उच्च न्यायालय विधिक निर्णय प्रारूप: नैसर्गिक न्याय एवं समता',
    language: 'Hindi',
    difficulty: 'ultra_advanced',
    text: 'माननीय उच्च न्यायालय की वृहद पीठ के समक्ष प्रस्तुत विशेष अपील में विद्वान वरिष्ठ अधिवक्ताओं के विस्तृत तर्कों पर सम्यक विचारोपरांत न्यायालय ने यह महत्वपूर्ण सिद्धांत प्रतिपादित किया कि प्रशासनिक शक्तियों का प्रयोग सदैव युक्तियुक्तता और नैसर्गिक न्याय के सिद्धांतों के अनुरूप ही होना चाहिए। किसी भी कर्मचारी के विरुद्ध दंडात्मक आदेश पारित करने से पूर्व उसे अपना पक्ष प्रस्तुत करने का समुचित एवं निष्पक्ष अवसर प्रदान किया जाना संविधान के अनुच्छेद १४ एवं २१ के अंतर्गत प्रदत्त मौलिक अधिकारों का अभिन्न अंग है। बिना सुनवाई के पारित किया गया कोई भी आदेश विधि की दृष्टि में सर्वथा शून्य और प्रभावहीन होगा।',
    wordCount: 94,
    characterCount: 602,
  },

  // --- ENGLISH PASSAGES ---
  {
    id: 'pass_en_beg_01',
    title: 'English Beginner: Importance of Time Management',
    language: 'English',
    difficulty: 'beginner',
    text: 'Time is the most valuable resource available to human beings. Once lost, it can never be recovered by any means. Successful people throughout history have always recognized the power of discipline and proper daily planning. When we manage our schedule effectively, we reduce stress and increase our overall productivity. Learning to prioritize essential responsibilities is the foundation of lifelong achievement.',
    wordCount: 64,
    characterCount: 418,
  },
  {
    id: 'pass_en_inter_01',
    title: 'English Intermediate: Technology and Modern Education',
    language: 'English',
    difficulty: 'intermediate',
    text: 'The integration of modern digital technology into classroom education has opened unprecedented opportunities for students around the world. Interactive learning tools, online academic libraries, and collaborative research platforms allow learners to explore complex scientific concepts at their own individual pace. However, technology should always remain a supportive instrument that complements critical thinking rather than replacing human inquiry and contemplation.',
    wordCount: 65,
    characterCount: 494,
  },
  {
    id: 'pass_en_adv_01',
    title: 'English Advanced: SSC DEST Pattern Economic Discourse',
    language: 'English',
    difficulty: 'advanced',
    text: 'Economic resilience in an interconnected global environment requires sustained structural reforms, consistent fiscal discipline, and progressive investment in modern infrastructure. Developing domestic manufacturing capacity while simultaneously strengthening financial market stability encourages foreign direct investment and stimulates employment opportunities across multiple commercial sectors. Furthermore, comprehensive regulatory frameworks ensure equitable growth and protect vulnerable communities from inflationary pressures.',
    wordCount: 61,
    characterCount: 566,
  },
  {
    id: 'pass_en_ultra_01',
    title: 'English Ultra-Advanced: Judicial Jurisprudence & Constitutional Law',
    language: 'English',
    difficulty: 'ultra_advanced',
    text: 'Constitutional jurisprudence mandates that executive authorities exercise discretionary jurisdiction strictly within the parameters of statutory authority and constitutional propriety. The doctrine of the rule of law precludes arbitrary governance and guarantees equal protection to every citizen irrespective of social or socioeconomic classification. Judicial review acts as an indispensable institutional safeguard preserving constitutional equilibrium and safeguarding fundamental liberties against legislative encroachment.',
    wordCount: 63,
    characterCount: 529,
  },
];

export class PassageLibraryService {
  public static getAllPassages(): ExamPassage[] {
    return BUILTIN_EXAM_PASSAGES;
  }

  public static getPassageById(id: string): ExamPassage | undefined {
    return BUILTIN_EXAM_PASSAGES.find((p) => p.id === id);
  }

  public static getPassagesByFilter(language: ExamLanguage, difficulty?: ExamDifficulty): ExamPassage[] {
    return BUILTIN_EXAM_PASSAGES.filter((p) => {
      const langMatch = p.language === language;
      const diffMatch = difficulty ? p.difficulty === difficulty : true;
      return langMatch && diffMatch;
    });
  }

  public static createCustomPassage(
    title: string,
    text: string,
    language: ExamLanguage,
    difficulty: ExamDifficulty = 'intermediate',
    createdBy = 'Teacher'
  ): ExamPassage {
    const trimmed = text.trim();
    const words = trimmed.split(/\s+/).filter(Boolean);

    return {
      id: `custom_pass_${Date.now()}`,
      title,
      language,
      difficulty,
      text: trimmed,
      wordCount: words.length,
      characterCount: trimmed.length,
      isCustomTeacherPassage: true,
      createdBy,
      createdAt: Date.now(),
    };
  }
}
