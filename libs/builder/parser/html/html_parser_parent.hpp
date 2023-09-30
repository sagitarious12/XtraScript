#pragma once

#include <variant>

#include "../../tokenize/shared.hpp"
#include "../nodes.hpp"
#include "../parent_parser.hpp"

namespace Frame {
    class HTMLParserParent {
    public:
        inline explicit HTMLParserParent(
            std::vector<HTMLToken> tokens,
            std::string componentName,
            std::string styleContent
        )
            : m_tokens(std::move(tokens))
            , m_component_name(componentName)
            , m_style_content(styleContent)
        {}
        
        [[nodiscard]] inline std::optional<HTMLToken> peek(int offset = 0) const
        {
            if (m_index + offset >= m_tokens.size()) {
                return {};
            }
            else {
                return m_tokens.at(m_index + offset);
            }
        }

        inline HTMLToken consume()
        {
            return m_tokens.at(m_index++);
        }

        inline HTMLToken try_consume(HTMLTokenType type, const std::string& err_msg)
        {
            if (peek().has_value() && peek().value().type == type) {
                return consume();
            }
            else {
                std::cerr << err_msg << std::endl;
                exit(EXIT_FAILURE);
            }
        }

        inline std::optional<HTMLToken> try_consume(HTMLTokenType type)
        {
            if (peek().has_value() && peek().value().type == type) {
                return consume();
            }
            else {
                return {};
            }
        }

        std::string m_component_name;
        std::string m_style_content;
    private:
        std::vector<HTMLToken> m_tokens;
        size_t m_index = 0;
    };
}