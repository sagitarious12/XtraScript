#pragma once

#include "html_parser_parent.hpp"
#include "../../utils/trim.hpp"
#include "html_parse_attribute.hpp"

class HTMLParseElement {
public:

    std::optional<ElementData*> parseElement(ParentParser* parent, HTMLParserParent* htmlParent, bool useStyleContent) {
        auto elementData = parent->m_allocator.alloc<ElementData>();
        elementData->usedInComponent = htmlParent->m_component_name;
        if (useStyleContent) {
            elementData->styleContent = htmlParent->m_style_content;
        }

        if (isOpenSelector(htmlParent)) {
            htmlParent->try_consume(HTMLTokenType::LESS_THAN);
            auto selector = htmlParent->consume();
            elementData->selector = selector.value.value();

            // TODO figure out how to get the usesComponent for
            // selectors that are not standard HTML selectors

            HTMLAttributeParser attributeParser;
            while(htmlParent->peek().has_value() && htmlParent->peek().value().type != HTMLTokenType::GREATER_THAN) {
                elementData->attributes.push_back(attributeParser.parseAttributes(parent, htmlParent));
            }

            htmlParent->consume(); // greater than

            while(htmlParent->peek()) {
                if (isOpenSelector(htmlParent)) {
                    if (auto child = parseElement(parent, htmlParent, false)) {
                        elementData->children.push_back(child);
                    }
                } else {
                    break;
                }
            }

            if (isSelectorContent(htmlParent)) {
                auto statement = parent->m_allocator.alloc<ElementStatement>();
                while(htmlParent->peek().has_value() && htmlParent->peek().value().type != HTMLTokenType::LESS_THAN) {
                    auto token = htmlParent->consume();
                    statement->value += token.value.value();
                }
                trim(statement->value);
                elementData->content = statement;
            }

            if (isEndSelector(htmlParent)) {
                htmlParent->try_consume(HTMLTokenType::LESS_THAN, "Missing Closing Selector");
                htmlParent->try_consume(HTMLTokenType::BACK_SLASH);
                htmlParent->try_consume(HTMLTokenType::END_SELECTOR);
                htmlParent->try_consume(HTMLTokenType::GREATER_THAN);
            } else {
                std::cerr << "Expected closing selector" << std::endl;
                std::cerr << "[HTML PARSE FAILURE][LINE " << htmlParent->peek().value().lineNumber << "]: Failed at token - " << htmlParent->peek().value().value.value() << std::endl;
                exit(EXIT_FAILURE);
            }
        } else {
            std::cerr << "[HTML PARSE FAILURE][LINE " << htmlParent->peek().value().lineNumber << "]: Failed at token - " << htmlParent->peek().value().value.value() << std::endl;
            exit(EXIT_FAILURE);
        }

        return elementData;
    }

private:
    bool isOpenSelector(HTMLParserParent* parent) {
        return parent->peek().has_value() &&
            parent->peek().value().type == HTMLTokenType::LESS_THAN &&
            parent->peek(1).has_value() &&
            parent->peek(1).value().type == HTMLTokenType::START_SELECTOR;
    }

    bool isSelectorContent(HTMLParserParent* parent) {
        return parent->peek().has_value() &&
            parent->peek().value().type == HTMLTokenType::SPACE &&
            parent->peek(1).has_value() &&
            parent->peek(1).value().type == HTMLTokenType::IDENT;
    }

    bool isEndSelector(HTMLParserParent* parent) {
        return parent->peek().has_value() &&
            parent->peek().value().type == HTMLTokenType::LESS_THAN &&
            parent->peek(1).has_value() &&
            parent->peek(1).value().type == HTMLTokenType::BACK_SLASH;
    }
};
