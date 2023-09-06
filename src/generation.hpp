#pragma once

#include "parser.hpp"
#include <cassert>
#include <unordered_map>

class Generator {
public:
    inline explicit Generator(std::variant<NodeProgram, NodeStatementTake> prog)
        : m_prog(std::move(prog))
    {
    }

    void generate_term(const NodeTerm* term) {
        struct TermVisitor {
            Generator* gen;
            void operator()(const NodeTermIntLit* term_int_lit) const {
                gen->add(term_int_lit->int_lit.value.value());
            }

            void operator()(const NodeTermIdent* term_ident) const {
                gen->add(term_ident->ident.value.value());
            }

            void operator()(const NodeTermStringLit* term_string_lit) const {
                gen->add("\"" + term_string_lit->string_lit.value.value() + "\"");
            }
        };
        TermVisitor visitor({.gen = this});
        std::visit(visitor, term->value);
    }

    void generate_binary_expression(const NodeBinaryExpression* bin_expr) {
        struct BinExprVisitor {
            Generator* gen;
            void operator()(const NodeBinaryExpressionAdd* add) const {
                gen->generate_expression(add->lhs);
                gen->add(" + ");
                gen->generate_expression(add->rhs);
            }

            void operator()(const NodeBinaryExpressionSub* add) const {
                gen->generate_expression(add->lhs);
                gen->add(" - ");
                gen->generate_expression(add->rhs);
            }
        };
        BinExprVisitor visitor { .gen = this };
        std::visit(visitor, bin_expr->bin_expr);
    }

    void generate_expression(const NodeExpression* expr)
    {
        struct ExpressionVisitor {
            Generator* gen;
            void operator()(const NodeTerm* term) const {
                gen->generate_term(term);
            }

            void operator()(const NodeBinaryExpression* bin_expr) const {
                gen->generate_binary_expression(bin_expr);
            }

            void operator()(const NodeFunctionExecution* node_stmts) const {
                // std::cout << node_stmts->ident.value.value() << std::endl;
            }
        };

        ExpressionVisitor visitor { .gen = this };
        std::visit(visitor, expr->value);
    }

    void generate_function_execution(const NodeFunctionExecution* ex, const NodeStatementDefinition* stmt_definition = {}) {
        if (ex->dotNotations.size() > 0) {
            for (int i = 0; i < ex->dotNotations.size(); i++) {
                bool useIndent = ((stmt_definition && !stmt_definition->returns) || (!stmt_definition) && i == 0);
                add(ex->dotNotations.at(i).value.value() + ".", useIndent);
            }
        }
        bool useIndent = stmt_definition && !stmt_definition->returns && ex->dotNotations.size() <= 0;
        add(ex->ident.value.value() + "(", useIndent);
        if (ex->functionParams.size() > 0) {
            for (int i = 0; i < ex->functionParams.size(); i++) {
                generate_term(ex->functionParams.at(i));
                // generate_term(ex->functionParams.at(i).value.value());
                if (i + 1 < ex->functionParams.size()) {
                    add(", ");
                }
            }
        }
        add(");\n");
    }

    void generate_statement(const NodeStatement* stmt)
    {
        struct StatementVisitor {
            Generator* gen;
            void operator()(const NodeStatementReturn* stmt_return) const {
                gen->add("return ", true);
                gen->generate_expression(stmt_return->expr);
                gen->add(";\n");
            }

            void operator()(const NodeStatementDefinition* stmt_definition) const {
                if (stmt_definition->expr) {
                    gen->add("let " + stmt_definition->ident.value.value() + " = ", true);
                    gen->generate_expression(stmt_definition->expr);
                    gen->add(";\n");
                } else if (stmt_definition->functionCall) {
                    if (stmt_definition->returns) {
                        gen->add("let " + stmt_definition->ident.value.value() + " = ", true);
                    }
                    gen->generate_function_execution(stmt_definition->functionCall, stmt_definition);
                } else {
                    if (
                        stmt_definition->returns->ident.type == TokenType::void_type &&
                        stmt_definition->args.size() == 0 &&
                        stmt_definition->ident.value.value() == "main"
                    ) {
                        gen->add("(() => {\n", true);
                        gen->increment_indent();
                    } else {
                        gen->add(stmt_definition->ident.value.value() + ":(", true);
                        for (int i = 0; i < stmt_definition->args.size(); i++) {
                            NodeFunctionArguments* arg = stmt_definition->args.at(i);
                            gen->add(arg->ident.value.value());
                            if (i + 1 < stmt_definition->args.size()) {
                                gen->add(",");
                            }
                        }
                        gen->add(") => {\n");
                        gen->increment_indent();
                    }

                }
            }

            void operator()(const NodeStatementPrintConsole* stmt_print_console) const {
                gen->add("console.log(", true);
                gen->generate_expression(stmt_print_console->expr);
                gen->add(");\n");
            }

            void operator()(const NodeStatementTake* stmt_program) const {
                NodeProgram currentProg = std::get<NodeProgram>(gen->m_prog);
                gen->m_prog = *stmt_program;
                gen->add(gen->generate_program());
                gen->m_prog = currentProg;
            }

            void operator()(const NodeFunctionExecution* stmt_function_execution) const {
                gen->generate_function_execution(stmt_function_execution);
            }

            void operator()(const NodeFunctionEnd* stmt_function_end) const {
                gen->decrement_indent();
                if (stmt_function_end->end) {
                    if (stmt_function_end->isSelfCalling) {
                        gen->add("})();\n", true);
                        gen->decrement_indent();
                    } else {
                        gen->add("},\n", true);
                        gen->decrement_indent();
                    }
                } else {
                    gen->add("},\n", true);
                }
            }

            void operator()(const NodeDiscard* discard) const {
                std::cout << "should never get here" << std::endl;
            }
        };

        StatementVisitor visitor { .gen = this };
        std::visit(visitor, stmt->value);
    }

    [[nodiscard]] std::string generate_program()
    {
        if (std::holds_alternative<NodeProgram>(m_prog)) {
            add("(()=>{\n", true);
            increment_indent();
            add("\"use strict\";\n", true);
            auto prog = std::get<NodeProgram>(m_prog);
            for (const NodeStatement* stmt : prog.stmts) {
                generate_statement(stmt);
            }
            add("})();\n", true);
            return m_output.str();
        } else if (std::holds_alternative<NodeStatementTake>(m_prog)) {
            use_take_output = true;
            m_take_output.str("");
            m_take_output.clear();
            auto take = std::get<NodeStatementTake>(m_prog);
            add("const " + take.programName + "={\n", true);
            increment_indent();
            for (const NodeStatement* stmt : take.stmts) {
                generate_statement(stmt);
            }
            add("};\n", true);
            use_take_output = false;
            return m_take_output.str();
        }

        return m_output.str();
    }

private:

    void add(std::string value, bool use_indent = false) {
        if (use_take_output) {
            if (use_indent) {
                for (int i = 0; i < m_indent_count; i++) {
                    m_take_output << "  ";
                }
            }
            m_take_output << value;
        } else {
            if (use_indent) {
                for (int i = 0; i < m_indent_count; i++) {
                    m_output << "  ";
                }
            }
            m_output << value;
        }
    }

    void increment_indent() {
        m_indent_count += 1;
    }

    void decrement_indent() {
        m_indent_count -= 1;
    }

    struct Var {
        size_t stack_loc;
    };

    bool use_take_output = false;
    std::variant<NodeProgram, NodeStatementTake> m_prog;
    std::stringstream m_output;
    std::stringstream m_take_output;
    size_t m_stack_size = 0;
    std::unordered_map<std::string, Var> m_vars {};
    int m_indent_count = 0;
};