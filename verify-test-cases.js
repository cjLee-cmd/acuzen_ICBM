import { storage } from "./server/storage.ts";

// 테스트 케이스 검증 스크립트
async function verifyTestCases() {
  try {
    console.log('=== 테스트 케이스 검증 시작 ===\n');

    // 전체 케이스 수 확인
    const allCases = await storage.listCases();
    console.log(`📊 전체 케이스 수: ${allCases.length}개`);

    // 심각도별 통계
    const severityStats = allCases.reduce((stats, case_) => {
      stats[case_.severity] = (stats[case_.severity] || 0) + 1;
      return stats;
    }, {});

    console.log('\n🔍 심각도별 사례 분포:');
    Object.entries(severityStats).forEach(([severity, count]) => {
      const percentage = ((count / allCases.length) * 100).toFixed(1);
      console.log(`  ${severity}: ${count}개 (${percentage}%)`);
    });

    // 상태별 통계
    const statusStats = allCases.reduce((stats, case_) => {
      stats[case_.status] = (stats[case_.status] || 0) + 1;
      return stats;
    }, {});

    console.log('\n📋 상태별 사례 분포:');
    Object.entries(statusStats).forEach(([status, count]) => {
      const percentage = ((count / allCases.length) * 100).toFixed(1);
      console.log(`  ${status}: ${count}개 (${percentage}%)`);
    });

    // 성별 분포
    const genderStats = allCases.reduce((stats, case_) => {
      stats[case_.patientGender] = (stats[case_.patientGender] || 0) + 1;
      return stats;
    }, {});

    console.log('\n👥 환자 성별 분포:');
    Object.entries(genderStats).forEach(([gender, count]) => {
      const percentage = ((count / allCases.length) * 100).toFixed(1);
      console.log(`  ${gender}: ${count}개 (${percentage}%)`);
    });

    // 연령 분포 분석
    const ageGroups = {
      '18-30세': 0,
      '31-50세': 0,
      '51-70세': 0,
      '71세 이상': 0
    };

    allCases.forEach(case_ => {
      const age = case_.patientAge;
      if (age >= 18 && age <= 30) ageGroups['18-30세']++;
      else if (age >= 31 && age <= 50) ageGroups['31-50세']++;
      else if (age >= 51 && age <= 70) ageGroups['51-70세']++;
      else if (age >= 71) ageGroups['71세 이상']++;
    });

    console.log('\n🎂 연령대별 분포:');
    Object.entries(ageGroups).forEach(([ageGroup, count]) => {
      const percentage = ((count / allCases.length) * 100).toFixed(1);
      console.log(`  ${ageGroup}: ${count}개 (${percentage}%)`);
    });

    // 주요 약물 TOP 10
    const drugStats = allCases.reduce((stats, case_) => {
      stats[case_.drugName] = (stats[case_.drugName] || 0) + 1;
      return stats;
    }, {});

    const topDrugs = Object.entries(drugStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    console.log('\n💊 주요 약물 TOP 10:');
    topDrugs.forEach(([drug, count], index) => {
      console.log(`  ${index + 1}. ${drug}: ${count}건`);
    });

    // 주요 부작용 TOP 10
    const reactionStats = allCases.reduce((stats, case_) => {
      stats[case_.adverseReaction] = (stats[case_.adverseReaction] || 0) + 1;
      return stats;
    }, {});

    const topReactions = Object.entries(reactionStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    console.log('\n⚠️ 주요 부작용 TOP 10:');
    topReactions.forEach(([reaction, count], index) => {
      console.log(`  ${index + 1}. ${reaction}: ${count}건`);
    });

    // 최근 생성된 케이스 5개 미리보기
    const recentCases = allCases
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    console.log('\n📅 최근 생성된 사례 5개:');
    recentCases.forEach((case_, index) => {
      console.log(`  ${index + 1}. ${case_.caseNumber} - ${case_.drugName} (${case_.adverseReaction}) - ${case_.severity}`);
    });

    console.log('\n✅ 테스트 케이스 검증 완료!');
    console.log(`📈 총 ${allCases.length}개의 부작용 사례가 시스템에 등록되어 있습니다.`);

  } catch (error) {
    console.error('❌ 검증 중 오류 발생:', error);
  }
}

// 스크립트 실행
verifyTestCases().then(() => {
  console.log('\n검증 스크립트 완료');
  process.exit(0);
}).catch((error) => {
  console.error('검증 스크립트 실행 실패:', error);
  process.exit(1);
});