package com.campus.ai.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class GuessController {

    @Value("${game.target-number}")
    private int targetNumber;

    /**
     * 猜数字游戏
     * 浏览器访问: GET /api/guess?number=50
     */
    @GetMapping("/api/guess")
    public String guess(@RequestParam("number") int number) {
        if (number > targetNumber) {
            return "大了";
        } else if (number < targetNumber) {
            return "小了";
        } else {
            return "太棒了";
        }
    }
}
