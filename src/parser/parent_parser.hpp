#pragma once

#include <iostream>
#include <optional>
#include <map>

#include "../tokenization.hpp"
#include "../nodes.hpp"
#include "../file_reader.hpp"
#include "../arena.hpp"

class ParentParser {
public:
    ParentParser(
        std::vector<Token> tokens, 
        Files fileReader, 
        std::map<std::string, std::string> programs
    )
        : m_tokens(std::move(tokens))
        , m_file_reader(fileReader)
        , m_programs(programs)
        , m_allocator(1024 * 1024 * 4)
    {}
    
    [[nodiscard]] inline std::optional<Token> peek(int offset = 0) const
    {
        if (m_index + offset >= m_tokens.size()) {
            return {};
        }
        else {
            return m_tokens.at(m_index + offset);
        }
    }

    inline Token consume()
    {
        return m_tokens.at(m_index++);
    }

    inline Token try_consume(TokenType type, const std::string& err_msg)
    {
        if (peek().has_value() && peek().value().type == type) {
            return consume();
        }
        else {
            std::cerr << err_msg << std::endl;
            exit(EXIT_FAILURE);
        }
    }

    inline std::optional<Token> try_consume(TokenType type)
    {
        if (peek().has_value() && peek().value().type == type) {
            return consume();
        }
        else {
            return {};
        }
    }

    std::optional<Token> test_import_rename(std::optional<Token> token) {
        std::map<std::string, std::string>::iterator it;
        if (token.has_value()) {
            auto it = m_import_renames.find(token.value().value.value());
            if (it != m_import_renames.end()) {
                Token new_token { .type = token.value().type, .value = m_import_renames[token.value().value.value()] };
                return new_token;
            } else {
                return token;
            }
        } else {
            return token;
        }
    }

    std::map<std::string, std::string> m_programs;
    std::map<std::string, std::string>::iterator programIt;
    std::map<std::string, std::string> m_import_renames;
    std::vector<Token> m_tokens;
    size_t m_index = 0;
    Files m_file_reader;
    std::string m_current_program;
    ArenaAllocator m_allocator;
};

class ParseStatement {
public: 
    std::optional<NodeStatement*> parseNode(ParentParser* parent);
};

class ParseFile {
public:
    std::optional<NodeStatementTake*> parseNode(ParentParser* parent, std::string name, std::string filePath, std::vector<Token> tokens);
};