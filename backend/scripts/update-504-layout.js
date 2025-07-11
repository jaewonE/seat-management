/**
 * 504호 좌석 레이아웃 업데이트 스크립트
 * 504호와 504A호를 통합하고 정확한 좌석 레이아웃 적용
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// 환경 변수 로드
dotenv.config({ path: './.env' });

// MongoDB 연결
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB 연결 성공: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB 연결 오류: ${error.message}`);
    process.exit(1);
  }
};

// 504호 좌석 레이아웃 업데이트 함수
const updateLayout = async () => {
  try {
    // MongoDB 연결
    const conn = await connectDB();
    const db = conn.connection.db;
    const seatsCollection = db.collection('seats');
    
    // 기존 504호 좌석 삭제
    const deleteResult = await seatsCollection.deleteMany({ 
      roomNumber: { $in: ['504', '504A'] } 
    });
    console.log(`기존 504호 및 504A호 좌석 ${deleteResult.deletedCount}개를 삭제했습니다.`);
    
    // 새로운 504호 좌석 레이아웃 구성
    const layoutData = [
      // 일반 좌석
      { number: '1', row: 0, col: 0 },
      { number: '2', row: 0, col: 1 },
      { number: '3', row: 0, col: 2 },
      { number: '4', row: 1, col: 0 },
      { number: '5', row: 1, col: 1 },
      { number: '6', row: 1, col: 2 },
      { number: '7', row: 2, col: 0 },
      { number: '8', row: 2, col: 1 },
      { number: '9', row: 2, col: 2 },
      { number: '10', row: 3, col: 0 },
      { number: '11', row: 3, col: 1 },
      { number: '12', row: 3, col: 2 },
      { number: '13', row: 4, col: 0 },
      { number: '14', row: 4, col: 1 },
      { number: '15', row: 4, col: 2 },
      { number: '57', row: 5, col: 0 },
      { number: '58', row: 5, col: 1 },
      { number: '59', row: 5, col: 2 }
    ];
    
    // 오브젝트 데이터 (기둥, 창문, 에어컨 등)
    const objectData = [
      // 창문 (우측 벽)
      { objectType: 'window', objectName: '창문', row: 0, col: 3 },
      { objectType: 'window', objectName: '창문', row: 1, col: 3 },
      { objectType: 'window', objectName: '창문', row: 2, col: 3 },
      { objectType: 'window', objectName: '창문', row: 3, col: 3 },
      { objectType: 'window', objectName: '창문', row: 4, col: 3 },
      
      // 출입구 (하단)
      { objectType: 'door', objectName: '출입구', row: 6, col: 0 },
      { objectType: 'door', objectName: '출입구', row: 6, col: 1 },
      
      // 에어컨 (상단 중앙)
      { objectType: 'ac', objectName: '에어컨', row: 0, col: 4 },
      
      // 기둥 (좌측 하단)
      { objectType: 'pillar', objectName: '기둥', row: 5, col: 3 }
    ];
    
    // 모든 아이템 합치기
    const allItems = [
      ...layoutData.map(seat => ({
        number: seat.number,
        section: '504',
        roomNumber: '504',
        seatId: `504-${seat.number}`,
        type: '석사',
        row: seat.row,
        col: seat.col,
        status: 'available',
        assignedTo: null,
        confirmed: false,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })),
      ...objectData.map((obj, index) => ({
        number: `obj-${index}`,
        section: '504',
        roomNumber: '504',
        seatId: `504-obj-${index}`,
        objectType: obj.objectType,
        objectName: obj.objectName,
        row: obj.row,
        col: obj.col,
        status: 'disabled',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    ];
    
    // 새 좌석 및 오브젝트 데이터 삽입
    if (allItems.length > 0) {
      const insertResult = await seatsCollection.insertMany(allItems);
      console.log(`${insertResult.insertedCount}개의 504호 아이템을 생성했습니다.`);
    }
    
    console.log('504호 좌석 레이아웃 업데이트가 완료되었습니다.');
    
    // 연결 종료
    await mongoose.connection.close();
    
  } catch (error) {
    console.error(`좌석 레이아웃 업데이트 오류: ${error.message}`);
    process.exit(1);
  }
};

// 스크립트 실행
updateLayout(); 