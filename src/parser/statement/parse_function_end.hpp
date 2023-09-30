#pragma once

#include "../parent_parser.hpp"
#include "../checkers.hpp"

class ParseFunctionEnd {
public:
    ParseFunctionEnd(){}

    std::optional<NodeFunctionEnd*> parseNode(ParentParser* parent) {
        Checker checker;
        auto func_end = parent->m_allocator.alloc<NodeFunctionEnd>();

        if (auto closed = checker.try_parse_close_braces(parent)) {
            func_end->end = !parent->peek().has_value();

            if (parent->m_current_program == "main") {
                func_end->isSelfCalling = true;
            } else {
                func_end->isSelfCalling = false;
            }
        }

        return func_end;
    }
};