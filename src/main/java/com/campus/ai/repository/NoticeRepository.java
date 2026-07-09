package com.campus.ai.repository;

import com.campus.ai.entity.Notice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, String> {
    List<Notice> findByType(String type);
    List<Notice> findByPinnedTrueOrderByCreateAtDesc();
    @Query("SELECT n FROM Notice n WHERE " +
           "(:keyword IS NULL OR n.title LIKE %:keyword% OR n.content LIKE %:keyword%) AND " +
           "(:type IS NULL OR n.type = :type) AND " +
           "(:level IS NULL OR n.level = :level) " +
           "ORDER BY n.pinned DESC, n.createAt DESC")
    List<Notice> search(@Param("keyword") String keyword,
                        @Param("type") String type,
                        @Param("level") String level);
}
