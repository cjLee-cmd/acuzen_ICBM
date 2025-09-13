// Demo data for static deployment when API is not available
// This provides fallback data for GitHub Pages deployment

export const isStaticMode = () => {
  // Detect if we're in static/demo mode by checking the hostname or path
  if (typeof window === 'undefined') return false;
  
  // Check if we're on GitHub Pages or localhost with acuzen_ICBM path
  const isGitHubPages = window.location.hostname.includes('.github.io');
  const hasRepoPath = window.location.pathname.includes('/acuzen_ICBM/');
  const isLocalStatic = window.location.port === '8001' || window.location.port === '8000';
  
  return isGitHubPages || hasRepoPath || isLocalStatic;
};

export const demographicData = [
  { age: 25, gender: 'Male' }, { age: 34, gender: 'Female' }, { age: 45, gender: 'Male' },
  { age: 67, gender: 'Female' }, { age: 28, gender: 'Male' }, { age: 52, gender: 'Female' },
  { age: 41, gender: 'Male' }, { age: 39, gender: 'Female' }, { age: 58, gender: 'Male' },
  { age: 31, gender: 'Female' }, { age: 73, gender: 'Male' }, { age: 26, gender: 'Female' },
  { age: 48, gender: 'Male' }, { age: 55, gender: 'Female' }, { age: 37, gender: 'Male' },
];

export const drugs = [
  'Aspirin 100mg', 'Ibuprofen 400mg', 'Paracetamol 500mg', 'Amoxicillin 250mg',
  'Metformin 500mg', 'Lisinopril 10mg', 'Atorvastatin 20mg', 'Omeprazole 20mg',
  'Simvastatin 40mg', 'Levothyroxine 50mcg', 'Warfarin 5mg', 'Digoxin 250mcg',
  'Furosemide 40mg', 'Hydrochlorothiazide 25mg', 'Amlodipine 5mg', 'Losartan 50mg',
  'Metoprolol 50mg', 'Prednisone 10mg', 'Insulin Glargine', 'Clopidogrel 75mg',
];

export const reactions = [
  'Skin rash', 'Gastrointestinal bleeding', 'Nausea', 'Dizziness', 'Headache',
  'Allergic reaction', 'Liver enzyme elevation', 'Muscle pain', 'Fatigue', 'Insomnia',
  'Constipation', 'Diarrhea', 'Shortness of breath', 'Chest pain', 'Palpitations',
  'Hypertension', 'Hypotension', 'Confusion', 'Memory loss', 'Joint pain',
];

export const reporters = [
  'Dr. Kim', 'Dr. Lee', 'Dr. Park', 'Dr. Choi', 'Dr. Jung', 'Dr. Kang',
  'Dr. Shin', 'Dr. Yoon', 'Dr. Lim', 'Dr. Oh', 'Dr. Han', 'Dr. Song',
  'Dr. Jang', 'Dr. Moon', 'Dr. Baek', 'Dr. Seo', 'Dr. Nam', 'Dr. Hong',
  'Dr. Kwon', 'Dr. Cho', 'Pharmacist Kim', 'Nurse Park', 'Patient Self-Report',
];

export const severityLevels = ['Low', 'Medium', 'High', 'Critical'];
export const statusOptions = ['검토 필요', '처리중', '완료', '보류', '추가 정보 필요'];

export const generateMockCases = (count: number = 50) => {
  const cases = [];
  const startDate = new Date('2024-01-01');
  
  for (let i = 1; i <= count; i++) {
    const demographic = demographicData[i % demographicData.length];
    const drug = drugs[i % drugs.length];
    const reaction = reactions[i % reactions.length];
    const reporter = reporters[i % reporters.length];
    const severity = severityLevels[i % severityLevels.length];
    const status = statusOptions[i % statusOptions.length];
    
    // Generate random date within 2024
    const randomDays = Math.floor(Math.random() * 365);
    const reportDate = new Date(startDate);
    reportDate.setDate(startDate.getDate() + randomDays);
    
    const daysSinceReport = Math.floor((new Date().getTime() - reportDate.getTime()) / (1000 * 60 * 60 * 24));
    
    cases.push({
      id: `CSE-2024-${i.toString().padStart(3, '0')}`,
      patientAge: demographic.age + Math.floor(Math.random() * 10) - 5, // ±5 years variance
      patientGender: demographic.gender,
      drugName: drug,
      suspectedReaction: reaction,
      severity: severity,
      outcome: status,
      reporterType: reporter,
      createdAt: reportDate.toISOString(),
      daysSinceReport: Math.max(0, daysSinceReport),
      aiPrediction: {
        severity: severity,
        confidence: Math.floor(Math.random() * 30) + 70, // 70-99% confidence
      },
      // Additional fields for case management
      gender: demographic.gender,
      drug: drug,
      reaction: reaction,
      status: status,
      reporter: reporter,
      dateReported: reportDate.toISOString().split('T')[0],
      aiConfidence: Math.floor(Math.random() * 30) + 70,
      aiRecommendation: generateAiRecommendation(severity, daysSinceReport),
    });
  }
  
  return cases;
};

function generateAiRecommendation(severity: string, daysSinceReport: number): string {
  if (severity === 'Critical' || severity === 'High') {
    if (daysSinceReport > 7) {
      return 'Urgent review required - case overdue';
    } else if (daysSinceReport > 3) {
      return 'Priority review recommended';
    } else {
      return 'Immediate review recommended due to severity';
    }
  } else if (severity === 'Medium') {
    return 'Standard monitoring required';
  } else {
    return 'Routine follow-up sufficient';
  }
}

export const demoUsers = [
  {
    id: 'user-001',
    email: 'admin@pharma.com',
    role: 'ADMIN',
    name: '관리자',
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: new Date().toISOString(),
  },
  {
    id: 'user-002',
    email: 'reviewer1@pharma.com',
    role: 'REVIEWER',
    name: '검토자 김',
    createdAt: '2024-01-02T00:00:00Z',
    lastLogin: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: 'user-003',
    email: 'reviewer2@pharma.com',
    role: 'REVIEWER',
    name: '검토자 이',
    createdAt: '2024-01-03T00:00:00Z',
    lastLogin: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  },
  {
    id: 'user-004',
    email: 'user1@pharma.com',
    role: 'USER',
    name: '사용자 박',
    createdAt: '2024-01-04T00:00:00Z',
    lastLogin: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
  },
];

export const demoAiModels = [
  {
    id: 'model-001',
    name: 'Severity Classifier v2.1',
    type: 'classification',
    accuracy: 94.2,
    lastTrained: '2024-01-15T00:00:00Z',
    status: 'active',
    description: '부작용 심각도 분류 모델',
  },
  {
    id: 'model-002', 
    name: 'Risk Predictor v1.5',
    type: 'regression',
    accuracy: 87.8,
    lastTrained: '2024-01-10T00:00:00Z',
    status: 'training',
    description: '위험도 예측 모델',
  },
];

// Generate the demo cases
export const demoCases = generateMockCases(50);
export const demoCriticalCases = demoCases.filter(c => 
  c.severity === 'Critical' || c.severity === 'High' || c.daysSinceReport > 7
).slice(0, 15); // Show top 15 critical cases