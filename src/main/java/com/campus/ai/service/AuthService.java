package com.campus.ai.service;

import com.campus.ai.common.BusinessException;
import com.campus.ai.common.JwtUtils;
import com.campus.ai.dto.LoginResponse;
import com.campus.ai.dto.RegisterRequest;
import com.campus.ai.dto.UserInfo;
import com.campus.ai.entity.RegistrationCertificate;
import com.campus.ai.entity.Student;
import com.campus.ai.entity.Teacher;
import com.campus.ai.entity.User;
import com.campus.ai.repository.RegistrationCertificateRepository;
import com.campus.ai.repository.StudentRepository;
import com.campus.ai.repository.TeacherRepository;
import com.campus.ai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final RegistrationCertificateRepository certificateRepository;
    private final JwtUtils jwtUtils;
    private final BCryptPasswordEncoder passwordEncoder;

    // ==================== 登录 ====================

    public LoginResponse login(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("用户名或密码错误"));

        if (user.getStatus() == null || user.getStatus() == 0) {
            throw new BusinessException("账号已被禁用，请联系管理员");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BusinessException("用户名或密码错误");
        }

        String token = jwtUtils.generateToken(user.getUsername(), user.getRole());
        UserInfo userInfo = buildUserInfo(user);
        log.info("用户登录成功: {} ({})", user.getUsername(), user.getRole());
        return new LoginResponse(token, userInfo);
    }

    // ==================== 注册 ====================

    /**
     * 用户注册
     * @param req 注册请求（含用户名、密码、角色、证书码）
     */
    @Transactional
    public LoginResponse register(RegisterRequest req) {
        // 校验用户名唯一性
        if (userRepository.existsByUsername(req.getUsername())) {
            throw new BusinessException("用户名已存在");
        }

        // 角色校验 — 学生无需证书，教师和管理员需要
        switch (req.getRole()) {
            case "student":
                // 学生注册无需证书，自动创建档案
                break;
            case "teacher":
                validateCertificate("teacher", req.getCertificateCode());
                break;
            case "admin":
                validateCertificate("admin", req.getCertificateCode());
                break;
            default:
                throw new BusinessException("无效的角色类型：" + req.getRole());
        }

        // 创建登录账号
        User user = new User();
        user.setUsername(req.getUsername());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setRealName(req.getRealName());
        user.setRole(req.getRole());
        user.setPhone(req.getPhone() != null ? req.getPhone() : "");
        user.setStatus(1);
        User saved = userRepository.save(user);

        // 创建关联档案
        if ("student".equals(req.getRole())) {
            createStudentProfile(req);
        } else if ("teacher".equals(req.getRole())) {
            createTeacherProfile(req);
        }

        // 标记证书为已使用（单次有效）
        if (req.getCertificateCode() != null && !req.getCertificateCode().isEmpty()) {
            markCertificateUsed(req.getRole(), req.getCertificateCode());
        }

        // 签发 token 并返回
        String token = jwtUtils.generateToken(saved.getUsername(), saved.getRole());
        UserInfo userInfo = buildUserInfo(saved);
        log.info("用户注册成功: {} ({})", saved.getUsername(), saved.getRole());
        return new LoginResponse(token, userInfo);
    }

    /** 校验证书码 */
    private void validateCertificate(String type, String code) {
        if (code == null || code.isBlank()) {
            String label = "teacher".equals(type) ? "教师" : "管理员";
            throw new BusinessException(label + "注册需要提供有效的证书验证码");
        }
        boolean valid = certificateRepository.existsByTypeAndCode(type, code.trim());
        if (!valid) {
            String label = "teacher".equals(type) ? "教师" : "管理员";
            throw new BusinessException("证书验证码无效，请检查后重试");
        }
    }

    /** 标记证书为已使用 */
    private void markCertificateUsed(String type, String code) {
        certificateRepository.findByTypeAndCodeAndUsed(type, code.trim(), 0)
                .ifPresent(cert -> {
                    cert.setUsed(1);
                    certificateRepository.save(cert);
                });
    }

    /** 为学生创建档案 */
    private void createStudentProfile(RegisterRequest req) {
        if (!studentRepository.existsById(req.getUsername())) {
            Student s = new Student();
            s.setId(req.getUsername());
            s.setName(req.getRealName());
            s.setGender("未设置");
            s.setCollege("未分配");
            s.setMajor("未分配");
            s.setGrade("大一");
            s.setStatus("在读");
            s.setPhone(req.getPhone() != null ? req.getPhone() : "");
            s.setCreateAt(java.time.LocalDate.now().toString());
            studentRepository.save(s);
            log.info("为学生创建档案: {}", req.getUsername());
        }
    }

    /** 为教师创建档案 */
    private void createTeacherProfile(RegisterRequest req) {
        if (!teacherRepository.existsById(req.getUsername())) {
            Teacher t = new Teacher();
            t.setId(req.getUsername());
            t.setName(req.getRealName());
            t.setCollege("未分配");
            t.setTitle("讲师");
            t.setMajor("未分配");
            t.setPhone(req.getPhone() != null ? req.getPhone() : "");
            t.setEmail("");
            t.setJoinYear(java.time.Year.now().getValue());
            teacherRepository.save(t);
            log.info("为教师创建档案: {}", req.getUsername());
        }
    }

    // ==================== 当前用户信息 ====================

    public UserInfo getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("用户不存在"));
        return buildUserInfo(user);
    }

    private UserInfo buildUserInfo(User user) {
        UserInfo.UserInfoBuilder builder = UserInfo.builder()
                .id(user.getId())
                .username(user.getUsername())
                .realName(user.getRealName())
                .role(user.getRole());

        if ("student".equals(user.getRole())) {
            studentRepository.findById(user.getUsername()).ifPresent(s -> {
                Map<String, Object> profile = new HashMap<>();
                profile.put("name", s.getName());
                profile.put("college", s.getCollege());
                profile.put("major", s.getMajor());
                profile.put("grade", s.getGrade());
                builder.profile(profile);
            });
        } else if ("teacher".equals(user.getRole())) {
            teacherRepository.findById(user.getUsername()).ifPresent(t -> {
                Map<String, Object> profile = new HashMap<>();
                profile.put("name", t.getName());
                profile.put("college", t.getCollege());
                profile.put("title", t.getTitle());
                builder.profile(profile);
            });
        }

        return builder.build();
    }

    // ==================== 内部工具 ====================

    public User createAccount(String username, String password, String role, String realName, String phone) {
        if (userRepository.existsByUsername(username)) {
            log.warn("账号已存在，跳过创建: {}", username);
            return userRepository.findByUsername(username).orElse(null);
        }
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setRealName(realName);
        user.setRole(role);
        user.setPhone(phone);
        user.setStatus(1);
        User saved = userRepository.save(user);
        log.info("创建账号成功: {} ({})", username, role);
        return saved;
    }
}
