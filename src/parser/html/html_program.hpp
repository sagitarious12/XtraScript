#pragma once

#include "html_parser_parent.hpp"
#include "html_parse_element.hpp"

class HTMLParseProgram {
public:
    HTMLParseProgram() {}

    std::optional<NodeHTMLProgram*> parseNode(ParentParser* parent, HTMLParserParent* htmlParent) {

        auto htmlProgram = parent->m_allocator.alloc<NodeHTMLProgram>();

        HTMLParseElement elementParser;

        while(htmlParent->peek().has_value()) {
            htmlProgram->value.push_back(elementParser.parseElement(parent, htmlParent, true));
        }
        
        return htmlProgram;
    }
};