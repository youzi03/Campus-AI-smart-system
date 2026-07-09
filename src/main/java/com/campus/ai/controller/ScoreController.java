package com.campus.ai.controller;

import com.campus.ai.common.ApiResult;
import com.campus.ai.common.PageResult;
import com.campus.ai.entity.Score;
import com.campus.ai.service.ScoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ScoreController {

    private final ScoreService scoreService;

    @GetMapping("/scores")
    public ApiResult<PageResult<Score>> listScores(
            @RequestParam(required = false) String studentId,
            @RequestParam(required = false) String courseId,
            @RequestParam(required = false) String semester,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "1000") int size) {
        return ApiResult.success(PageResult.slice(scoreService.searchScores(studentId, courseId, semester), page, size));
    }
    @GetMapping("/scores/all")
    public ApiResult<List<Score>> allScores() { return ApiResult.success(scoreService.getScores()); }
    @GetMapping("/scores/{id}")
    public ApiResult<Score> getScore(@PathVariable String id) { return ApiResult.success(scoreService.getScore(id)); }
    @PostMapping("/scores")
    public ApiResult<Score> addScore(@RequestBody Score s) { return ApiResult.success(scoreService.addScore(s)); }
    @PutMapping("/scores/{id}")
    public ApiResult<Score> updateScore(@PathVariable String id, @RequestBody Score s) { return ApiResult.success(scoreService.updateScore(id, s)); }
    @DeleteMapping("/scores/{id}")
    public ApiResult<Void> deleteScore(@PathVariable String id) { scoreService.deleteScore(id); return ApiResult.success(); }

    /** 统计 */
    @GetMapping("/scores/statistics")
    public ApiResult<List<Map<String, Object>>> statistics() { return ApiResult.success(scoreService.statByCourse()); }

    /** 预警 */
    @GetMapping("/scores/warnings")
    public ApiResult<List<Score>> warnings() { return ApiResult.success(scoreService.getWarnings()); }

    /** 计数 */
    @GetMapping("/scores/count")
    public ApiResult<Long> count() { return ApiResult.success(scoreService.scoreCount()); }
}
