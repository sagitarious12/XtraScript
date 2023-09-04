#pragma once

#include <variant>
#include <map>

#include "./arena.hpp"
#include "tokenization.hpp"
#include "./nodes.hpp"
#include "./file_reader.hpp"



class Parser {
public:
    inline explicit Parser(std::vector<Token> tokens, Files fileReader)
        : m_tokens(std::move(tokens))
        , m_allocator(1024 * 1024 * 4) // 4 mb
        , m_file_reader(fileReader)
    {}

    std::optional<NodeTerm*> parse_term()
    {
        if (auto int_lit = try_consume(TokenType::int_lit)) {
            auto term_int_lit = m_allocator.alloc<NodeTermIntLit>();
            term_int_lit->int_lit = int_lit.value();
            auto term = m_allocator.alloc<NodeTerm>();
            term->value = term_int_lit;
            return term;
        }
        else if (auto ident = try_consume(TokenType::ident)) {
            auto expr_ident = m_allocator.alloc<NodeTermIdent>();
            expr_ident->ident = ident.value();
            auto term = m_allocator.alloc<NodeTerm>();
            term->value = expr_ident;
            return term;
        }
        else if (auto string_lit = try_consume(TokenType::string_lit)) {
            auto term_string_lit = m_allocator.alloc<NodeTermStringLit>();
            term_string_lit->string_lit = string_lit.value();
            auto term = m_allocator.alloc<NodeTerm>();
            term->value = term_string_lit;
            return term;
        }
        else {
            return {};
        }
    }

    std::optional<NodeExpression*> parse_expression()
    {
        if (auto term = parse_term()) {
            if (try_consume(TokenType::plus).has_value()) {
                auto bin_expr = m_allocator.alloc<NodeBinaryExpression>();
                auto bin_expr_add = m_allocator.alloc<NodeBinaryExpressionAdd>();
                auto lhs_expr = m_allocator.alloc<NodeExpression>();
                lhs_expr->value = term.value();
                bin_expr_add->lhs = lhs_expr;
                if (auto rhs = parse_expression()) {
                    bin_expr_add->rhs = rhs.value();
                    bin_expr->add = bin_expr_add;
                    auto expr = m_allocator.alloc<NodeExpression>();
                    expr->value = bin_expr;
                    return expr;
                }
                else {
                    std::cerr << "Expected expression" << std::endl;
                    exit(EXIT_FAILURE);
                }
            }
            else {
                auto expr = m_allocator.alloc<NodeExpression>();
                expr->value = term.value();
                return expr;
            }
        }
        else {
            return {};
        }
    }

    std::optional<NodeStatementReturnType*> parse_statement_return_type() {
        auto stmt_return_type = m_allocator.alloc<NodeStatementReturnType>();

        if (auto functionType = try_consume(TokenType::ident)) {
            stmt_return_type->ident = functionType.value();
        } else if (auto functionType = try_consume(TokenType::void_type)) {
            stmt_return_type->ident = functionType.value();
        } else if (auto functionType = try_consume(TokenType::int_type)) {
            stmt_return_type->ident = functionType.value();
        } else if (auto functionType = try_consume(TokenType::string_type)) {
            stmt_return_type->ident = functionType.value();
        } else {
            return {};
        }

        return stmt_return_type;
    }

    std::optional<NodeFunctionArguments*> parse_function_args() {
        auto function_args = m_allocator.alloc<NodeFunctionArguments>();
        if (auto type = parse_statement_return_type()) {
            function_args->type = type.value();
            if (auto argToken = try_consume(TokenType::ident)) {
                function_args->ident = argToken.value();
            } else {
                return {};
            }
        } else {
            return {};
        }
        return function_args;
    }

    std::optional<NodeFunctionExecution*> parse_function_execution() {
        auto stmt_function_execution = m_allocator.alloc<NodeFunctionExecution>();
        while (peek(1).has_value() && peek(1).value().type == TokenType::dot) {
            if (auto token = try_consume(TokenType::ident)) {
                stmt_function_execution->dotNotations.push_back(token.value());
            }
            consume();
        }
        if (auto functionName = try_consume(TokenType::ident)) {
            stmt_function_execution->ident = functionName.value();
        }
        try_consume(TokenType::open_paren, "Invalid Function Call, Expected '('");
        while (peek().has_value() && peek().value().type == TokenType::ident) {
            if (auto token = try_consume(TokenType::ident)) {
                stmt_function_execution->functionParams.push_back(token.value());
            }
            try_consume(TokenType::comma);
        }
        try_consume(TokenType::close_paren, "Invalid Function Call, Expected ')'");
        try_consume(TokenType::semi, "Missing Semicolon at end of function call");
        try_parse_close_braces();
        return stmt_function_execution;
    }
    
    std::optional<NodeStatementPrintConsole*> parse_console_log() {
        try_consume(TokenType::ident);
        try_consume(TokenType::open_paren);
        auto stmt_builtin_function = m_allocator.alloc<NodeStatementPrintConsole>();
        if (auto print_expr = parse_expression()) {
            stmt_builtin_function->expr = print_expr.value();
        }
        try_consume(TokenType::close_paren, "Invalid Function Call, Expected ')'");
        try_consume(TokenType::semi, "Invalid statement, Missing ';'");
        try_parse_close_braces();
        return stmt_builtin_function;
    }

    bool try_parse_close_braces() {
        if (auto close_brace = try_consume(TokenType::close_brace)) {
            try_consume(TokenType::semi, "Invalid Scope, Expected ';'");
            return true;
        }
        return false;
    }

    bool is_take_statement() {
        return peek().has_value() && peek().value().type == TokenType::take &&
            peek(1).has_value() && peek(1).value().type == TokenType::string_lit &&
            peek(2).has_value() && peek(2).value().type == TokenType::as &&
            peek(3).has_value() && peek(3).value().type == TokenType::ident &&
            peek(4).has_value() && peek(4).value().type == TokenType::semi;
    }

    bool is_function_start() {
        return (
                peek().has_value() && peek().value().type == TokenType::void_type ||
                peek().has_value() && peek().value().type == TokenType::int_type ||
                peek().has_value() && peek().value().type == TokenType::string_type ||
                peek().has_value() && peek().value().type == TokenType::ident
            ) &&
            peek(1).has_value() && peek(1).value().type == TokenType::ident &&
            peek(2).has_value() && peek(2).value().type == TokenType::function_start &&
            peek(3).has_value() && peek(3).value().type == TokenType::open_paren;
    }

    bool is_variable_declaration() {
        return (
                peek().has_value() && peek().value().type == TokenType::void_type ||
                peek().has_value() && peek().value().type == TokenType::int_type ||
                peek().has_value() && peek().value().type == TokenType::string_type ||
                peek().has_value() && peek().value().type == TokenType::ident
            ) &&
            peek(1).has_value() && peek(1).value().type == TokenType::ident &&
            peek(2).has_value() && peek(2).value().type == TokenType::eq;
    }

    bool is_function_execution() {
        return (
                peek().has_value() && peek().value().type == TokenType::ident &&
                peek(1).has_value() && peek(1).value().type == TokenType::open_paren
            ) ||
            (
                peek().has_value() && peek().value().type == TokenType::ident &&
                peek(1).has_value() && peek(1).value().type == TokenType::dot
            );
    }

    bool is_function_builtin() {
        return peek().value().value == "printc";
    }

    bool is_return_statement() {
        return peek().has_value() && peek().value().type == TokenType::returns;
    }

    bool is_dot_notation() {
        return peek().has_value() && peek().value().type == TokenType::ident &&
            peek(1).has_value() && peek(1).value().type == TokenType::dot;
    }

    std::optional<NodeStatement*> parse_statement()
    {
        auto stmt = m_allocator.alloc<NodeStatement>();
        if (is_take_statement()) {
            try_consume(TokenType::take, "Invalid take statement. Expected 'take'");
            Token filepath = try_consume(TokenType::string_lit, "Invalid file path in take statement");
            try_consume(TokenType::as, "invalid take statement. Expected 'as'");
            Token fileIdentity = try_consume(TokenType::ident, "invalid take statement. Missing take file identity.");
            try_consume(TokenType::semi, "Missing Semi Colon in take statement");
            programIt = programs.find(filepath.value.value());
            if (programIt == programs.end()) {

                std::string contents = m_file_reader.read_file(filepath.value.value().c_str());

                Tokenizer tokenizer(std::move(contents));
                std::vector<Token> tokens = tokenizer.tokenize();
                
                Parser parser(std::move(tokens), m_file_reader);
                std::optional<NodeProgram> program = parser.parse_program(fileIdentity.value.value(), filepath.value.value());

                if (!program.has_value()) {
                    std::cerr << "Invalid program at " << filepath.value.value() << std::endl;
                    exit(EXIT_FAILURE);
                }
                
                if (program.has_value()) {
                    stmt->value = &program.value();
                }
                return stmt;
            } else {
                // TODO
                // we have already import the file, we just need to use the right name for the import
            }

        } else if (is_function_start()) {
            auto stmt_definition = m_allocator.alloc<NodeStatementDefinition>();
            if (auto return_type = parse_statement_return_type()) {
                stmt_definition->returns = return_type.value();
            }
            if (auto functionName = try_consume(TokenType::ident)) {
                stmt_definition->ident = functionName.value();
            }
            try_consume(TokenType::function_start);
            try_consume(TokenType::open_paren);
            if (peek().has_value() && peek().value().type != TokenType::close_paren) {
                while(peek().has_value() && peek().value().type != TokenType::close_paren) {
                    if (auto functionArg = parse_function_args()) {
                        stmt_definition->args.push_back(functionArg.value());
                    }
                    if (peek().value().type != TokenType::close_paren) {
                        consume();
                    }
                }
                try_consume(TokenType::close_paren);
                try_consume(TokenType::open_brace);
                try_parse_close_braces();
                stmt->value = stmt_definition;
                return stmt;
            } else { // no function arguments
                stmt->value = stmt_definition;
                
                try_consume(TokenType::close_paren);
                try_consume(TokenType::open_brace);
                return stmt;
            }
        } 
        else if (is_function_execution()) {
            if (is_function_builtin()) {
                // builtin functions need their own parse
                if (peek().value().value == "printc") {
                    auto stmt_builtin_function = parse_console_log();
                    stmt->value = stmt_builtin_function.value();
                    return stmt;
                }
            } else if (is_dot_notation()) {
                auto stmt_function_execution = parse_function_execution();
                stmt->value = stmt_function_execution.value();
                return stmt;
            } else {
                return {};
            }
        }
        else if (is_variable_declaration()) {
            auto stmt_definition = m_allocator.alloc<NodeStatementDefinition>();
            if (auto var_type = parse_statement_return_type()) {
                stmt_definition->returns = var_type.value();
            }
            if (auto ident = try_consume(TokenType::ident)) {
                stmt_definition->ident = ident.value();
            }
            try_consume(TokenType::eq, "Invalid Variable Declaration, Expected '='");
            if (is_dot_notation()) {
                if (auto stmt_function_execution = parse_function_execution()) {
                    stmt_definition->functionCall = stmt_function_execution.value();
                }
                try_parse_close_braces();
                stmt->value = stmt_definition;
                return stmt;
            } else {
                if (auto expr = parse_expression()) {
                    stmt_definition->expr = expr.value();
                }
                stmt->value = stmt_definition;
                try_consume(TokenType::semi, "Invalid Variable Declaration, Expected ';'");
                try_parse_close_braces();
                return stmt;
            }
        }
        else if (is_return_statement()) {
            try_consume(TokenType::returns);
            auto return_expr = m_allocator.alloc<NodeStatementReturn>();
            if (auto expr = parse_expression()) {
                return_expr->expr = expr.value();
            }
            stmt->value = return_expr;
            try_consume(TokenType::semi, "Invalid Return Statement, Expected ';'");
            if (auto close_brace = try_consume(TokenType::close_brace)) {
                try_consume(TokenType::semi, "Invalid Scope, Expected ';'");
            }
            return stmt;
        }
        
        else {
            return {};
        }
        // if (
        //     peek().value().type == TokenType::exit && peek(1).has_value()
        //     && peek(1).value().type == TokenType::open_paren
        // ) {
        //     consume();
        //     consume();
        //     auto stmt_exit = m_allocator.alloc<NodeStatementExit>();
        //     if (auto node_expr = parse_expr()) {
        //         stmt_exit->expr = node_expr.value();
        //     }
        //     else {
        //         std::cerr << "Invalid expression" << std::endl;
        //         exit(EXIT_FAILURE);
        //     }
        //     try_consume(TokenType::close_paren, "Expected `)`");
        //     try_consume(TokenType::semi, "Expected `;`");
        //     auto stmt = m_allocator.alloc<NodeStatement>();
        //     stmt->var = stmt_exit;
        //     return stmt;
        // }
        // else if (
        //     peek().has_value() && peek().value().type == TokenType::let && peek(1).has_value()
        //     && peek(1).value().type == TokenType::ident && peek(2).has_value()
        //     && peek(2).value().type == TokenType::eq
        // ) {
        //     consume();
        //     auto stmt_let = m_allocator.alloc<NodeStatementLet>();
        //     stmt_let->ident = consume();
        //     consume();
        //     if (auto expr = parse_expr()) {
        //         stmt_let->expr = expr.value();
        //     }
        //     else {
        //         std::cerr << "Invalid expression" << std::endl;
        //         exit(EXIT_FAILURE);
        //     }
        //     try_consume(TokenType::semi, "Expected `;`");
        //     auto stmt = m_allocator.alloc<NodeStatement>();
        //     stmt->var = stmt_let;
        //     return stmt;
        // }

        return {};
    }

    std::optional<NodeProgram> parse_program(std::string name, std::string filePath)
    {
        NodeProgram prog;
        prog.programName = name;
        prog.programFilePath = filePath;
        while (peek().has_value()) {
            if (auto stmt = parse_statement()) {
                prog.stmts.push_back(stmt.value());
            }
            else {
                std::cerr << "Invalid statement" << std::endl;
                std::cerr << "Invalid " << token_names.at(as_integer(peek().value().type)) << std::endl;
                if (peek().value().type == TokenType::ident) {
                    auto value = try_consume(TokenType::ident).value();
                    std::cerr << value.value.value_or("default") << std::endl;
                }
                exit(EXIT_FAILURE);
            }
        }
        return prog;
    }

private:
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

    std::map<std::string, std::string> programs;
    std::map<std::string, std::string>::iterator programIt;
    const std::vector<Token> m_tokens;
    size_t m_index = 0;
    ArenaAllocator m_allocator;
    Files m_file_reader;
};