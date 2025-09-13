/**
 * Manual test script to demonstrate random data input functionality
 * This script shows how to fill the ICSR form with random data
 * and verify the submission through API calls
 */

const testData = {
  // Random reporter information
  reportType: "spontaneous",
  reporterType: "healthcare_professional", 
  reporterName: `테스트의사${Math.floor(Math.random() * 1000)}`,
  reporterQualification: "전문의",
  reporterOrganization: `테스트병원${Math.floor(Math.random() * 100)}`,
  reporterContact: `010-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
  
  // Random patient information
  patientAge: Math.floor(Math.random() * 80) + 20, // Age between 20-100
  patientGender: ["Male", "Female", "Unknown"][Math.floor(Math.random() * 3)],
  patientWeight: Math.floor(Math.random() * 50) + 50, // 50-100 kg
  patientHeight: Math.floor(Math.random() * 40) + 150, // 150-190 cm
  patientMedicalHistory: `고혈압, 당뇨병 과거력 ${Math.floor(Math.random() * 10)}년`,
  
  // Random drug information  
  drugName: [`아스피린${Math.floor(Math.random() * 100)}`, `타이레놀${Math.floor(Math.random() * 100)}`, `이부프로펜${Math.floor(Math.random() * 100)}`][Math.floor(Math.random() * 3)],
  drugDosage: `1일 ${Math.floor(Math.random() * 3) + 1}회, 1회 ${Math.floor(Math.random() * 2) + 1}정`,
  drugRoute: ["oral", "injection", "topical"][Math.floor(Math.random() * 3)],
  drugIndication: ["두통", "발열", "염증"][Math.floor(Math.random() * 3)],
  drugStartDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Random date within last 30 days
  drugManufacturer: `제약회사${Math.floor(Math.random() * 10)}`,
  drugBatchNumber: `LOT${String(Math.floor(Math.random() * 100000)).padStart(6, '0')}`,
  
  // Random adverse reaction information
  adverseReaction: ["두드러기", "오심", "구토", "현기증", "발진"][Math.floor(Math.random() * 5)],
  reactionDescription: `복용 후 ${Math.floor(Math.random() * 24) + 1}시간 내에 ${["두드러기", "오심", "구토", "현기증", "발진"][Math.floor(Math.random() * 5)]} 증상이 나타남. 약물 중단 후 ${Math.floor(Math.random() * 7) + 1}일만에 호전됨.`,
  reactionStartDate: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000), // Within last 7 days
  severity: ["Low", "Medium", "High", "Critical"][Math.floor(Math.random() * 4)],
  seriousness: ["serious", "non_serious"][Math.floor(Math.random() * 2)],
  outcome: ["recovered", "recovering", "not_recovered", "recovered_with_sequelae", "fatal", "unknown"][Math.floor(Math.random() * 6)],
  
  // Additional information
  additionalInfo: `추가 검사 결과: 정상 범위, 환자 상태 ${["양호", "보통", "주의 필요"][Math.floor(Math.random() * 3)]}`
};

console.log("Generated random test data:");
console.log(JSON.stringify(testData, null, 2));

// Test function to submit the data
async function testSubmitData() {
  try {
    const response = await fetch('http://localhost:5000/api/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('\n✅ Data submitted successfully!');
      console.log('Response:', result);
      return result;
    } else {
      console.log('\n❌ Submission failed');
      console.log('Status:', response.status);
      console.log('Response:', await response.text());
    }
  } catch (error) {
    console.log('\n❌ Error submitting data:', error.message);
  }
}

// Export for use in Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testData, testSubmitData };
}