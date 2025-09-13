ICSR(Individual Case Safety Report, 개별 이상사례 보고서) 리포트 작성을 위한 **주요 기술 자료와 가이드라인**은 아래와 같습니다.

**1. 국제 표준 및 규정**

- ICSR 작성과 제출에는 ICH(국제의약품규제조화위원회) E2B(R3) 가이드라인이 필수적으로 적용됩니다.
- 국내에서는 식품의약품안전처(MFDS)에서 E2B(R3) 전자보고 관련 가이드라인 및 기술 명세를 발간하고 있으니 이를 반드시 참고해야 합니다.[^1_1][^1_2][^1_3][^1_4][^1_5]

**2. 핵심 기술 요소 및 주요 항목**

- **XML 데이터 형식**: ICSR 리포트는 표준화된 XML 파일 형식으로 제출해야 하며, 데이터 항목과 태그는 ICH에서 정한 스펙을 따라야 합니다.
- **필수 데이터 항목**:
    - 환자 정보(익명, 성별, 나이, 증상 등)
    - 의약품 정보(제품명, 제조사, 투여 경로, 투여 기간 등)
    - 이상사례 발생 정보(사건 요약과 타임라인, 중대성 평가 등)
    - 보고자 정보(기관, 담당자 등)
    - 각 항목 누락 시 UNK(알 수 없음), NA(해당 없음) 등의 자리 표시자 사용 필요
- **검증 룰**: XML 파일 검증 단계가 필수이며, 모든 데이터의 형식, 기재 방식, 중복 여부 등 기술적 검증에서 오류가 없어야 함.[^1_6][^1_7][^1_1]

**3. 주요 제출 프로세스**

- **보고자 등록 및 ID 발급**: 의약품통합정보시스템(한국은 nedrug.mfds.go.kr)에 보고자 정보를 선등록 후 발급받아야 함.
- **보고 절차**:
    - 최초보고/추적보고/수정보고/무효화보고 구분 필요
    - 수시, 일괄(batch) 업로드 모두 지원
- **시스템 운영**: 365일 24시간 보고 가능, 보고 내역은 별도 관리

**4. 검증 및 트러블 슈팅**

- 파일 제출 후 실시간 검증 수행
- 오류 발생시 에러 메시지(ACK 파일)로 원인 확인 후 수정 필요
- 테스트 제출 기능 지원

**5. 참고할 수 있는 공식 기술 자료**

- [식약처 ICSR 전자보고 공식 안내서(KOR, PDF)](https://hiropharmaconsulting.com/wp-content/uploads/2022/08/MFDS_ICH_E2BR3_E2BR3-Data-Elements-and-Message-Specification_2020-11_K.pdf) — E2B(R3) 데이터 항목, 검증 룰, XML 예시 및 시스템 활용 방법 등 상세[^1_1]
- [FDA E2B(R3) 개별 케이스 안전보고서 기술사양서(ENG)] — 구조, 제출 과정, 필드 상세[^1_6]
- [EU ICSR Implementation Guide(ENG, PDF)] — ISO 표준, 데이터 구조, 워크플로[^1_4]
- [식약처 공식 뉴스/보도자료 등](https://www.mfds.go.kr) 및 의약품안전원[^1_2][^1_3]
- 기타 기술적 문의는 각국 의약품안전 당국의 고객지원센터로 문의 가능

**요약:**
ICSR 리포트 작성은 표준 데이터 항목, 구조화된 XML 포맷, 자동화된 검증 및 전송 시스템(주로 ICH E2B(R3) 기준 적용)이 필수입니다. 국내외 주요 규정, 데이터 항목(환자, 의약품, 사건, 보고자), 프로세스(등록, 보고, 검증/수정)와 관련된 공식 가이드 문서를 반드시 확인하고, 오류 사례와 검증 FAQ도 실무에 참고해야 합니다.[^1_7][^1_3][^1_5][^1_2][^1_4][^1_1][^1_6]
<span style="display:none">[^1_10][^1_11][^1_12][^1_13][^1_14][^1_15][^1_16][^1_17][^1_8][^1_9]</span>

<div style="text-align: center">⁂</div>

[^1_1]: https://hiropharmaconsulting.com/wp-content/uploads/2022/08/MFDS_ICH_E2BR3_E2BR3-Data-Elements-and-Message-Specification_2020-11_K.pdf

[^1_2]: https://medicalworldnews.co.kr/m/view.php?idx=1510939012

[^1_3]: https://www.hankyung.com/article/202011304535Y

[^1_4]: https://www.ema.europa.eu/en/documents/regulatory-procedural-guideline/european-union-individual-case-safety-report-icsr-implementation-guide_en.pdf

[^1_5]: https://www.hkn24.com/news/articleView.html?idxno=318095

[^1_6]: https://ko.manuals.plus/fda/e2br3-electronic-transmission-of-individual-case-safety-reports-manual

[^1_7]: https://www.registrarcorp.com/ko/blog/medical-devices/medical-device-regulations/emdr/

[^1_8]: https://www.drugsafe.or.kr/cmm/fms/FileDown.do;jsessionid=OVQjLcVOYQu4lQv2oX2e2EMblFhXTN87Ba7jxEFtM9cT5ra4SqlbBSJVFqbtVq3M.webint_2_servlet_engine1?atchFileId=FILE_000000000032161\&fileSn=2

[^1_9]: https://www.e-sciencecentral.org/upload/jhis/pdf/jhis-42-3-199.pdf

[^1_10]: https://www.mfds.go.kr/brd/99/down.do?brd_id=ntc0021\&seq=45230\&data_tp=A\&file_seq=2

[^1_11]: https://pvpharmacist.tistory.com/4

[^1_12]: https://www.drugsafe.or.kr/cmm/fms/FileDown.do;jsessionid=cfDdR4tlZPsnCQ61qRnErPPgNSrJBHlZ1ymRDj418vAP2ldvgBaIGjV0fINBUbQN.webint_2_servlet_engine1?atchFileId=FILE_000000000036350\&fileSn=0\&flage=0

[^1_13]: https://translate.google.com/translate?u=https%3A%2F%2Fwww.quora.com%2FWhat-are-the-regulatory-reporting-timelines-for-ICSRs-in-pharmacovigilance\&hl=ko\&sl=en\&tl=ko\&client=srp

[^1_14]: https://www.fda.gov/industry/fda-data-standards-advisory-board/individual-case-safety-reports

[^1_15]: https://www.kobia.kr/bbs/download.php?tbl=data02\&no=508

[^1_16]: https://www.kobia.kr/bbs/download.php?tbl=data01\&no=4456

[^1_17]: https://scienceon.kisti.re.kr/srch/selectPORSrchReport.do?cn=TRKO201200006704


---

# ICSR(individual case safety report) 리포트 프로그램을 만들기 위하여 고려해야할 내용이 나와있는 문서를 정리 해.

ICSR(Individual Case Safety Report) 리포트 **프로그램 개발 시 고려해야 할 핵심 항목이 정리된 주요 문서**는 다음과 같습니다.

***

**1. 프로그램 개발을 위한 공식 기술 문서 목록 및 주요 내용**

- **식약처 ICSR 시스템 구축 안내서/규격서**
    - [국외 의약품 이상사례 파일보고 시스템 구축을 위한 안내](https://www.drugsafe.or.kr/cmm/fms/FileDown.do?atchFileId=FILE_000000000032161&fileSn=2):
E2BM(E2B Message) 규격서에 따른 데이터베이스 설계, ICSR 관계도, 필수 데이터 항목, 구조화 방식, XML/SGML DTD 구조 등 개발요소, 시스템 연계 방안, 데이터 검증 과정 등이 구체적으로 기술됨.[^2_1][^2_2]
    - [MFDS ICH E2B(R3) 데이터 요소 및 메시지 명세서(PDF)](https://hiropharmaconsulting.com/wp-content/uploads/2022/08/MFDS_ICH_E2BR3_E2BR3-Data-Elements-and-Message-Specification_2020-11_K.pdf):
XML ICSR 메시지 스키마, 각 항목별 길이/타입, batch 처리, 검증 절차, 테스트 보고 시스템 등 프로그램 구현에 직접 적용할 상세 가이드.[^2_3]
- **E2B(R3) 국제 가이드라인 및 기술 명세**
    - [ICH E2B(R3) ICSR 스펙 공식 문서](https://ich.org/page/e2br3-individual-case-safety-report-icsr-specification-and-related-files):
국제 표준 데이터 구조, 메시지 전송 방식, 데이터 요소 필수성, 참조 값, 연동 API 등 글로벌 시스템 개발에 반드시 참고해야 할 문서.[^2_4]
- **실무 적용 논문·해설**
    - [전자적 의약품 부작용 데이터 표준분석과 국내 적용](https://e-jhis.org/journal/view.php?number=533):
전자보고 시스템 개발 시 국제표준(E2B R3)의 필수 사항, XML 스키마와 데이터 구조, 데이터 간 관계, 국내 추가항목 및 실제 적용 예시 등 개발자 실무 관점의 상세 내용 제공.[^2_5][^2_6]

***

**2. 프로그램 개발 시 참고해야 할 주요 기술 내용**

- **시스템 구조 및 데이터베이스 설계**
    - 표준 XML 스키마에 기반한 데이터베이스 구조 설계
    - 각 데이터 항목의 속성, 코드, 유효성, 관계도(환자/약물/이상사례/보고자 등)
    - 적응형 확장: 국내(식약처 요구) 항목 및 글로벌(EU/FDA/ICH 등) 규정 병행 지원 필요
- **검증 및 오류 처리**
    - 보고 XML 파일 생성 시 검증 절차: 항목 누락/중복/유형 오류, 필수값 검증
    - 테스트 보고(테스트 ID 활용), ACK(응답) 기반 자동 오류 리포트 및 재처리
    - 유효한 보고자/수신자 ID 관리 및 배치(batch) 번호 처리 필수
- **국제 연동 및 표준화**
    - ICH E2B(R3) 국제 표준에 맞는 데이터 송수신 및 시스템 연동 구조
    - MedDRA(국제 의약용어) 표준 등 글로벌 용어·코드셋 적용
- **보안·접근제어 및 감사**
    - 안전성 보고자료의 전송/조회 구분, 사용자별 접근 권한 관리
    - 보고/수정/열람 이력 및 감사 로그 관리(규제기관 요구)
- **UI/UX, 사용성**
    - 다양한 사용자(전문가/관리자/의뢰인) 역할별 편의성 배려
    - 웹 기반 보고, 파일 업로드, 실시간 피드백 제공 등 지원

***

**3. 참조 가능한 주요 문서(링크 제공)**

- 식약처:
[국외 유해사례 파일보고 시스템 구축 안내서 (한글 PDF)](https://www.drugsafe.or.kr/cmm/fms/FileDown.do?atchFileId=FILE_000000000032161&fileSn=2)[^2_2][^2_1]
[약물이상반응 및 이상사례 전자보고 가이드라인(MFDS E2B(R3) PDF)](https://hiropharmaconsulting.com/wp-content/uploads/2022/08/MFDS_ICH_E2BR3_E2BR3-Data-Elements-and-Message-Specification_2020-11_K.pdf)[^2_3]
- ICH:
[E2B(R3) ICSR 공식 국제 표준 (영문)](https://ich.org/page/e2br3-individual-case-safety-report-icsr-specification-and-related-files)[^2_4]
- 실무 해설/논문:
[전자적 의약품 부작용 데이터 표준분석과 국내 적용(논문)](https://e-jhis.org/journal/view.php?number=533)[^2_5]

***

**결론:**
ICSR 리포트 프로그램 설계 단계에서 위 문서들을 반드시 참고하고, 표준화된 데이터 구조와 국제/국내 규정, 검증 논리, 실무 적용 사례, 연계 시나리오까지 종합적으로 고려해야 합니다.ICSR(Individual Case Safety Report) 전자보고 시스템 또는 리포트 프로그램을 개발할 때 **고려해야 할 핵심 요소가 나와 있는 공식 문서와 주요 내용**을 정리하면 아래와 같습니다.

***

**1. 공식 기술/가이드 문서**

- **식약처『국외 의약품 이상사례 파일보고 시스템 구축을 위한 안내』**
    - 데이터베이스와 프로그래밍 환경에서 ICSR의 구조(E2BM, 관계도, 필수/선택 데이터 항목, DTD/XML 구조)와 개발자·운영자 입장에서의 고려사항을 상세 규정.[^2_1][^2_2]
    - 이 문서에서는 ICSR 시스템을 개발할 때 데이터 요소별 필수성, 전송 형식, 검증 방식, 국제 표준(E2B R3) 준수 등 반드시 확인해야 할 기술적 세부내용(관계도, 테이블 구조, 메시지 명세 등)이 담겨 있음.
- **ICH E2B(R3) ICSR 공식 스펙 및 가이드라인**
    - 국제 간 표준 스키마(XML, 데이터 항목명, 오류 처리, 송수신 protocol, 메타데이터 관리 등), 연동 대상별(B2B/API) 요구사항 포함.[^2_5][^2_4]
- **MFDS ICHR E2B(R3) 데이터명세/검증 가이드라인**
    - 실제 시스템 개발 및 배치 전에 XML 파일 생성 규칙, 데이터 검증 항목, 테스트 보고용 기능, 승인·오류 메시지 처리 및 각종 코드셋 등 현업 구현에 필요한 항목을 자세히 안내.[^2_3]

***

**2. 프로그램 개발 과정에서 반드시 고려해야 할 내용(주요 문서들이 제시한 사항)**

- **표준화 및 확장성**
    - 글로벌 표준(ICH E2B R3) XML 스키마 및 식약처 국내요구사항 반영 구조 설계
    - 기본 데이터항목(환자정보, 약물정보, 이상사례, 보고자, 보고 유형 등)·관계도 명확화
- **검증 기능과 예외처리**
    - XML 파일 자동 검증(필수값, 항목 형식, 중복 검사, 유효성, 관련 ID)
    - 오류발생 시 에러메시지(ACK) 제공 및 관리자 UI/알림
- **보안 및 관리**
    - 사용자별 접근권한 분리(등록/검증/최종승인/이력관리)
    - 감사로그, 활동내역, 이상징후 탐지
- **연동/호환성**
    - MedDRA 등 국제 의약용어코드 적용, API/B2B 연계 용이성 설계
    - FDA, EMA, MFDS 등 글로벌 규제기관 업로드/호환 필수
- **운영 측면**
    - 테스트모드, 실시간/일괄 업로드, GUI 및 파일업로드 방식 병행 지원

***

**참고 URL 및 자료**

- [식약처 시스템 구축 안내서(국문, PDF)](https://www.drugsafe.or.kr/cmm/fms/FileDown.do?atchFileId=FILE_000000000032161&fileSn=2)[^2_2][^2_1]
- [MFDS E2B R3 데이터 명세서(국문, PDF)](https://hiropharmaconsulting.com/wp-content/uploads/2022/08/MFDS_ICH_E2BR3_E2BR3-Data-Elements-and-Message-Specification_2020-11_K.pdf)[^2_3]
- [ICH E2B(R3) 공식 문서(영문)](https://ich.org/page/e2br3-individual-case-safety-report-icsr-specification-and-related-files)[^2_4]
- [국내 적용 관련 논문/해설(전자적 의약품 부작용 데이터 표준분석 등)](https://e-jhis.org/journal/view.php?number=533)[^2_5]

**정리**
ICSR 리포트 프로그램을 개발하려면 반드시 위 공식문서와 실무 논문을 참고해 표준화, 검증, 연동, 운영, 보안 등 여러 측면을 종합적으로 설계해야 하며, 각 문서에 명시된 실제 관계도, 데이터 필드, 프로토콜 등을 반영해야 합니다.다음은 ICSR(Individual Case Safety Report) 리포트 프로그램 개발 시 반드시 참고해야 할 공식 가이드 및 기술 문서와, 해당 문서에서 강조하는 핵심 고려사항 정리입니다.

***
**1. 공식 문서 및 주요 내용**

- **식약처 「국외 의약품 이상사례 파일보고 시스템 구축을 위한 안내」**
    - E2B(R3) 규격 기반 데이터 구조, 데이터베이스 모델 및 관계도, XML/SGML 설계, 필수·선택 데이터 항목 목록
    - 개발자와 DB 관리자 관점의 프로그램 구현 체크포인트, 각 데이터 필드 설명[^2_1][^2_2]
- **MFDS E2B(R3) 데이터명세/메시지 사양**
    - XML 메시지 구조, 데이터 항목별 입력 규칙, 필드 길이, validation, batch 처리, 파일 검증 시나리오, 테스트보고 절차까지 구체적 가이드[^2_3]
- **국제 ICH E2B(R3) 공식 명세**
    - 국제 표준 데이터 스키마 정의(XML/XSD), 송수신 프로토콜과 상호운용성, 필수 메타데이터 구조와 오류 처리 방식[^2_4][^2_5]

***
**2. 개발 시 필수 고려사항(문서 주요 내용 요약)**

- **국제 표준 및 국내 규정 준수**
    - E2B(R3) XML 데이터 구조, 국제·국내 데이터 항목, MedDRA 등 국제 의약용어 표준 활용 필요
- **필수 시스템 구조**
    - 사용자/권한체계, 입출력 인터페이스(웹/파일/B2B), 프로세스(등록-검증-통보-이력)
    - 배치(Batch) 검증·관리, 보고자·수신자ID 관리, 감사로그 구축
- **자동 검증 및 에러처리**
    - 필수 데이터 항목 체크, 데이터 형식·코드 오류 자동 검증
    - 실시간 피드백 및 관리자 UI, 테스트 제출(테스트 ID 사용) 기능
- **보안·운영 고려**
    - 안전한 제출·조회, 다양한 사용 시나리오별 접근통제, 이력관리

***
**3. 직접 참고/다운로드 가능한 문서**

- [식약처 시스템 구축 안내서 (PDF/국문)](https://www.drugsafe.or.kr/cmm/fms/FileDown.do?atchFileId=FILE_000000000032161&fileSn=2)[^2_2][^2_1]
- [MFDS E2B(R3) 데이터 명세 (PDF/국문)](https://hiropharmaconsulting.com/wp-content/uploads/2022/08/MFDS_ICH_E2BR3_E2BR3-Data-Elements-and-Message-Specification_2020-11_K.pdf)[^2_3]
- [ICH 공식 스펙 페이지 (영문)](https://ich.org/page/e2br3-individual-case-safety-report-icsr-specification-and-related-files)[^2_4]
- [전자적 의약품 부작용 표준 해설 논문](https://e-jhis.org/journal/view.php?number=533)[^2_5]

***
**요약**:
ICSR 리포트 프로그램은 **국제표준(E2B R3) XML 구조, 국내별 필드/코드, 자동 검증, 실무자 편의, 보안·감사 이력** 등 복합요소를 포괄하는 구조로, 위 문서들에 실무적 설계·개발 포인트가 구체적으로 안내되어 있으니 반드시 참고하셔야 합니다.
<span style="display:none">[^2_10][^2_11][^2_12][^2_13][^2_14][^2_15][^2_16][^2_17][^2_18][^2_19][^2_20][^2_7][^2_8][^2_9]</span>

<div style="text-align: center">⁂</div>

[^2_1]: https://www.drugsafe.or.kr/cmm/fms/FileDown.do;jsessionid=ITJc1bQkF30gy6mPR76JhjMOGvancte6DhcXu7msAGDZ1IAb0KGJ5JC75ZFLojPV.webint_2_servlet_engine1?atchFileId=FILE_000000000042532\&fileSn=2\&flage=0

[^2_2]: https://www.drugsafe.or.kr/cmm/fms/FileDown.do;jsessionid=OVQjLcVOYQu4lQv2oX2e2EMblFhXTN87Ba7jxEFtM9cT5ra4SqlbBSJVFqbtVq3M.webint_2_servlet_engine1?atchFileId=FILE_000000000032161\&fileSn=2

[^2_3]: https://hiropharmaconsulting.com/wp-content/uploads/2022/08/MFDS_ICH_E2BR3_E2BR3-Data-Elements-and-Message-Specification_2020-11_K.pdf

[^2_4]: https://ich.org/page/e2br3-individual-case-safety-report-icsr-specification-and-related-files

[^2_5]: https://e-jhis.org/journal/view.php?number=533

[^2_6]: https://www.e-sciencecentral.org/upload/jhis/pdf/jhis-42-3-199.pdf

[^2_7]: https://www.veeva.com/kr/wp-content/uploads/2021/07/8_Whitepaper-Considerations_KO.pdf

[^2_8]: https://www.kpbma.or.kr/api/lounge/opinion/download/opinion/212092

[^2_9]: https://www.medipharmhealth.co.kr/news/article_print.html?no=83115

[^2_10]: https://www.mfds.go.kr/brd/m_99/down.do?brd_id=ntc0021\&seq=44716\&data_tp=A\&file_seq=2

[^2_11]: https://clarivate.com/life-sciences-healthcare/ko/research-development/pharmacovigilance-drug-safety/drug-safety-triager/

[^2_12]: https://www.phwr.org/journal/download_pdf.php?doi=10.56786%2FPHWR.2024.17.14.4

[^2_13]: https://www.drugsafe.or.kr/iwt/ds/ko/bbs/EgovBbs.do?bbsId=BBSMSTR_000000000251\&nttId=2538\&pageIndex=1\&searchCnd=\&searchWrd

[^2_14]: https://www.hkn24.com/news/articleView.html?idxno=318095

[^2_15]: https://www.kobia.kr/bbs/download.php?tbl=data01\&no=4456

[^2_16]: https://www.kobia.kr/bbs/download.php?tbl=data02\&no=508

[^2_17]: http://m.yakup.com/news/index.html?cat=interview\&mode=view\&nid=312158

[^2_18]: https://www.lskglobal.com/board/download.php?board=Y\&bo_table=news\&file_name=b_file_15851968129dvkic629j.docx\&o_file_name=171122_%EB%B3%B4%EB%8F%84%EC%9E%90%EB%A3%8C_lsk+global+ps+%EC%9C%A0%EB%9F%BD%EC%9D%98%EC%95%BD%ED%92%88%EC%95%88%EC%A0%84%EA%B4%80%EB%A6%AC+%EA%B8%B0%EC%A4%80+%EC%A4%80%ED%95%98%EB%8A%94+%EC%95%BD%EB%AC%BC%EA%B0%90%EC%8B%9C+%EC%84%9C%EB%B9%84%EC%8A%A4++%EC%A0%9C%EA%B3%B5.docx

[^2_19]: https://www.mfds.go.kr/brd/m_1060/view.do?seq=13056

[^2_20]: https://www.kobia.kr/imagebox/upload/20231101163449.pdf

