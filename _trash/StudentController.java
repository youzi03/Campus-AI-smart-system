package com.campus.ai.controller;

import org.springframework.web.bind.annotation.*;

import javax.xml.transform.Result;


@RestController
@RequestMapping("/api/student")

public class StudentController {
    @RequestMapping("get")
    public Result<String> addStudent(){
        return new Result<String>("获取学生");
    }


    @DeleteMapping("del")
    public Result<String> delStudent(){
        return new Result<String>("删除学生");
    }


    @PostMapping("add")
    public Result<String> huoStudent(){
        return new Result<String>("新增学生");
    }

    @PutMapping("")
    public Result<String> updateStudent(){
        return new Result<String>("修改学生");
    }


    @PatchMapping("")
    public Result<String> patchStudent(){
        return new Result<String>("修改学生状态");
    }

    }
