#pragma once

#include "../parent_parser.hpp"
#include "parse_return_type.hpp"


namespace Frame {
    class ParseFunctionArguments {
    public:
        ParseFunctionArguments(){}

        std::optional<NodeFunctionArguments*> parseNode(ParentParser* parent) {
            auto function_args = parent->m_allocator.alloc<NodeFunctionArguments>();

            ParseReturnType returnTypeParser;

            if (auto type = returnTypeParser.parseNode(parent)) {
                function_args->type = type.value();
                if (auto argToken = parent->try_consume(TokenType::ident)) {
                    function_args->ident = argToken.value();
                } else {
                    return {};
                }
            } else {
                return {};
            }
            return function_args;
        }
    };
}