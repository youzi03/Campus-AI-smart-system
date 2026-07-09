package com.campus.ai.repository;

import com.campus.ai.entity.RegistrationCertificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RegistrationCertificateRepository extends JpaRepository<RegistrationCertificate, Long> {

    /** 按类型和验证码查找未被使用的证书 */
    Optional<RegistrationCertificate> findByTypeAndCodeAndUsed(String type, String code, Integer used);

    boolean existsByTypeAndCode(String type, String code);

    long countByType(String type);
}
