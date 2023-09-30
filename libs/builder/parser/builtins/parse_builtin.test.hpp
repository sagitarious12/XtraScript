#pragma once

#include "../../../logger.hpp"
#include "../../../testing/test_types.hpp"
#include "parse_builtin.hpp"
#include "parse_builtin.mock.hpp"

namespace Frame {
    class BuiltinTests : public TestParent {
    public:
        BuiltinTests() {}

        TestSuite getTests() {
            TestSuite testSuite("Parse Builtin Tests");
            testSuite.tests.push_back(std::bind(&BuiltinTests::parseXtraCommandInit, this));
            return testSuite;
        }

        TestExpect* parseXtraCommandInit() {
            std::vector<Token> tokens = getBuiltinTokens();
            ParentParser parent(tokens, m_files, m_programs);
            ParseBuiltin command;
            TestExpect* expects = new TestExpect();
            std::vector<TestReturnType> results;

            TestReturnType ret1("It should return a valid NodeBuiltinFunction", true, true);
            results.push_back(ret1);

            *expects = results;
            return expects;
        }

    private:
        Files m_files;
        std::map<std::string, std::string> m_programs;
    };
}