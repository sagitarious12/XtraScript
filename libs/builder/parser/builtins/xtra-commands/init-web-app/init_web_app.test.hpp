#pragma once

#include "../../../../../logger.hpp"
#include "init_web_app.hpp"
#include "init_web_app.mock.hpp"
#include "../../../../../testing/test_types.hpp"

namespace Frame {
    class InitWebAppTests : public TestParent {
    public:
        InitWebAppTests() {}

        TestSuite getTests() {
            TestSuite testSuite("Init Web App Tests");
            testSuite.tests.push_back(std::bind(&InitWebAppTests::parseInitWebApp, this));
            return testSuite;
        }

        TestExpect* parseInitWebApp() {
            std::vector<Token> tokens = getInitTokens();
            ParentParser parent(tokens, m_files, m_programs);
            XtraInitWebApp initWebApp;
            TestExpect* expects = new TestExpect();
            std::vector<TestReturnType> results;

            TestReturnType ret1("It should return a valid NodeInitWebApp", true, true);
            results.push_back(ret1);

            *expects = results;
            return expects;
        }

    private:
        Files m_files;
        std::map<std::string, std::string> m_programs;
    };
}