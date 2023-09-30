#pragma once

#include "../parent_parser.hpp"
#include "../checkers.hpp"
#include "parse_take.hpp"
#include "parse_statement_definition.hpp"
#include "../builtins/parse_builtin.hpp"
#include "parse_function_execution.hpp"
#include "parse_variable.hpp"
#include "parse_return.hpp"
#include "parse_function_end.hpp"
#include "../decorator/parse_decorator.hpp"
#include "frame/parse_frame.hpp"
#include "if-else_if-else/parse_conditional.hpp"

namespace Frame {
    std::optional<NodeStatement*> ParseStatement::parseNode(ParentParser* parent) {
        auto statement = parent->m_allocator.alloc<NodeStatement>();
        Checker checker;

        if (checker.is_take_statement(parent)) {
            ParseTake takeParser;
            auto stmt_take = takeParser.parseNode(parent);
            if (std::holds_alternative<std::optional<NodeStatementTake*>>(stmt_take)) {
                statement->value = std::get<std::optional<NodeStatementTake*>>(stmt_take).value();
            } 
            
            else if (std::holds_alternative<std::optional<NodeDiscard*>>(stmt_take)) {
                statement->value = std::get<std::optional<NodeDiscard*>>(stmt_take).value();
            }
            return statement;
        }

        else if (checker.is_function_start(parent)) {
            ParseStatementDefinition definitionParser;
            if (auto stmt_definition = definitionParser.parseNode(parent)) {
                statement->value = stmt_definition.value();
            }
            return statement;
        }

        else if (checker.is_function_execution(parent)) {

            if (checker.is_function_builtin(parent)) {
                ParseBuiltin builtinParser;

                if (auto builtin = builtinParser.parseNode(parent)) {
                    statement->value = builtin.value();
                }
                
                return statement;
            }

            else if (checker.is_dot_notation(parent)) {
                ParseFunctionExecution functionExecutionParser;
                if (auto functionExecution = functionExecutionParser.parseNode(parent)) {
                    statement->value = functionExecution.value();
                    parent->try_consume(TokenType::semi, "Missing Semicolon at end of function call");
                }
                return statement;
            } 

            else {
                return {};
            }

        }

        else if (checker.is_variable_declaration(parent)) {
            ParseVariable variableParser;
            if (auto variable = variableParser.parseNode(parent)) {
                statement->value = variable.value();
            }
            return statement;
        }

        else if (checker.is_return_statement(parent)) {
            ParseReturn returnParser;
            if (auto _return = returnParser.parseNode(parent)) {
                statement->value = _return.value();
            }
            return statement;
        }

        else if (checker.is_function_end(parent)) {
            ParseFunctionEnd functionEndParser;
            if (auto functionEnd = functionEndParser.parseNode(parent)) {
                statement->value = functionEnd.value();
            }
            return statement;
        }

        else if (checker.is_decorator(parent)) {
            ParseDecorator decoratorParser;
            if (auto decorator = decoratorParser.parseNode(parent)) {
                statement->value = decorator.value();
            }
            return statement;
        }

        else if (checker.is_frame_declaration(parent)) {
            ParseFrame frameParser;
            if (auto frame = frameParser.parseNode(parent)) {
                statement->value = frame.value();
            }
            return statement;
        }

        else if (checker.is_if_statement(parent)) {
            ParseConditional conditionalParser;
            if (auto cond = conditionalParser.parseNode(parent)) {
                statement->value = cond.value();
            }
            return statement;
        }

        else {
            std::cout << "BREAK" << std::endl;
            return {};
        }


        return {};
    }
}