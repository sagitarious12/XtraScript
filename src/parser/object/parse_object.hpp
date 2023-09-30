#pragma once

#include "../parent_parser.hpp"
#include "parse_object_prop.hpp"

class ParseObject {
public:
    ParseObject() {}

    std::optional<NodeTermObjectLit*> parseNode(ParentParser* parent) {
        auto object = parent->m_allocator.alloc<NodeTermObjectLit>();

        ParseObjectProp objectPropParser;

        parent->try_consume(TokenType::open_brace, "Expected Open Brace For Object Literal");

        while(parent->peek().value().type != TokenType::close_brace) {
            if (auto objectProp = objectPropParser.parseNode(parent)) {
                object->keys.push_back(objectProp.value());
            }
        }

        parent->try_consume(TokenType::close_brace, "Expected Close Brace For Object Literal");

        return object;
    }
};