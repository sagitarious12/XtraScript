#pragma once

#include "../parent_parser.hpp"

class ParseArray {
public:
    ParseArray() {}

    std::optional<NodeTermArrayLit*> parseNode(ParentParser* parent) {
        auto array = parent->m_allocator.alloc<NodeTermArrayLit>();

        parent->try_consume(TokenType::open_bracket);

        ParseTerm termParser;

        while(parent->peek().value().type != TokenType::close_bracket) {
            if (auto arrayValue = termParser.parseNode(parent)) {
                array->values.push_back(arrayValue.value());
                parent->try_consume(TokenType::comma);
            } else {
                std::cerr << "Did not find a valid term for the array literal. Expected ']'" << std::endl;
                exit(EXIT_FAILURE);
            }
        }

        parent->try_consume(TokenType::close_bracket);

        return array;
    }
};