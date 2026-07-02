package com.campus.ai.controller;


import com.campus.ai.dto.StudentCreateDTO;
import org.springframework.web.bind.annotation.*;

import javax.xml.transform.Result;

@RestController
@RequestMapping("/api/prama")
public class PramaStationController {

}
@GetMapping("/query")
public Result<String> query(
        @RequestParam String keyword,
        @RequestParam String pageNum
){
    return Result.success("Query:按照 keyword=" + keyword + "查询第" + pageNum + "页");
}

@GetMapping("/path/{studenID}")
public Result<String> path(@PathVariable Long studentID){
    return Result.success("Path:你正在查看学生" + studentID);
}

@PostMapping("/body")
public Result<String> body(@RequestBody StudentCreateDTO dto){
    return Result.success(dto);
}

@PostMapping("/batch")
public Result<String> batch(@RequestBody List<StudentCreateDTO> students){
    return Result.success("批量收到" + students.size() + "个学生");
}

@GetMapping("/header")
public Result<String> header(
        @RequestHeader(value = "Authorization", required = false) String token){
    return Result.success("Header:你正在使用" + token + "访问");
}