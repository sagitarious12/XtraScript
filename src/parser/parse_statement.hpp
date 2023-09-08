#pragma once

#include "parent_parser.hpp"
#include "checkers.hpp"
#include "parse_take.hpp"
#include "parse_statement_definition.hpp"
#include "parse_builtin.hpp"
#include "parse_function_execution.hpp"
#include "parse_variable.hpp"
#include "parse_return.hpp"
#include "parse_function_end.hpp"

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
            auto builtin = builtinParser.parseNode(parent);
            
            if (std::holds_alternative<std::optional<NodeStatementPrintConsole*>>(builtin)) {
                statement->value = std::get<std::optional<NodeStatementPrintConsole*>>(builtin).value();
            }
            
            return statement;
        }

        else if (checker.is_dot_notation(parent)) {
            ParseFunctionExecution functionExecutionParser;
            if (auto functionExecution = functionExecutionParser.parseNode(parent)) {
                statement->value = functionExecution.value();
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

    else {
        return {};
    }

    return {};
}