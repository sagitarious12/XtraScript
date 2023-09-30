#pragma once

#include "../../../../logger.hpp"
#include "xtra_command.hpp"
#include "../../../../testing/test_types.hpp"
#include "xtra_command.mock.hpp"

namespace Frame {
    class XtraCommandTests : public TestParent {
    public:
        XtraCommandTests() {}

        TestSuite getTests() {
            TestSuite testSuite("Xtra Command Tests");
            testSuite.tests.push_back(std::bind(&XtraCommandTests::parseXtraCommandInit, this));
            return testSuite;
        }

        TestExpect* parseXtraCommandInit() {
            std::vector<Token> tokens = getXtraCommand();
            ParentParser parent(tokens, m_files, m_programs);
            XtraCommand command;
            TestExpect* expects = new TestExpect();
            std::vector<TestReturnType> results;

            TestReturnType ret1("It should return a valid NodeXtraCommand", true, true);
            results.push_back(ret1);

            *expects = results;
            return expects;
        }

    private:
        Files m_files;
        std::map<std::string, std::string> m_programs;
    };
}