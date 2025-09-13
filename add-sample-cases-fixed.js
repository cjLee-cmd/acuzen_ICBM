import { storage } from "./server/storage.ts";

// 샘플 부작용 사례 데이터 생성
async function insertSampleCases() {
  try {
    console.log('샘플 부작용 사례 데이터 삽입 시작...');

    // 기존 관리자 사용자 ID 사용 (시드 데이터에서 생성된)
    const adminUser = await storage.getUserByEmail('admin@pharma.com');

    if (!adminUser) {
      console.error('관리자 사용자를 찾을 수 없습니다.');
      return;
    }

    const sampleCases = [
      {
        patientAge: 65,
        patientGender: '여성',
        drugName: '아토르바스타틴',
        drugDosage: '20mg 1일 1회',
        adverseReaction: '근육통',
        reactionDescription: '복용 시작 2주 후부터 어깨와 등 부위의 지속적인 근육통 발생',
        severity: 'Medium',
        status: '검토 필요',
        reporterId: adminUser.id,
        medicalHistory: '고혈압, 당뇨병',
        concomitantMeds: JSON.stringify(['메트포르민', '로사르탄']),
        outcome: '약물 중단 후 증상 완화'
      },
      {
        patientAge: 34,
        patientGender: '남성',
        drugName: '아목시실린',
        drugDosage: '500mg 1일 3회',
        adverseReaction: '알레르기성 발진',
        reactionDescription: '복용 3일 후 전신에 붉은 반점과 가려움증 발생',
        severity: 'High',
        status: '긴급',
        reporterId: adminUser.id,
        medicalHistory: '특별한 병력 없음',
        concomitantMeds: JSON.stringify([]),
        outcome: '응급실 내원, 항히스타민제 투여 후 호전'
      },
      {
        patientAge: 28,
        patientGender: '여성',
        drugName: '로라타딘',
        drugDosage: '10mg 1일 1회',
        adverseReaction: '졸림',
        reactionDescription: '복용 후 지속적인 졸림과 집중력 저하 증상',
        severity: 'Low',
        status: '처리중',
        reporterId: adminUser.id,
        medicalHistory: '알레르기성 비염',
        concomitantMeds: JSON.stringify(['코스프레이']),
        outcome: '복용량 조절 후 증상 개선'
      }
    ];

    // 각 사례를 데이터베이스에 삽입
    for (const caseData of sampleCases) {
      await storage.createCase(caseData);
    }

    console.log('샘플 데이터 삽입 완료: 3개의 부작용 사례가 추가되었습니다.');

  } catch (error) {
    console.error('샘플 데이터 삽입 중 오류:', error);
  }
}

insertSampleCases();