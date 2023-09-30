#pragma once

#include <functional>
#include <variant>
#include <string>

namespace Frame {
    struct TestReturnType {
        std::variant<int, float, bool, std::string> expected;
        std::variant<int, float, bool, std::string> actual;
        std::string testName;

        TestReturnType() {}
        TestReturnType(
            std::string testName, 
            std::variant<int, float, bool, std::string> expected,
            std::variant<int, float, bool, std::string> actual
        ) : expected(expected), actual(actual), testName(testName) {}
    };

    typedef std::variant<TestReturnType, std::vector<TestReturnType>> TestExpect;
    typedef std::function<TestExpect*()> Test;

    struct TestSuite {
        std::vector<Test> tests;
        std::string suiteName;

        TestSuite(std::string suiteName) : suiteName(suiteName) {}
        TestSuite() = delete;
    };

    class TestParent {
    public:
        virtual TestSuite getTests() = 0;
    };
    // TestParent::~TestParent() {};
}