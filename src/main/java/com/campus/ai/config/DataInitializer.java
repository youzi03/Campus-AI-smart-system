package com.campus.ai.config;

import com.campus.ai.entity.*;
import com.campus.ai.repository.*;
import com.campus.ai.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * 应用启动时初始化示例数据 + 默认登录账号
 * 注意：登录账号每次启动都会检查并补充，确保管理员账号始终存在
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final OpLogRepository opLogRepository;
    private final RegistrationCertificateRepository certificateRepository;
    private final CourseRepository courseRepository;
    private final ClassroomRepository classroomRepository;
    private final LabRepository labRepository;
    private final ScheduleRepository scheduleRepository;
    private final ScoreRepository scoreRepository;
    private final NoticeRepository noticeRepository;
    private final DormRoomRepository dormRoomRepository;
    private final DormAllocationRepository dormAllocationRepository;
    private final BookRepository bookRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final UserRepository userRepository;
    private final AuthService authService;

    @Override
    public void run(String... args) {
        // ==================== 每次启动都确保登录账号存在 ====================
        ensureAccountsExist();
        ensureCertificatesExist();

        // ==================== 业务数据仅首次启动时初始化 ====================
        if (studentRepository.count() > 0) {
            log.info("数据库已有业务数据，跳过示例数据初始化");
            return;
        }

        log.info("初始化示例业务数据...");

        // ---- 学生示例数据 ----
        studentRepository.save(createStudent("2025001", "张明", "男", "2005-08-12", "计算机学院", "软件工程", "13800138001", "1号楼302", "大三", "在读"));
        studentRepository.save(createStudent("2025002", "李思琪", "女", "2005-10-20", "数学学院", "应用数学", "13800138002", "2号楼205", "大二", "在读"));
        studentRepository.save(createStudent("2025003", "王浩然", "男", "2005-05-18", "计算机学院", "计算机科学与技术", "13800138003", "1号楼305", "大三", "在读"));
        studentRepository.save(createStudent("2025004", "赵雅婷", "女", "2006-02-11", "外语学院", "英语", "13800138004", "2号楼401", "大一", "在读"));
        studentRepository.save(createStudent("2025005", "陈俊杰", "男", "2004-12-09", "物理学院", "物理学", "13800138005", "3号楼102", "大四", "在读"));
        studentRepository.save(createStudent("2025006", "刘雨桐", "女", "2005-07-22", "经济学院", "经济学", "13800138006", "2号楼502", "大二", "休学"));
        studentRepository.save(createStudent("2025007", "孙博文", "男", "2005-03-30", "计算机学院", "人工智能", "13800138007", "1号楼201", "大三", "在读"));
        studentRepository.save(createStudent("2025008", "周嘉怡", "女", "2006-01-14", "化学学院", "应用化学", "13800138008", "4号楼303", "大一", "在读"));
        studentRepository.save(createStudent("2025009", "吴天宇", "男", "2004-11-05", "机械学院", "机械工程", "13800138009", "3号楼102", "大四", "在读"));
        studentRepository.save(createStudent("2025010", "郑欣怡", "女", "2005-09-15", "艺术学院", "视觉设计", "13800138010", "4号楼501", "大二", "在读"));

        // ---- 教师示例数据 ----
        teacherRepository.save(createTeacher("T001", "王明", "男", "计算机学院", "副教授", "软件工程", "13911112222", "wangming@edu.cn", 2015));
        teacherRepository.save(createTeacher("T002", "李华", "女", "数学学院", "讲师", "应用数学", "13922223333", "lihua@edu.cn", 2018));
        teacherRepository.save(createTeacher("T003", "张伟", "男", "计算机学院", "教授", "人工智能", "13933334444", "zhangwei@edu.cn", 2010));
        teacherRepository.save(createTeacher("T004", "陈雪", "女", "外语学院", "副教授", "英语", "13944445555", "chenxue@edu.cn", 2012));
        teacherRepository.save(createTeacher("T005", "刘强", "男", "物理学院", "教授", "物理学", "13955556666", "liuqiang@edu.cn", 2008));
        teacherRepository.save(createTeacher("T006", "黄丽", "女", "经济学院", "讲师", "经济学", "13966667777", "huangli@edu.cn", 2019));

        // ---- 课程示例数据 ----
        saveCourse("CS101", "数据结构", "王明", "T001", 4, 64, "计算机学院", "2025-2026春", 60);
        saveCourse("CS102", "操作系统", "张伟", "T003", 4, 64, "计算机学院", "2025-2026春", 60);
        saveCourse("MA201", "高等数学", "李华", "T002", 5, 80, "数学学院", "2025-2026春", 80);
        saveCourse("EN101", "大学英语", "陈雪", "T004", 3, 48, "外语学院", "2025-2026春", 70);
        saveCourse("PH101", "大学物理", "刘强", "T005", 4, 64, "物理学院", "2025-2026春", 70);
        saveCourse("EC201", "微观经济学", "黄丽", "T006", 3, 48, "经济学院", "2025-2026春", 60);

        // ---- 教室示例数据 ----
        saveClassroom("A101", "教学楼A-101", "A栋", 1, 80, "多媒体教室", "投影仪,音响,空调", "可用");
        saveClassroom("A201", "教学楼A-201", "A栋", 2, 60, "多媒体教室", "投影仪,音响,空调", "可用");
        saveClassroom("B102", "教学楼B-102", "B栋", 1, 120, "阶梯教室", "投影仪,麦克风,空调", "可用");
        saveClassroom("B205", "教学楼B-205", "B栋", 2, 60, "多媒体教室", "投影仪,电脑,空调", "维护中");

        // ---- 实验室示例数据 ----
        saveLab("LAB-C301", "计算机实验室 C-301", "C栋实验楼", 3, 40, "计算机实验室", 40, "张老师", "13811112222", "DELL台式机×40,投影仪,交换机", "可用");
        saveLab("LAB-C302", "物理实验室 C-302", "C栋实验楼", 3, 30, "物理实验室", 10, "刘老师", "13822223333", "力学实验台×10,光学实验设备,电脑", "可用");
        saveLab("LAB-D401", "化学实验室 D-401", "D栋实验楼", 4, 30, "化学实验室", 0, "陈老师", "13833334444", "实验台×12,通风橱,显微镜", "可用");
        saveLab("LAB-E501", "电子实验室 E-501", "E栋实验楼", 5, 40, "电子实验室", 20, "黄老师", "13844445555", "示波器×20,信号源,电脑", "维护中");

        // ---- 课表示例数据 ----
        saveSchedule("SCH001", "CS101", "数据结构", "T001", "王明", 1, 1, "A101", "教学楼A-101", "计科2025-1班", "1-16周", "blue");
        saveSchedule("SCH002", "MA201", "高等数学", "T002", "李华", 1, 2, "B102", "教学楼B-102", "计科2025-1班", "1-16周", "green");
        saveSchedule("SCH003", "EN101", "大学英语", "T004", "陈雪", 2, 1, "A201", "教学楼A-201", "计科2025-1班", "1-16周", "orange");
        saveSchedule("SCH004", "CS102", "操作系统", "T003", "张伟", 2, 3, "LAB-C301", "计算机实验室 C-301", "计科2025-1班", "1-16周", "purple");
        saveSchedule("SCH005", "PH101", "大学物理", "T005", "刘强", 3, 2, "B102", "教学楼B-102", "计科2025-1班", "1-16周", "pink");
        saveSchedule("SCH006", "EC201", "微观经济学", "T006", "黄丽", 3, 3, "A201", "教学楼A-201", "经管2025-1班", "1-16周", "blue");
        saveSchedule("SCH007", "CS101", "数据结构", "T001", "王明", 4, 1, "A101", "教学楼A-101", "计科2025-1班", "1-16周", "blue");
        saveSchedule("SCH008", "MA201", "高等数学", "T002", "李华", 4, 3, "B102", "教学楼B-102", "计科2025-1班", "1-16周", "green");
        saveSchedule("SCH009", "PH101", "大学物理", "T005", "刘强", 5, 2, "LAB-C302", "物理实验室 C-302", "计科2025-1班", "1-16周", "pink");
        saveSchedule("SCH010", "EN101", "大学英语", "T004", "陈雪", 5, 1, "A201", "教学楼A-201", "计科2025-1班", "1-16周", "orange");

        // ---- 成绩示例数据 ----
        saveScore("SC001", "2025001", "张明", "CS101", "数据结构", 88.0, "2025-2026春", "期末", "2026-01-10");
        saveScore("SC002", "2025001", "张明", "MA201", "高等数学", 92.0, "2025-2026春", "期末", "2026-01-10");
        saveScore("SC003", "2025002", "李思琪", "MA201", "高等数学", 95.0, "2025-2026春", "期末", "2026-01-10");
        saveScore("SC004", "2025002", "李思琪", "EN101", "大学英语", 86.0, "2025-2026春", "期末", "2026-01-11");
        saveScore("SC005", "2025003", "王浩然", "CS101", "数据结构", 79.0, "2025-2026春", "期末", "2026-01-11");
        saveScore("SC006", "2025003", "王浩然", "CS102", "操作系统", 82.0, "2025-2026春", "期末", "2026-01-12");
        saveScore("SC007", "2025004", "赵雅婷", "EN101", "大学英语", 90.0, "2025-2026春", "期末", "2026-01-12");
        saveScore("SC008", "2025005", "陈俊杰", "PH101", "大学物理", 68.0, "2025-2026春", "期末", "2026-01-13");
        saveScore("SC009", "2025006", "刘雨桐", "EC201", "微观经济学", 74.0, "2025-2026春", "期末", "2026-01-13");
        saveScore("SC010", "2025007", "孙博文", "CS101", "数据结构", 85.0, "2025-2026春", "期末", "2026-01-14");
        saveScore("SC011", "2025008", "周嘉怡", "MA201", "高等数学", 71.0, "2025-2026春", "期末", "2026-01-14");
        saveScore("SC012", "2025009", "吴天宇", "PH101", "大学物理", 58.0, "2025-2026春", "期末", "2026-01-15");

        // ---- 公告示例数据 ----
        saveNotice("N001", "关于2026年春季学期开学工作的通知", "重要", "high", "全体师生", "教务处", "根据学校安排，2026年春季学期将于2月24日正式开学。", "2026-01-20", 1892, true);
        saveNotice("N002", "【预警】期末考试成绩低于60分学生名单提醒", "预警", "warning", "相关学生", "学生工作处", "以下学生本次期末考试存在不及格科目，请及时关注并安排补考。", "2026-01-18", 452, false);
        saveNotice("N003", "图书馆寒假开放时间调整公告", "通知", "normal", "全体师生", "图书馆", "寒假期间图书馆开放时间调整为：周一至周五 9:00-17:00。", "2026-01-15", 1203, false);
        saveNotice("N004", "关于开展2026年度科研项目申报工作的通知", "通知", "normal", "教师", "科研处", "现启动2026年度科研项目申报工作。", "2026-01-12", 688, false);
        saveNotice("N005", "校园网络安全升级通知", "通知", "normal", "全体师生", "信息中心", "校园网络将于1月25日凌晨2:00-6:00进行安全升级。", "2026-01-10", 2341, false);

        // ---- 宿舍示例数据 ----
        saveDormRoom("D-A1-302","A栋",3,"302","4人间",4,"男",1200,"使用中");
        saveDormRoom("D-A1-305","A栋",3,"305","4人间",4,"男",1200,"使用中");
        saveDormRoom("D-A1-201","A栋",2,"201","4人间",4,"男",1200,"使用中");
        saveDormRoom("D-B2-205","B栋",2,"205","4人间",4,"女",1200,"使用中");
        saveDormRoom("D-B2-401","B栋",4,"401","4人间",4,"女",1200,"使用中");
        saveDormRoom("D-B2-502","B栋",5,"502","4人间",4,"女",1200,"使用中");
        saveDormRoom("D-C3-102","C栋",1,"102","6人间",6,"男",900,"使用中");
        saveDormRoom("D-C3-204","C栋",2,"204","6人间",6,"男",900,"使用中");
        saveDormRoom("D-D4-303","D栋",3,"303","4人间",4,"女",1200,"使用中");
        saveDormRoom("D-D4-501","D栋",5,"501","4人间",4,"女",1200,"空闲");
        saveDormAllocation("AL001","D-A1-302","2025001","张明","2025-09-01","在住");
        saveDormAllocation("AL002","D-A1-305","2025003","王浩然","2025-09-02","在住");
        saveDormAllocation("AL003","D-A1-201","2025007","孙博文","2025-09-06","在住");
        saveDormAllocation("AL004","D-B2-205","2025002","李思琪","2025-09-01","在住");
        saveDormAllocation("AL005","D-B2-401","2025004","赵雅婷","2025-09-03","在住");
        saveDormAllocation("AL006","D-B2-502","2025006","刘雨桐","2025-09-05","在住");
        saveDormAllocation("AL007","D-C3-102","2025005","陈俊杰","2025-09-01","在住");
        saveDormAllocation("AL008","D-C3-204","2025009","吴天宇","2025-09-08","在住");
        saveDormAllocation("AL009","D-D4-303","2025008","周嘉怡","2025-09-07","在住");
        saveDormAllocation("AL010","D-D4-501","2025010","郑欣怡","2025-09-09","在住");

        // ---- 图书示例数据 ----
        saveBook("B001","978-7-121-36541-1","数据结构与算法分析","Mark Allen Weiss","电子工业出版社","计算机",2020,10,6,59.00,"A区-3架-5层");
        saveBook("B002","978-7-111-54541-2","深入理解计算机系统","Randal E. Bryant","机械工业出版社","计算机",2019,8,3,139.00,"A区-3架-3层");
        saveBook("B003","978-7-04-039541-3","高等数学（第七版）","同济大学数学系","高等教育出版社","数学",2014,30,18,45.50,"B区-1架-2层");
        saveBook("B004","978-7-5135-32541-4","新概念英语（新版）","L.G. Alexander","外语教学与研究出版社","外语",2018,20,12,38.00,"C区-1架-1层");
        saveBook("B005","978-7-04-025841-5","大学物理","程守洙","高等教育出版社","物理",2016,25,14,52.00,"B区-2架-4层");
        saveBook("B006","978-7-302-24541-6","经济学原理","曼昆","清华大学出版社","经济",2020,15,8,88.00,"D区-2架-2层");
        saveBook("B007","978-7-115-51541-7","人工智能：一种现代方法","Stuart Russell","人民邮电出版社","计算机",2021,6,2,168.00,"A区-5架-1层");
        saveBook("B008","978-7-5086-42541-8","红楼梦","曹雪芹","人民文学出版社","文学",2008,20,15,59.80,"E区-1架-3层");
        saveBorrowRecord("BR001","B001","数据结构与算法分析","2025001","张明","2026-01-10","2026-03-10",null,"借阅中");
        saveBorrowRecord("BR002","B002","深入理解计算机系统","2025003","王浩然","2026-01-08","2026-03-08",null,"借阅中");
        saveBorrowRecord("BR003","B003","高等数学（第七版）","2025002","李思琪","2025-12-15","2026-02-15",null,"已逾期");
        saveBorrowRecord("BR004","B004","新概念英语（新版）","2025004","赵雅婷","2026-01-12","2026-03-12",null,"借阅中");
        saveBorrowRecord("BR005","B007","人工智能：一种现代方法","2025007","孙博文","2026-01-05","2026-03-05",null,"借阅中");
        saveBorrowRecord("BR006","B008","红楼梦","2025010","郑欣怡","2025-11-20","2026-01-20","2026-01-18","已归还");
        saveBorrowRecord("BR007","B005","大学物理","2025005","陈俊杰","2026-01-15","2026-03-15",null,"借阅中");

        // ---- 操作日志示例 ----
        opLogRepository.save(createOpLog("新增", "学生", "2025001", "新增学生：张明"));
        opLogRepository.save(createOpLog("新增", "学生", "2025002", "新增学生：李思琪"));
        opLogRepository.save(createOpLog("编辑", "学生", "2025001", "修改电话：13800138001 → 13800138999"));
        opLogRepository.save(createOpLog("状态变更", "学生", "2025006", "刘雨桐：休学（在读 → 休学）"));

        log.info("初始化完成：{} 名学生, {} 名教师, {} 门课程, {} 间教室, {} 个实验室, {} 节课表, {} 条成绩, {} 条公告, {} 间宿舍, {} 本图书, {} 条日志, {} 个账号",
                studentRepository.count(), teacherRepository.count(),
                courseRepository.count(), classroomRepository.count(), labRepository.count(), scheduleRepository.count(),
                scoreRepository.count(), noticeRepository.count(),
                dormRoomRepository.count(), bookRepository.count(),
                opLogRepository.count(), userRepository.count());
    }

    /**
     * 确保登录账号存在（每次启动都执行，不会覆盖已有账号）
     */
    private void ensureAccountsExist() {
        log.info("检查并补充登录账号...");

        // 管理员账号
        if (!userRepository.existsByUsername("admin")) {
            authService.createAccount("admin", "Admin@2024", "admin", "系统管理员", "15595822412");
            log.info("创建管理员账号: admin");
        }

        // 学生账号（仅当学生表有数据时创建）
        if (studentRepository.count() > 0) {
            for (String[] s : new String[][]{
                {"2025001", "张明"}, {"2025002", "李思琪"}, {"2025003", "王浩然"},
                {"2025004", "赵雅婷"}, {"2025005", "陈俊杰"}, {"2025006", "刘雨桐"},
                {"2025007", "孙博文"}, {"2025008", "周嘉怡"}, {"2025009", "吴天宇"},
                {"2025010", "郑欣怡"}
            }) {
                if (!userRepository.existsByUsername(s[0])) {
                    authService.createAccount(s[0], s[0], "student", s[1], "");
                }
            }
        }

        // 教师账号
        if (teacherRepository.count() > 0) {
            for (String[] t : new String[][]{
                {"T001", "王明"}, {"T002", "李华"}, {"T003", "张伟"},
                {"T004", "陈雪"}, {"T005", "刘强"}, {"T006", "黄丽"}
            }) {
                if (!userRepository.existsByUsername(t[0])) {
                    authService.createAccount(t[0], t[0], "teacher", t[1], "");
                }
            }
        }

        log.info("当前账号总数: {}", userRepository.count());
    }

    // ==================== 创建对象的方法 ====================

    private Student createStudent(String id, String name, String gender, String birth,
                                   String college, String major, String phone,
                                   String dorm, String grade, String status) {
        Student s = new Student();
        s.setId(id); s.setName(name); s.setGender(gender); s.setBirth(birth);
        s.setCollege(college); s.setMajor(major); s.setPhone(phone);
        s.setDorm(dorm); s.setGrade(grade); s.setStatus(status);
        s.setCreateAt(java.time.LocalDate.now().toString());
        return s;
    }

    private Teacher createTeacher(String id, String name, String gender, String college,
                                   String title, String major, String phone,
                                   String email, int joinYear) {
        Teacher t = new Teacher();
        t.setId(id); t.setName(name); t.setGender(gender); t.setCollege(college);
        t.setTitle(title); t.setMajor(major); t.setPhone(phone); t.setEmail(email);
        t.setJoinYear(joinYear);
        return t;
    }

    private OpLog createOpLog(String type, String target, String targetId, String detail) {
        OpLog log = new OpLog();
        log.setType(type); log.setTarget(target); log.setTargetId(targetId);
        log.setOperator("管理员"); log.setDetail(detail);
        return log;
    }

    private void saveCourse(String id, String name, String teacher, String teacherId, int credit, int hours, String college, String semester, int capacity) {
        Course c = new Course(); c.setId(id); c.setName(name); c.setTeacher(teacher); c.setTeacherId(teacherId);
        c.setCredit(credit); c.setHours(hours); c.setCollege(college); c.setSemester(semester); c.setCapacity(capacity);
        courseRepository.save(c);
    }

    private void saveClassroom(String id, String name, String building, int floor, int capacity, String type, String equipment, String status) {
        Classroom r = new Classroom(); r.setId(id); r.setName(name); r.setBuilding(building); r.setFloor(floor);
        r.setCapacity(capacity); r.setType(type); r.setEquipment(equipment); r.setStatus(status);
        classroomRepository.save(r);
    }

    private void saveLab(String id, String name, String building, int floor, int capacity, String type, int pcCount, String manager, String phone, String equipment, String status) {
        Lab l = new Lab(); l.setId(id); l.setName(name); l.setBuilding(building); l.setFloor(floor);
        l.setCapacity(capacity); l.setType(type); l.setPcCount(pcCount); l.setManager(manager); l.setPhone(phone);
        l.setEquipment(equipment); l.setStatus(status);
        labRepository.save(l);
    }

    private void saveSchedule(String id, String courseId, String courseName, String teacherId, String teacherName, int day, int period, String roomId, String roomName, String classGroup, String week, String color) {
        Schedule s = new Schedule(); s.setId(id); s.setCourseId(courseId); s.setCourseName(courseName);
        s.setTeacherId(teacherId); s.setTeacherName(teacherName); s.setDay(day); s.setPeriod(period);
        s.setRoomId(roomId); s.setRoomName(roomName); s.setClassGroup(classGroup); s.setWeek(week); s.setColor(color);
        scheduleRepository.save(s);
    }

    private void saveScore(String id, String studentId, String studentName, String courseId, String courseName, double score, String semester, String type, String inputAt) {
        Score s = new Score(); s.setId(id); s.setStudentId(studentId); s.setStudentName(studentName);
        s.setCourseId(courseId); s.setCourseName(courseName); s.setScore(score); s.setSemester(semester);
        s.setType(type); s.setInputAt(inputAt);
        scoreRepository.save(s);
    }

    private void saveNotice(String id, String title, String type, String level, String target, String publisher, String content, String createAt, int views, boolean pinned) {
        Notice n = new Notice(); n.setId(id); n.setTitle(title); n.setType(type); n.setLevel(level);
        n.setTarget(target); n.setPublisher(publisher); n.setContent(content);
        n.setCreateAt(createAt); n.setViews(views); n.setPinned(pinned);
        noticeRepository.save(n);
    }

    private void saveDormRoom(String id, String building, int floor, String roomNo, String type, int capacity, String gender, int fee, String status) {
        DormRoom r = new DormRoom(); r.setId(id); r.setBuilding(building); r.setFloor(floor); r.setRoomNo(roomNo);
        r.setType(type); r.setCapacity(capacity); r.setGender(gender); r.setFee(fee); r.setStatus(status);
        dormRoomRepository.save(r);
    }
    private void saveDormAllocation(String id, String roomId, String studentId, String studentName, String checkIn, String status) {
        DormAllocation a = new DormAllocation(); a.setId(id); a.setRoomId(roomId); a.setStudentId(studentId);
        a.setStudentName(studentName); a.setCheckIn(checkIn); a.setStatus(status);
        dormAllocationRepository.save(a);
    }
    private void saveBook(String id, String isbn, String title, String author, String publisher, String category, int pubYear, int total, int available, double price, String location) {
        Book b = new Book(); b.setId(id); b.setIsbn(isbn); b.setTitle(title); b.setAuthor(author); b.setPublisher(publisher);
        b.setCategory(category); b.setPubYear(pubYear); b.setTotal(total); b.setAvailable(available); b.setPrice(price); b.setLocation(location);
        bookRepository.save(b);
    }
    private void saveBorrowRecord(String id, String bookId, String bookTitle, String studentId, String studentName, String borrowDate, String dueDate, String returnDate, String status) {
        BorrowRecord r = new BorrowRecord(); r.setId(id); r.setBookId(bookId); r.setBookTitle(bookTitle); r.setStudentId(studentId);
        r.setStudentName(studentName); r.setBorrowDate(borrowDate); r.setDueDate(dueDate); r.setReturnDate(returnDate); r.setStatus(status);
        borrowRecordRepository.save(r);
    }

    /**
     * 确保注册证书存在（每次启动都检查补充）
     */
    private void ensureCertificatesExist() {
        if (!certificateRepository.existsByTypeAndCode("admin", "ADMIN-CERT-2024")) {
            RegistrationCertificate cert = new RegistrationCertificate();
            cert.setType("admin");
            cert.setCode("ADMIN-CERT-2024");
            cert.setDescription("管理员注册证书（默认，请在生产环境修改）");
            cert.setUsed(0);
            certificateRepository.save(cert);
            log.info("创建管理员注册证书: ADMIN-CERT-2024");
        }
        if (!certificateRepository.existsByTypeAndCode("teacher", "TEACHER-CERT-2024")) {
            RegistrationCertificate cert = new RegistrationCertificate();
            cert.setType("teacher");
            cert.setCode("TEACHER-CERT-2024");
            cert.setDescription("教师注册证书（默认，请在生产环境修改）");
            cert.setUsed(0);
            certificateRepository.save(cert);
            log.info("创建教师注册证书: TEACHER-CERT-2024");
        }
        log.info("当前注册证书数: {}", certificateRepository.count());
    }
}
