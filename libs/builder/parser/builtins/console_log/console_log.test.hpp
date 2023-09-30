#pragma once

#include "../../../../logger.hpp"
#include "console_log.hpp"
#include "console_log.mock.hpp"
#include "../../../../testing/test_types.hpp"

namespace Frame {
    class ConsoleLogTests : public TestParent {
    public:
        ConsoleLogTests() {}

        TestSuite getTests() {
            TestSuite testSuite("Console Log Builtin Tests");
            testSuite.tests.push_back(std::bind(&ConsoleLogTests::parseInitWebApp, this));
            return testSuite;
        }

        TestExpect* parseInitWebApp() {
            std::vector<Token> tokens = getConsoleLogTokens();
            ParentParser parent(tokens, m_files, m_programs);
            ParseConsoleLog parseConsoleLog;
            TestExpect* expects = new TestExpect();
            std::vector<TestReturnType> results;

            TestReturnType ret1("It should return a valid NodePrintConsole", true, true);
            results.push_back(ret1);

            *expects = results;
            return expects;
        }

    private:
        Files m_files;
        std::map<std::string, std::string> m_programs;
    };
}