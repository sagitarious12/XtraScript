#pragma once

#include <iostream>
#include <optional>
#include <map>

#include "../tokenize/tokenization.hpp"
#include "../tokenize/html_tokenization.hpp"
#include "nodes.hpp"
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

    void set_hard_consume(bool value) {
        m_hard_consume = value;
    }

    void set_peek_index(int value) {
        m_peek_index = value;
    }
    
    [[nodiscard]] inline std::optional<Token> peek(int offset = 0) const
    {
        if (m_hard_consume) {
            if (m_index + offset >= m_tokens.size()) {
                return {};
            }
            else {
                return m_tokens.at(m_index + offset);
            }
        } else {
            if (m_index + offset + m_peek_index >= m_tokens.size()) {
                return {};
            }
            else {
                return m_tokens.at(m_index + offset + m_peek_index);
            }
        }
    }

    inline void peek_assert(TokenType type, int offset = 0, const std::string& err_msg = "") const {
        if (m_hard_consume) {
            if (m_index + offset >= m_tokens.size()) {
                std::cerr << "Peek Assert Failed With No More Tokens" << std::endl;
                exit(EXIT_FAILURE);
            }
            if (!peek(offset).has_value()) {
                std::cerr << "Peek Asset Failed With No Token Value" << std::endl;
                exit(EXIT_FAILURE);
            }
            if (peek(offset).has_value() && peek(offset).value().type != type) {
                std::cerr << err_msg << std::endl;
                exit(EXIT_FAILURE);
            }
        } else {
            if (m_index + offset + m_peek_index >= m_tokens.size()) {
                std::cerr << "Peek Assert Failed With No More Tokens" << std::endl;
                exit(EXIT_FAILURE);
            }
            if (!peek(offset + m_peek_index).has_value()) {
                std::cerr << "Peek Asset Failed With No Token Value" << std::endl;
                exit(EXIT_FAILURE);
            }
            if (peek(offset + m_peek_index).has_value() && peek(offset).value().type != type) {
                std::cerr << err_msg << std::endl;
                exit(EXIT_FAILURE);
            }
        }
    }

    inline Token consume()
    {
        if (m_hard_consume) {
            return m_tokens.at(m_index++);
        } else {
            return m_tokens.at(m_index + m_peek_index++);
        }
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
    bool m_hard_consume = true;
    int m_peek_index = 0;
};

class ParseStatement {
public: 
    std::optional<NodeStatement*> parseNode(ParentParser* parent);
};

class ParseFile {
public:
    std::optional<NodeStatementTake*> parseNode(ParentParser* parent, std::string name, std::string filePath, std::vector<Token> tokens);
};

class ParseExpression {
public:
    std::optional<NodeExpression*> parseNode(ParentParser* parent);
private:
    NodeExpression* parseExpression(
        ParentParser* parent, 
        NodeExpression* expr, 
        std::optional<
            std::variant<
                NodeTerm*,
                NodeFunctionExecution*
            >
        > term
    );
};

class ParseTerm {
public:
    std::optional<NodeTerm*> parseNode(ParentParser* parent);
};