package com.campus.ai.service;

import com.campus.ai.common.BusinessException;
import com.campus.ai.common.JwtUtils;
import com.campus.ai.dto.LoginResponse;
import com.campus.ai.dto.UserInfo;
import com.campus.ai.entity.Student;
import com.campus.ai.entity.Teacher;
import com.campus.ai.entity.User;
import com.campus.ai.repository.StudentRepository;
import com.campus.ai.repository.TeacherRepository;
import com.campus.ai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final JwtUtils jwtUtils;
    private final BCryptPasswordEncoder passwordEncoder;

    /**
     * 用户登录
     */
    public LoginResponse login(String username, String password) {
        // 查找用户
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("用户名或密码错误"));

        // 检查状态
        if (user.getStatus() == null || user.getStatus() == 0) {
            throw new BusinessException("账号已被禁用，请联系管理员");
        }

        // 校验密码
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BusinessException("用户名或密码错误");
        }

        // 生成 token
        String token = jwtUtils.generateToken(user.getUsername(), user.getRole());

        // 构建用户信息
        UserInfo userInfo = buildUserInfo(user);
        log.info("用户登录成功: {} ({})", user.getUsername(), user.getRole());
        return new LoginResponse(token, userInfo);
    }

    /**
     * 根据 token 获取当前用户信息
     */
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

        // 根据角色附加档案信息
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

    /**
     * 创建账号（用于新增学生/教师时同步创建）
     */
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
