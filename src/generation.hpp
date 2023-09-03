#pragma once

#include "parser.hpp"
#include <cassert>
#include <unordered_map>

class Generator {
public:
    inline explicit Generator(NodeProgram prog)
        : m_prog(std::move(prog))
    {
    }

    void generate_term(const NodeTerm* term) {
        struct TermVisitor {
            Generator* gen;
            void operator()(const NodeTermIntLit* term_int_lit) const {
            }

            void operator()(const NodeTermIdent* term_ident) const {
            }

            void operator()(const NodeTermStringLit* term_string_lit) const {
                
            }
        };
        TermVisitor visitor({.gen = this});
        std::visit(visitor, term->value);
    }

    void generate_expression(const NodeExpression* expr)
    {
        struct ExpressionVisitor {
            Generator* gen;
            void operator()(const NodeTerm* term) const {
            }

            void operator()(const NodeBinaryExpression* bin_expr) const {
            }

            void operator()(const std::vector<NodeStatement*> node_stmts) const {

            }
        };

        ExpressionVisitor visitor { .gen = this };
        std::visit(visitor, expr->value);
    }

    void generate_statement(const NodeStatement* stmt)
    {
        struct StatementVisitor {
            Generator* gen;
            void operator()(const NodeStatementReturn* stmt_exit) const {
            }

            void operator()(const NodeStatementDefinition* stmt_definition) const {

            }

            void operator()(const NodeStatementTake* stmt_take) const {

            }

            void operator()(const NodeStatementPrintConsole* stmt_print_console) const {

            }

            void operator()(const NodeProgram* stmt_program) const {

            }
        };

        StatementVisitor visitor { .gen = this };
        std::visit(visitor, stmt->value);
    }

    [[nodiscard]] std::string generate_program()
    {
        m_output << "(()=>{\n";

        for (const NodeStatement* stmt : m_prog.stmts) {
            generate_statement(stmt);
        }

        m_output << "})();\n";

        return m_output.str();
    }

private:


    struct Var {
        size_t stack_loc;
    };

    const NodeProgram m_prog;
    std::stringstream m_output;
    size_t m_stack_size = 0;
    std::unordered_map<std::string, Var> m_vars {};
};