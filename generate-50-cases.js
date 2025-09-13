import { storage } from "./server/storage.ts";

// 한국에서 흔히 사용되는 의약품들
const commonDrugs = [
  { name: '아토르바스타틴', dosage: '20mg 1일 1회', indication: '고지혈증' },
  { name: '아목시실린', dosage: '500mg 1일 3회', indication: '세균감염' },
  { name: '로라타딘', dosage: '10mg 1일 1회', indication: '알레르기성 비염' },
  { name: '아스피린', dosage: '100mg 1일 1회', indication: '심혈관질환 예방' },
  { name: '메트포르민', dosage: '500mg 1일 2회', indication: '당뇨병' },
  { name: '라미프릴', dosage: '5mg 1일 1회', indication: '고혈압' },
  { name: '오메프라졸', dosage: '20mg 1일 1회', indication: '위산과다' },
  { name: '세티리진', dosage: '10mg 1일 1회', indication: '알레르기' },
  { name: '이부프로펜', dosage: '400mg 필요시', indication: '해열진통' },
  { name: '심바스타틴', dosage: '10mg 1일 1회', indication: '고지혈증' },
  { name: '로사르탄', dosage: '50mg 1일 1회', indication: '고혈압' },
  { name: '글리벤클라미드', dosage: '2.5mg 1일 2회', indication: '당뇨병' },
  { name: '독시사이클린', dosage: '100mg 1일 2회', indication: '세균감염' },
  { name: '프레드니솔론', dosage: '5mg 1일 1회', indication: '염증' },
  { name: '디클로페나크', dosage: '50mg 1일 3회', indication: '관절염' },
  { name: '알프라졸람', dosage: '0.25mg 필요시', indication: '불안장애' },
  { name: '파모티딘', dosage: '20mg 1일 2회', indication: '위궤양' },
  { name: '클로르페니라민', dosage: '4mg 1일 3회', indication: '알레르기' },
  { name: '푸로세미드', dosage: '40mg 1일 1회', indication: '부종' },
  { name: '레보플록사신', dosage: '500mg 1일 1회', indication: '세균감염' }
];

// 부작용 패턴
const adverseReactions = [
  { reaction: '근육통', description: '전신 또는 특정 부위의 근육 통증과 불편감', severity: ['Low', 'Medium'] },
  { reaction: '알레르기성 발진', description: '피부에 나타나는 붉은 반점과 가려움증', severity: ['Medium', 'High'] },
  { reaction: '졸음', description: '지속적인 졸림과 집중력 저하', severity: ['Low'] },
  { reaction: '소화불량', description: '복부 불편감, 속쓰림, 메스꺼움', severity: ['Low', 'Medium'] },
  { reaction: '두통', description: '지속적이거나 간헐적인 머리 통증', severity: ['Low', 'Medium'] },
  { reaction: '어지러움', description: '현기증 또는 균형감각 저하', severity: ['Medium'] },
  { reaction: '간수치 상승', description: 'AST/ALT 수치의 비정상적 증가', severity: ['Medium', 'High'] },
  { reaction: '혈압상승', description: '혈압의 비정상적 증가', severity: ['Medium', 'High'] },
  { reaction: '심계항진', description: '심박수 증가 또는 불규칙한 심박', severity: ['Medium', 'High'] },
  { reaction: '구토', description: '메스꺼움을 동반한 구토 증상', severity: ['Medium'] },
  { reaction: '설사', description: '묽은 변 또는 잦은 배변', severity: ['Low', 'Medium'] },
  { reaction: '변비', description: '배변 곤란 또는 배변 횟수 감소', severity: ['Low'] },
  { reaction: '수면장애', description: '불면증 또는 수면 패턴 변화', severity: ['Low', 'Medium'] },
  { reaction: '식욕부진', description: '식욕 감소 또는 식사량 저하', severity: ['Low', 'Medium'] },
  { reaction: '체중증가', description: '비정상적인 체중 증가', severity: ['Low', 'Medium'] },
  { reaction: '호흡곤란', description: '숨쉬기 어려움 또는 호흡 불편', severity: ['High', 'Critical'] },
  { reaction: '부종', description: '팔다리 또는 얼굴의 부기', severity: ['Medium', 'High'] },
  { reaction: '기침', description: '지속적이거나 간헐적인 기침', severity: ['Low', 'Medium'] },
  { reaction: '탈모', description: '머리카락이 비정상적으로 빠짐', severity: ['Low', 'Medium'] },
  { reaction: '혈당변화', description: '혈당 수치의 비정상적 변화', severity: ['Medium', 'High'] }
];

// 의료력
const medicalHistories = [
  '고혈압, 당뇨병',
  '고지혈증',
  '알레르기성 비염',
  '위궤양 병력',
  '관절염',
  '심혈관질환',
  '천식',
  '갑상선 질환',
  '신장질환',
  '간질환',
  '골다공증',
  '우울증',
  '불면증',
  '편두통',
  '특별한 병력 없음',
  '약물 알레르기 병력',
  '수술 병력',
  '암 병력',
  '자가면역질환',
  '호르몬 질환'
];

// 병용약물
const concomitantMedications = [
  ['메트포르민 500mg', '라미프릴 5mg'],
  ['아스피린 100mg'],
  ['비타민D 1000IU', '칼슘 500mg'],
  ['오메프라졸 20mg'],
  [],
  ['심바스타틴 10mg', '로사르탄 50mg'],
  ['이부프로펜 400mg'],
  ['종합비타민'],
  ['프로바이오틱스'],
  ['글루코사민 500mg'],
  ['마그네슘 200mg'],
  ['철분제 18mg'],
  ['엽산 400mcg'],
  ['오메가3 1000mg'],
  ['코엔자임Q10 100mg']
];

// 결과
const outcomes = [
  '약물 중단 후 증상 완화',
  '용량 조절 후 증상 개선',
  '대체 약물로 변경',
  '증상 지속 관찰 중',
  '응급실 내원 후 치료',
  '입원 치료 후 회복',
  '외래 추적 관찰',
  '자연 회복',
  '약물 계속 사용 중',
  '전문의 상담 후 관리',
  '추가 검사 시행',
  '타 병원 의뢰',
  '증상 완전 회복',
  '부분적 회복',
  '증상 악화로 치료 중'
];

// 랜덤 선택 함수
function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// 랜덤 숫자 생성 (min, max 포함)
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 날짜 생성 (과거 1년 내)
function randomDate(daysAgo = 365) {
  const now = new Date();
  const pastDate = new Date(now.getTime() - (Math.random() * daysAgo * 24 * 60 * 60 * 1000));
  return pastDate;
}

// 50개의 샘플 케이스 생성
async function generate50Cases() {
  try {
    console.log('50개의 부작용 사례 데이터 생성 시작...');

    // 관리자 사용자 확인
    const adminUser = await storage.getUserByEmail('admin@pharma.com');
    if (!adminUser) {
      console.error('관리자 사용자를 찾을 수 없습니다. 먼저 시드 데이터를 실행해주세요.');
      return;
    }

    console.log(`관리자 사용자 확인: ${adminUser.email}`);

    const cases = [];
    const statuses = ['긴급', '검토 필요', '처리중', '완료'];

    for (let i = 1; i <= 50; i++) {
      const drug = randomChoice(commonDrugs);
      const reactionData = randomChoice(adverseReactions);
      const severity = randomChoice(reactionData.severity);
      const dateOfReaction = randomDate(180); // 최근 6개월
      const dateReported = new Date(dateOfReaction.getTime() + (Math.random() * 30 * 24 * 60 * 60 * 1000)); // 반응 발생 후 30일 이내 보고

      const caseData = {
        patientAge: randomInt(18, 85),
        patientGender: randomChoice(['남성', '여성']),
        drugName: drug.name,
        drugDosage: drug.dosage,
        adverseReaction: reactionData.reaction,
        reactionDescription: `${drug.indication} 치료를 위해 ${drug.name} ${drug.dosage} 복용 중 ${reactionData.description} 발생. ${i}번째 사례.`,
        severity: severity,
        status: randomChoice(statuses),
        reporterId: adminUser.id,
        dateOfReaction: dateOfReaction,
        medicalHistory: randomChoice(medicalHistories),
        concomitantMeds: JSON.stringify(randomChoice(concomitantMedications)),
        outcome: randomChoice(outcomes)
      };

      cases.push(caseData);
    }

    // 데이터베이스에 삽입 (딜레이를 두어 고유한 케이스 번호 생성 보장)
    console.log('데이터베이스에 사례 삽입 중...');
    let successCount = 0;

    for (let i = 0; i < cases.length; i++) {
      try {
        // 고유한 케이스 번호 생성을 위해 작은 딜레이 추가
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        const createdCase = await storage.createCase(cases[i]);
        console.log(`사례 ${i + 1}/50 생성 완료 - Case ID: ${createdCase.caseNumber}`);
        successCount++;
      } catch (error) {
        console.error(`사례 ${i + 1} 생성 실패:`, error.message);
        // 유니크 제약조건 실패 시 재시도
        if (error.message.includes('UNIQUE constraint failed')) {
          try {
            await new Promise(resolve => setTimeout(resolve, 50));
            const retryCase = await storage.createCase(cases[i]);
            console.log(`사례 ${i + 1}/50 재시도 성공 - Case ID: ${retryCase.caseNumber}`);
            successCount++;
          } catch (retryError) {
            console.error(`사례 ${i + 1} 재시도 실패:`, retryError.message);
          }
        }
      }
    }

    console.log(`\n=== 데이터 생성 완료 ===`);
    console.log(`총 ${successCount}/50개 사례가 성공적으로 생성되었습니다.`);
    
    // 통계 출력
    const totalCases = await storage.listCases();
    console.log(`현재 데이터베이스의 총 사례 수: ${totalCases.length}`);

    // 심각도별 통계
    const severityStats = totalCases.reduce((stats, case_) => {
      stats[case_.severity] = (stats[case_.severity] || 0) + 1;
      return stats;
    }, {});

    console.log('\n심각도별 사례 수:');
    Object.entries(severityStats).forEach(([severity, count]) => {
      console.log(`  ${severity}: ${count}개`);
    });

    // 상태별 통계
    const statusStats = totalCases.reduce((stats, case_) => {
      stats[case_.status] = (stats[case_.status] || 0) + 1;
      return stats;
    }, {});

    console.log('\n상태별 사례 수:');
    Object.entries(statusStats).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}개`);
    });

  } catch (error) {
    console.error('데이터 생성 중 오류 발생:', error);
  }
}

// 스크립트 실행
generate50Cases().then(() => {
  console.log('\n스크립트 실행 완료');
  process.exit(0);
}).catch((error) => {
  console.error('스크립트 실행 실패:', error);
  process.exit(1);
});