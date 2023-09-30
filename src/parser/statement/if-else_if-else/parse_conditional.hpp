#pragma once

#include "../../parent_parser.hpp"
#include "parse_if.hpp"

class ParseConditional {
public:
    ParseConditional() {}

    std::optional<NodeIfElseIfElse*> parseNode(ParentParser* parent) {
        auto conditional = parent->m_allocator.alloc<NodeIfElseIfElse>();

        auto cond_token = parent->consume();
        ParseIf ifParser;

        // If Statement
        if (cond_token.type == TokenType::t_if) {
            if (auto if_parse = ifParser.parseIf(parent)) {
                conditional->conditional = if_parse.value();
            }
            return conditional;
        }

        else {
            // Else If Statement
            if (parent->peek().value().type == TokenType::t_if) {
                parent->consume();
                if (auto if_else_parse = ifParser.parseElseIf(parent)) {
                    conditional->conditional = if_else_parse.value();
                }
                return conditional;
            } 
            
            // Else Statement
            else {
                if (auto else_parse = ifParser.parseElse(parent)) {
                    conditional->conditional = else_parse.value();
                }
                return conditional;
            }
        }

        return {};
    }
};