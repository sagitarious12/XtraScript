#pragma once

#include <functional>

#include "../logger.hpp"
#include "test_types.hpp"

#pragma region Testing Includes

#include "../builder/parser/array/parse_array.test.hpp"
#include "../builder/parser/builtins/xtra-commands/init-web-app/init_web_app.test.hpp"
#include "../builder/parser/builtins/xtra-commands/xtra_command.test.hpp"
#include "../builder/parser/builtins/console_log/console_log.test.hpp"
#include "../builder/parser/builtins/parse_builtin.test.hpp"

#pragma endregion

namespace Frame {
    class TestMounter : public Logger {
    public:
        TestMounter() {}
        ~TestMounter() {}

        [[nodiscard]] bool mount() {
            std::vector<TestSuite> allTests;

            ParseArrayTests parseArray;
            InitWebAppTests initTests;
            XtraCommandTests xtraCommands;
            ConsoleLogTests console;
            BuiltinTests builtin;

            allTests.push_back(parseArray.getTests());
            allTests.push_back(initTests.getTests());
            allTests.push_back(xtraCommands.getTests());
            allTests.push_back(console.getTests());
            allTests.push_back(builtin.getTests());

            runTests(allTests);
            printFinalResults();
            if (m_failed_tests > 0) {
                return false;
            } else {
                return true;
            }
        }

    private:

        void printFinalResults() {
            std::string variableString;
            if (m_failed_tests > 0) {
                variableString = "Failed Test Run";
                Error(variableString + "\n\nTESTING COMPLETED\n-----------------\n  Ran " + std::to_string(m_test_count) + " tests.\n    PASSED " + std::to_string(m_passed_tests) + " TESTS\n    FAILED " + std::to_string(m_failed_tests) + " TESTS.");
            } else {
                variableString = "Passed Test Run";
                Info(variableString + "\n\nTESTING COMPLETED\n-----------------\n  Ran " + std::to_string(m_test_count) + " tests.\n    PASSED " + std::to_string(m_passed_tests) + " TESTS\n    FAILED " + std::to_string(m_failed_tests) + " TESTS.");
            }
        }

        void increaseTestCount(int amount) {
            m_test_count += amount;
        }

        void incrementPassedTests() {
            m_passed_tests++;
        }

        void incrementFailedTests() {
            m_failed_tests++;
        }

        bool runTests(std::vector<TestSuite> suites) {
            bool result = true;
            for(TestSuite suite : suites) {
                Info("Testing Suite: " + suite.suiteName);
                addIndent();

                for (Test test : suite.tests) {
                    bool testResult = validate(test());
                    if (!testResult) {
                        result = false;
                    }
                }
                Info("\n\n");
                removeIndent();
            }
            return result;
        }

        bool validate(TestExpect* expects) {
            auto getFunctionsRan = [this]() {
                return std::to_string(m_passed_tests + m_failed_tests);
            };
            auto performValidation = [this, getFunctionsRan](TestReturnType ret) {
                if (ret.actual == ret.expected) {
                    incrementPassedTests();
                    std::string message = "[Test " + getFunctionsRan() + "] " + ret.testName + " Succeeded";
                    Info(message);
                    return true;
                } else {
                    incrementFailedTests();
                    std::string message = "[Test " + getFunctionsRan() + "] " + ret.testName + " Failed";
                    std::string errorMessageExpected; 
                    // int, float, bool, std::string
                    if (auto value = std::holds_alternative<int>(ret.expected)) {
                        errorMessageExpected = "Expected -> " + std::to_string(std::get<int>(ret.expected));
                    } else if (auto value = std::holds_alternative<float>(ret.expected)) {
                        errorMessageExpected = "Expected -> " + std::to_string(std::get<float>(ret.expected));
                    } else if (auto value = std::holds_alternative<bool>(ret.expected)) {
                        errorMessageExpected = "Expected -> " + std::to_string(std::get<bool>(ret.expected));
                    } else if (auto value = std::holds_alternative<std::string>(ret.expected)) {
                        errorMessageExpected = "Expected -> " + std::get<std::string>(ret.expected);
                    }

                    std::string errorMessageActual; 
                    if (auto value = std::holds_alternative<int>(ret.actual)) {
                        errorMessageActual = "Actual -> " + std::to_string(std::get<int>(ret.actual));
                    } else if (auto value = std::holds_alternative<float>(ret.actual)) {
                        errorMessageActual = "Actual -> " + std::to_string(std::get<float>(ret.actual));
                    } else if (auto value = std::holds_alternative<bool>(ret.actual)) {
                        if (std::get<bool>(ret.actual)) {
                            errorMessageActual = "Actual -> true";
                        } else {
                            errorMessageActual = "Actual -> false";
                        }
                    } else if (auto value = std::holds_alternative<std::string>(ret.actual)) {
                        errorMessageActual = "Actual -> " + std::get<std::string>(ret.actual);
                    }
                    Error("\n---------------------------------");
                    Error(message);
                    addIndent();
                    Error(errorMessageExpected);
                    Error(errorMessageActual + "\n\n");
                    removeIndent();
                    return false;
                }
            };
            
            if (auto expect = std::holds_alternative<TestReturnType>(*expects)) {
                increaseTestCount(1);
                bool result = performValidation(std::get<TestReturnType>(*expects));
                delete expects;
                return result;
            } else if (auto a = std::holds_alternative<std::vector<TestReturnType>>(*expects)) {
                bool result = true;
                auto list = std::get<std::vector<TestReturnType>>(*expects);
                increaseTestCount(list.size());
                for (TestReturnType expect : list) {
                    bool currentTestResult = performValidation(expect);
                    if (!currentTestResult) result = false;
                }
                delete expects;
                return result;
            }
            return false;
        }

        int m_test_count = 0;
        int m_passed_tests = 0;
        int m_failed_tests = 0;
    };
}