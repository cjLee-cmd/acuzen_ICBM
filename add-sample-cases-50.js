import { storage } from "./server/storage.ts";

// 위험도별 50개 부작용 사례 데이터 생성
async function insert50SampleCases() {
  try {
    console.log('50개 부작용 사례 데이터 삽입 시작...');

    // 기존 관리자 사용자 ID 사용
    const adminUser = await storage.getUserByEmail('admin@pharma.com');

    if (!adminUser) {
      console.error('관리자 사용자를 찾을 수 없습니다.');
      return;
    }

    // 한국에서 흔히 사용되는 약물들
    const drugs = [
      { name: '아세트아미노펜', dosages: ['500mg 1일 3회', '650mg 1일 2회', '325mg 1일 4회'] },
      { name: '이부프로펜', dosages: ['200mg 1일 3회', '400mg 1일 2회', '600mg 1일 1회'] },
      { name: '아스피린', dosages: ['100mg 1일 1회', '325mg 1일 2회', '500mg 1일 1회'] },
      { name: '아토르바스타틴', dosages: ['10mg 1일 1회', '20mg 1일 1회', '40mg 1일 1회'] },
      { name: '메트포르민', dosages: ['500mg 1일 2회', '850mg 1일 2회', '1000mg 1일 1회'] },
      { name: '로사르탄', dosages: ['25mg 1일 1회', '50mg 1일 1회', '100mg 1일 1회'] },
      { name: '암로디핀', dosages: ['2.5mg 1일 1회', '5mg 1일 1회', '10mg 1일 1회'] },
      { name: '레보티록신', dosages: ['25mcg 1일 1회', '50mcg 1일 1회', '100mcg 1일 1회'] },
      { name: '오메프라졸', dosages: ['20mg 1일 1회', '40mg 1일 1회', '20mg 1일 2회'] },
      { name: '아목시실린', dosages: ['250mg 1일 3회', '500mg 1일 3회', '875mg 1일 2회'] },
      { name: '세파클러', dosages: ['250mg 1일 3회', '500mg 1일 2회', '375mg 1일 3회'] },
      { name: '시프로플록사신', dosages: ['250mg 1일 2회', '500mg 1일 2회', '750mg 1일 2회'] },
      { name: '로라타딘', dosages: ['10mg 1일 1회', '5mg 1일 2회'] },
      { name: '세티리진', dosages: ['10mg 1일 1회', '5mg 1일 2회'] },
      { name: '프레드니솔론', dosages: ['5mg 1일 2회', '10mg 1일 1회', '20mg 1일 1회'] },
      { name: '와파린', dosages: ['2mg 1일 1회', '5mg 1일 1회', '7.5mg 1일 1회'] },
      { name: '디곡신', dosages: ['0.25mg 1일 1회', '0.125mg 1일 1회'] },
      { name: '퓨로세미드', dosages: ['20mg 1일 1회', '40mg 1일 1회', '80mg 1일 1회'] },
      { name: '스피로놀락톤', dosages: ['25mg 1일 1회', '50mg 1일 1회', '100mg 1일 1회'] },
      { name: '가바펜틴', dosages: ['300mg 1일 3회', '600mg 1일 2회', '800mg 1일 1회'] }
    ];

    // 부작용 데이터 (위험도별)
    const adverseReactions = {
      Low: [
        { reaction: '졸림', descriptions: ['복용 후 가벼운 졸림 증상', '낮시간 졸림으로 인한 집중력 저하', '복용 30분 후 졸림 시작'] },
        { reaction: '두통', descriptions: ['가벼운 두통', '이마 부위 압박감', '간헐적 두통 발생'] },
        { reaction: '소화불량', descriptions: ['식후 복부 불편감', '가벼운 메스꺼움', '위장 부글거림'] },
        { reaction: '변비', descriptions: ['배변 횟수 감소', '배변 시 어려움', '복부 팽만감'] },
        { reaction: '설사', descriptions: ['하루 3-4회 묽은 변', '복용 후 복부 불편감과 설사', '가벼운 복통을 동반한 설사'] },
        { reaction: '현기증', descriptions: ['기립시 어지러움', '가벼운 현기증', '균형감각 저하'] },
        { reaction: '입마름', descriptions: ['지속적인 구강건조', '침 분비 감소', '목 마름 증상'] },
        { reaction: '피로감', descriptions: ['전신 피로감', '활력 저하', '만성 피로 증상'] }
      ],
      Medium: [
        { reaction: '근육통', descriptions: ['어깨와 목 부위 근육통', '전신 근육 뻐근함', '운동 후 심해지는 근육통'] },
        { reaction: '복통', descriptions: ['상복부 통증', '식후 심해지는 복통', '지속적인 복부 불편감'] },
        { reaction: '발진', descriptions: ['팔과 다리에 붉은 반점', '가려움을 동반한 피부발진', '목과 가슴 부위 발진'] },
        { reaction: '심계항진', descriptions: ['가슴 두근거림', '빠른 맥박', '불규칙한 심박동'] },
        { reaction: '불면증', descriptions: ['입면 장애', '야간 각성 증가', '새벽 조기 각성'] },
        { reaction: '혈압상승', descriptions: ['수축기 혈압 10-20mmHg 상승', '이완기 혈압 상승', '혈압 변동성 증가'] },
        { reaction: '식욕부진', descriptions: ['식사량 감소', '음식에 대한 흥미 상실', '체중 감소'] },
        { reaction: '관절통', descriptions: ['무릎 관절 통증', '손목과 발목 관절염', '아침 관절 경직'] }
      ],
      High: [
        { reaction: '알레르기성 발진', descriptions: ['전신 두드러기 발생', '심한 가려움과 부종', '얼굴과 목 부위 부종'] },
        { reaction: '호흡곤란', descriptions: ['가벼운 숨가쁨', '계단 오를 때 호흡곤란', '안정시에도 숨참'] },
        { reaction: '간수치 상승', descriptions: ['ALT/AST 2-3배 상승', '간기능 검사 이상', '황달 증상 없는 간수치 상승'] },
        { reaction: '혈소판 감소', descriptions: ['혈소판 수치 50,000-100,000', '출혈 경향 증가', '멍 잘 드는 증상'] },
        { reaction: '신장기능 저하', descriptions: ['크레아티닌 수치 상승', '사구체여과율 감소', '부종 발생'] },
        { reaction: '심부정맥', descriptions: ['심박수 불규칙', '심전도 이상', '가슴 답답함'] },
        { reaction: '위장출혈', descriptions: ['흑색변 발생', '위내시경상 미란 발견', '혈색소 감소'] },
        { reaction: '경련', descriptions: ['전신 경련 발작', '의식 저하를 동반한 경련', '국소 경련 증상'] }
      ],
      Critical: [
        { reaction: '아나필락시스', descriptions: ['전신 알레르기 반응으로 응급실 내원', '혈압 저하와 의식 저하', '후두 부종으로 인한 호흡곤란'] },
        { reaction: '급성간부전', descriptions: ['황달과 함께 간기능 급속 악화', 'ALT/AST 10배 이상 상승', '의식 저하와 간성혼수'] },
        { reaction: '급성신부전', descriptions: ['크레아티닌 급속 상승', '핍뇨 및 무뇨', '전해질 불균형'] },
        { reaction: '심근경색', descriptions: ['가슴 통증으로 응급실 내원', '심전도상 ST 분절 상승', '심근효소 상승'] },
        { reaction: '뇌출혈', descriptions: ['의식 저하와 신경학적 증상', '두개내압 상승', 'CT상 뇌출혈 확인'] },
        { reaction: '호흡부전', descriptions: ['중환자실 입원', '기계환기 필요', '산소포화도 급격한 저하'] },
        { reaction: '독성표피괴사용해', descriptions: ['전신 피부 박리', '점막 침범', '중환자실 치료 필요'] },
        { reaction: '혈전색전증', descriptions: ['폐색전증 발생', '하지 심부정맥혈전', '뇌경색 발생'] }
      ]
    };

    const genders = ['남성', '여성'];
    const statuses = ['긴급', '검토 필요', '처리중', '완료'];
    const medicalHistories = [
      '고혈압', '당뇨병', '고지혈증', '심장병', '간질환', '신장질환', 
      '갑상선 질환', '관절염', '천식', '알레르기', '특별한 병력 없음'
    ];
    const outcomes = [
      '약물 중단 후 증상 완화', '용량 조절 후 개선', '대체 약물로 변경', 
      '증상 치료 후 호전', '입원 치료 후 회복', '지속적인 모니터링 필요',
      '완전 회복', '부분적 회복', '치료 지속 중'
    ];

    const sampleCases = [];
    let caseNumber = 3000; // 기존 케이스와 구분하기 위한 시작 번호

    // 위험도별로 케이스 분배 (Low: 20개, Medium: 15개, High: 10개, Critical: 5개)
    const severityDistribution = {
      Low: 20,
      Medium: 15, 
      High: 10,
      Critical: 5
    };

    Object.entries(severityDistribution).forEach(([severity, count]) => {
      for (let i = 0; i < count; i++) {
        const drug = drugs[Math.floor(Math.random() * drugs.length)];
        const reaction = adverseReactions[severity][Math.floor(Math.random() * adverseReactions[severity].length)];
        const age = Math.floor(Math.random() * (80 - 18)) + 18; // 18-80세
        const gender = genders[Math.floor(Math.random() * genders.length)];
        
        // 위험도에 따른 상태 매핑
        let status;
        if (severity === 'Critical') {
          status = Math.random() < 0.8 ? '긴급' : '처리중';
        } else if (severity === 'High') {
          status = Math.random() < 0.6 ? '긴급' : (Math.random() < 0.7 ? '검토 필요' : '처리중');
        } else if (severity === 'Medium') {
          status = Math.random() < 0.4 ? '검토 필요' : (Math.random() < 0.6 ? '처리중' : '완료');
        } else {
          status = Math.random() < 0.3 ? '검토 필요' : (Math.random() < 0.5 ? '처리중' : '완료');
        }

        // 동반 약물 생성 (0-3개)
        const concomitantCount = Math.floor(Math.random() * 4);
        const concomitantMeds = [];
        for (let j = 0; j < concomitantCount; j++) {
          const concomitantDrug = drugs[Math.floor(Math.random() * drugs.length)];
          if (concomitantDrug.name !== drug.name && !concomitantMeds.includes(concomitantDrug.name)) {
            concomitantMeds.push(concomitantDrug.name);
          }
        }

        // 날짜 생성 (최근 6개월 내)
        const now = new Date();
        const sixMonthsAgo = new Date(now.getTime() - (6 * 30 * 24 * 60 * 60 * 1000));
        const reportDate = new Date(sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime()));
        const reactionDate = new Date(reportDate.getTime() - Math.random() * (7 * 24 * 60 * 60 * 1000)); // 신고일 이전 0-7일

        const caseData = {
          patientAge: age,
          patientGender: gender,
          drugName: drug.name,
          drugDosage: drug.dosages[Math.floor(Math.random() * drug.dosages.length)],
          adverseReaction: reaction.reaction,
          reactionDescription: reaction.descriptions[Math.floor(Math.random() * reaction.descriptions.length)],
          severity: severity,
          status: status,
          reporterId: adminUser.id,
          dateOfReaction: reactionDate,
          concomitantMeds: JSON.stringify(concomitantMeds),
          medicalHistory: medicalHistories[Math.floor(Math.random() * medicalHistories.length)],
          outcome: outcomes[Math.floor(Math.random() * outcomes.length)]
        };

        sampleCases.push(caseData);
        caseNumber++;
      }
    });

    console.log(`생성된 케이스 분포:`);
    console.log(`- Critical: ${severityDistribution.Critical}개`);
    console.log(`- High: ${severityDistribution.High}개`);
    console.log(`- Medium: ${severityDistribution.Medium}개`);
    console.log(`- Low: ${severityDistribution.Low}개`);
    console.log(`총 ${sampleCases.length}개 케이스 생성`);

    // 각 사례를 데이터베이스에 삽입
    let insertedCount = 0;
    for (const caseData of sampleCases) {
      try {
        await storage.createCase(caseData);
        insertedCount++;
        if (insertedCount % 10 === 0) {
          console.log(`진행률: ${insertedCount}/${sampleCases.length} 완료`);
        }
      } catch (error) {
        console.error(`케이스 삽입 실패:`, error);
      }
    }

    console.log(`샘플 데이터 삽입 완료: ${insertedCount}개의 부작용 사례가 추가되었습니다.`);

  } catch (error) {
    console.error('샘플 데이터 삽입 중 오류:', error);
  }
}

insert50SampleCases();