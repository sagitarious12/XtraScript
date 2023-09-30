#pragma once

#include "../../../logger.hpp"
#include "parse_array.hpp"
#include "../../../testing/test_types.hpp"
#include "parse_array.mock.hpp"
#include "../expression/parse_term.hpp"

namespace Frame {

    class ParseArrayTests : public TestParent {
    public:
        ParseArrayTests() {}

        TestSuite getTests() {
            TestSuite testSuite("Parse Array Tests");
            testSuite.tests.push_back(std::bind(&ParseArrayTests::parseNodeReturnsValidValue, this));
            testSuite.tests.push_back(std::bind(&ParseArrayTests::parseNodeWithMultipleArrayValues, this));
            return testSuite;
        }

        TestExpect* parseNodeReturnsValidValue () {
            std::vector<Token> tokens = getArrayTokens();
            ParentParser parent(tokens, m_files, m_programs);
            ParseArray arrayParser;
            TestExpect* expects = new TestExpect();
            std::vector<TestReturnType> results;

            auto parseResult = arrayParser.parseNode(&parent);

            TestReturnType ret1("it should return a valid Node Term Array Literal", parseResult.has_value(), true);
            results.push_back(ret1);

            TestReturnType ret2("it should have the correct number of results", (int)parseResult.value()->values.size(), 1);
            results.push_back(ret2);

            for(NodeTerm* term : parseResult.value()->values) {
                auto value = std::get<NodeTermIntLit*>(term->value);
                TestReturnType ret3("It should have the correct values in the array literal", std::stoi(value->int_lit.value.value()), 12);
                results.push_back(ret3);
            }

            *expects = results;
            return expects;
        }

        TestExpect* parseNodeWithMultipleArrayValues () {
            std::vector<Token> tokens = getMultipleArray();
            ParentParser parent(tokens, m_files, m_programs);
            ParseArray arrayParser;
            TestExpect* expects = new TestExpect();
            std::vector<TestReturnType> results;

            auto parseResult = arrayParser.parseNode(&parent);

            TestReturnType ret1("It should return a valid term array literal", parseResult.has_value(), true);
            results.push_back(ret1);

            TestReturnType ret2("it should have two items in the array", (int)parseResult.value()->values.size(), 2);
            results.push_back(ret2);

            int item = 0;
            auto result = [](int i) {
                if (i == 0) {
                    return std::string("Hello");
                } else {
                    return std::string("World");
                }
            };

            for (NodeTerm* term : parseResult.value()->values) {
                auto value = std::get<NodeTermStringLit*>(term->value);
                TestReturnType ret3("It Should have the correct string values", result(item++), value->string_lit.value.value());
                results.push_back(ret3);
            }

            *expects = results;
            return expects;
        }

    private:
        Files m_files;
        std::map<std::string, std::string> m_programs;
    };

}