package com.campus.ai.config;

import com.campus.ai.entity.OpLog;
import com.campus.ai.entity.Student;
import com.campus.ai.entity.Teacher;
import com.campus.ai.repository.OpLogRepository;
import com.campus.ai.repository.StudentRepository;
import com.campus.ai.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * 应用启动时初始化示例数据（仅当数据库为空时）
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final OpLogRepository opLogRepository;

    @Override
    public void run(String... args) {
        if (studentRepository.count() > 0) {
            log.info("数据库已有数据，跳过初始化");
            return;
        }

        log.info("初始化示例数据...");

        // ---- 学生示例数据 ----
        studentRepository.save(createStudent("2025001", "张明", "男", "2005-08-12", "计算机学院", "软件工程", "13800138001", "1号楼302", "大三", "在读"));
        studentRepository.save(createStudent("2025002", "李思琪", "女", "2005-10-20", "数学学院", "应用数学", "13800138002", "2号楼205", "大二", "在读"));
        studentRepository.save(createStudent("2025003", "王浩然", "男", "2005-05-18", "计算机学院", "计算机科学与技术", "13800138003", "1号楼305", "大三", "在读"));
        studentRepository.save(createStudent("2025004", "赵雅婷", "女", "2006-02-11", "外语学院", "英语", "13800138004", "2号楼401", "大一", "在读"));
        studentRepository.save(createStudent("2025005", "陈俊杰", "男", "2004-12-09", "物理学院", "物理学", "13800138005", "3号楼102", "大四", "在读"));
        studentRepository.save(createStudent("2025006", "刘雨桐", "女", "2005-07-22", "经济学院", "经济学", "13800138006", "2号楼502", "大二", "休学"));
        studentRepository.save(createStudent("2025007", "孙博文", "男", "2005-03-30", "计算机学院", "人工智能", "13800138007", "1号楼201", "大三", "在读"));
        studentRepository.save(createStudent("2025008", "周嘉怡", "女", "2006-01-14", "化学学院", "应用化学", "13800138008", "4号楼303", "大一", "在读"));
        studentRepository.save(createStudent("2025009", "吴天宇", "男", "2004-11-05", "机械学院", "机械工程", "13800138009", "3号楼204", "大四", "在读"));
        studentRepository.save(createStudent("2025010", "郑欣怡", "女", "2005-09-15", "艺术学院", "视觉设计", "13800138010", "4号楼501", "大二", "在读"));

        // ---- 教师示例数据 ----
        teacherRepository.save(createTeacher("T001", "王明", "男", "计算机学院", "副教授", "软件工程", "13911112222", "wangming@edu.cn", 2015));
        teacherRepository.save(createTeacher("T002", "李华", "女", "数学学院", "讲师", "应用数学", "13922223333", "lihua@edu.cn", 2018));
        teacherRepository.save(createTeacher("T003", "张伟", "男", "计算机学院", "教授", "人工智能", "13933334444", "zhangwei@edu.cn", 2010));
        teacherRepository.save(createTeacher("T004", "陈雪", "女", "外语学院", "副教授", "英语", "13944445555", "chenxue@edu.cn", 2012));
        teacherRepository.save(createTeacher("T005", "刘强", "男", "物理学院", "教授", "物理学", "13955556666", "liuqiang@edu.cn", 2008));
        teacherRepository.save(createTeacher("T006", "黄丽", "女", "经济学院", "讲师", "经济学", "13966667777", "huangli@edu.cn", 2019));

        // ---- 操作日志示例 ----
        opLogRepository.save(createOpLog("新增", "学生", "2025001", "新增学生：张明"));
        opLogRepository.save(createOpLog("新增", "学生", "2025002", "新增学生：李思琪"));
        opLogRepository.save(createOpLog("编辑", "学生", "2025001", "修改电话：13800138001 → 13800138999"));
        opLogRepository.save(createOpLog("状态变更", "学生", "2025006", "刘雨桐：休学（在读 → 休学）"));

        log.info("示例数据初始化完成：{} 名学生, {} 名教师, {} 条日志",
                studentRepository.count(), teacherRepository.count(), opLogRepository.count());
    }

    private Student createStudent(String id, String name, String gender, String birth,
                                   String college, String major, String phone,
                                   String dorm, String grade, String status) {
        Student s = new Student();
        s.setId(id);
        s.setName(name);
        s.setGender(gender);
        s.setBirth(birth);
        s.setCollege(college);
        s.setMajor(major);
        s.setPhone(phone);
        s.setDorm(dorm);
        s.setGrade(grade);
        s.setStatus(status);
        s.setCreateAt(java.time.LocalDate.now().toString());
        return s;
    }

    private Teacher createTeacher(String id, String name, String gender, String college,
                                   String title, String major, String phone,
                                   String email, int joinYear) {
        Teacher t = new Teacher();
        t.setId(id);
        t.setName(name);
        t.setGender(gender);
        t.setCollege(college);
        t.setTitle(title);
        t.setMajor(major);
        t.setPhone(phone);
        t.setEmail(email);
        t.setJoinYear(joinYear);
        return t;
    }

    private OpLog createOpLog(String type, String target, String targetId, String detail) {
        OpLog log = new OpLog();
        log.setType(type);
        log.setTarget(target);
        log.setTargetId(targetId);
        log.setOperator("管理员");
        log.setDetail(detail);
        return log;
    }
}
