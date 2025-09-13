import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from "./shared/schema.ts";

const databasePath = './dev.db';
const sqlite = new Database(databasePath);
sqlite.pragma('journal_mode = WAL');

const db = drizzle({ client: sqlite, schema });

// 샘플 부작용 사례 데이터 생성
async function insertSampleCases() {
  try {
    console.log('샘플 부작용 사례 데이터 삽입 시작...');

    // 기존 관리자 사용자 ID 사용 (시드 데이터에서 생성된)
    const adminUserId = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, 'admin@pharma.com')
    });

    if (!adminUserId) {
      console.error('관리자 사용자를 찾을 수 없습니다.');
      return;
    }

    const sampleCases = [
      {
        caseNumber: 'ADR-2024-001',
        patientAge: 65,
        patientGender: '여성',
        drugName: '아토르바스타틴',
        drugDosage: '20mg 1일 1회',
        adverseReaction: '근육통',
        reactionDescription: '투약 시작 2주 후부터 양쪽 다리와 팔에 근육통 발생. 일상생활에 지장을 줄 정도의 통증 호소.',
        severity: 'Medium',
        status: '검토 필요',
        reporterId: adminUserId.id,
        dateReported: new Date(),
        dateOfReaction: new Date(Date.now() - (86400 * 1000 * 14)), // 2주 전
        concomitantMeds: JSON.stringify([
          { name: '메트포민', dosage: '500mg 1일 2회' },
          { name: '라미프릴', dosage: '5mg 1일 1회' }
        ]),
        medicalHistory: '제2형 당뇨병, 고혈압',
        outcome: '약물 중단 후 증상 호전',
        isDeleted: false,
        createdAt: new Date(Date.now() - (86400 * 1000 * 1)), // 1일 전
        updatedAt: new Date(Date.now() - (86400 * 1000 * 1))
      },
      {
        caseNumber: 'ADR-2024-002',
        patientAge: 42,
        patientGender: '남성',
        drugName: '아목시실린',
        drugDosage: '500mg 1일 3회',
        adverseReaction: '피부 발진',
        reactionDescription: '항생제 복용 3일 후 전신에 붉은 반점과 가려움증 발생. 특히 얼굴과 목 부위에 심한 발진.',
        severity: 'High',
        status: '긴급',
        reporterId: adminUserId.id,
        dateReported: new Date(),
        dateOfReaction: new Date(Date.now() - (86400 * 1000 * 3)), // 3일 전
        concomitantMeds: JSON.stringify([
          { name: '이부프로펜', dosage: '400mg 필요시' }
        ]),
        medicalHistory: '알레르기 병력 없음',
        outcome: '항히스타민제 투여 후 증상 완화',
        isDeleted: false,
        createdAt: new Date(Date.now() - (86400 * 1000 * 0.5)), // 12시간 전
        updatedAt: new Date(Date.now() - (86400 * 1000 * 0.5))
      },
      {
        caseNumber: 'ADR-2024-003',
        patientAge: 28,
        patientGender: '여성',
        drugName: '로라타딘',
        drugDosage: '10mg 1일 1회',
        adverseReaction: '졸음',
        reactionDescription: '알레르기 비염 치료를 위해 복용 시작 후 지속적인 졸음과 집중력 저하 발생.',
        severity: 'Low',
        status: '처리중',
        reporterId: adminUserId.id,
        dateReported: new Date(),
        dateOfReaction: new Date(Date.now() - (86400 * 1000 * 7)), // 7일 전
        concomitantMeds: JSON.stringify([]),
        medicalHistory: '알레르기 비염',
        outcome: '용량 조절 후 증상 감소',
        isDeleted: false,
        createdAt: new Date(Date.now() - (86400 * 1000 * 2)), // 2일 전
        updatedAt: new Date(Date.now() - (86400 * 1000 * 1))
      }
    ];

    // 사례 데이터 삽입
    for (const caseData of sampleCases) {
      await db.insert(schema.cases).values(caseData);
      console.log(`사례 ${caseData.caseNumber} 삽입 완료`);
    }

    console.log('샘플 부작용 사례 데이터 삽입 완료!');

  } catch (error) {
    console.error('샘플 데이터 삽입 중 오류:', error);
  } finally {
    sqlite.close();
  }
}

// 스크립트 실행
insertSampleCases();