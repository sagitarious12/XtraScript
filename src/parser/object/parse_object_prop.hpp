#pragma once

#include "../parent_parser.hpp"

class ParseObjectProp {
public:
    ParseObjectProp() {}

    std::optional<NodeObjectLitProp*> parseNode(ParentParser* parent) {
        auto objectProp = parent->m_allocator.alloc<NodeObjectLitProp>();

        auto key = parent->try_consume(TokenType::ident, "Expected a value for the key in the object");
        parent->try_consume(TokenType::eq, "Expected Equal sign to define the object key value");

        objectProp->key = key;

        ParseTerm termParser;

        if (auto term = termParser.parseNode(parent)) {
            objectProp->value = term.value();
        }

        parent->try_consume(TokenType::comma);

        return objectProp;
    }
};