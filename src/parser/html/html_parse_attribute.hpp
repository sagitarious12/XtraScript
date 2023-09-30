#pragma once

#include "html_parser_parent.hpp"

class HTMLAttributeParser {
public:
    std::optional<ElementStatement*> parseAttributes (ParentParser* parent, HTMLParserParent* htmlParent) {
        auto statement = parent->m_allocator.alloc<ElementStatement>();

        if (htmlParent->peek().has_value() && htmlParent->peek().value().type == HTMLTokenType::OPEN_BRACKET) {
            htmlParent->consume();
            statement->key = "[";
            statement->key += htmlParent->consume().value.value();
            statement->key += "]";
            htmlParent->consume();
        } else if (htmlParent->peek().has_value() && htmlParent->peek().value().type == HTMLTokenType::OPEN_PAREN) {
            htmlParent->consume();
            statement->key = "("; 
            statement->key += htmlParent->consume().value.value();
            statement->key += ")";
            htmlParent->consume();
        } else {
            auto attributeKey = htmlParent->consume();
            std::string value = attributeKey.value.value();
            statement->key = value;
        }

        if (auto equals = htmlParent->try_consume(HTMLTokenType::EQUALS)) {
            htmlParent->try_consume(HTMLTokenType::QUOTE, "Missing Quote After Attribute Definition");
            auto statementToken = htmlParent->consume();
            statement->value = statementToken.value.value();
            htmlParent->try_consume(HTMLTokenType::QUOTE, "Missing Quite After Attribute Value Definition");
            if (statement->value.find("{{") != std::string::npos) {
                if (statement->value.find("}}") != std::string::npos) {
                    statement->isExpression = true;
                } else {
                    std::cerr << "[HTML PARSE ERROR][LINE " << statementToken.lineNumber << "] Invalid Expression definition - \"" << statementToken.value.value() << "\"" << std::endl;
                    exit(EXIT_FAILURE);
                }
            }
        } else {
            statement->value = "true";
        }

        return statement;
    }
};