package com.campus.ai.repository;

import com.campus.ai.entity.OpLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OpLogRepository extends JpaRepository<OpLog, Long> {

    /** 按操作对象查询 */
    List<OpLog> findByTargetOrderByCreateTimeDesc(String target);

    /** 按操作类型查询 */
    List<OpLog> findByTypeOrderByCreateTimeDesc(String type);

    /** 复合搜索 */
    @Query("SELECT o FROM OpLog o WHERE " +
           "(:target IS NULL OR o.target = :target) AND " +
           "(:type IS NULL OR o.type = :type) AND " +
           "(:keyword IS NULL OR o.detail LIKE %:keyword% OR o.targetId LIKE %:keyword%) " +
           "ORDER BY o.createTime DESC")
    List<OpLog> search(@Param("target") String target,
                       @Param("type") String type,
                       @Param("keyword") String keyword);

    /** 清空所有日志 */
    void deleteAll();
}
