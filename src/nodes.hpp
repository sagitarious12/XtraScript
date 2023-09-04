#pragma once

#include <variant>

#include "tokenization.hpp"

struct NodeTermIntLit {
    Token int_lit;
};

struct NodeTermIdent {
    Token ident;
};

struct NodeTermStringLit {
  Token string_lit;
};

struct NodeExpression;
struct NodeStatement;

struct NodeBinaryExpressionAdd {
    NodeExpression* lhs;
    NodeExpression* rhs;
};

struct NodeBinaryExpression {
    NodeBinaryExpressionAdd* add;
};

struct NodeTerm {
    std::variant<
      NodeTermIntLit*, 
      NodeTermIdent*, 
      NodeTermStringLit*
    > value;
};

struct NodeFunctionExecution {
    std::vector<Token> dotNotations;
    Token ident;
    std::vector<Token> functionParams;
};

struct NodeExpression {
    std::variant<
      NodeTerm*, 
      NodeBinaryExpression*,
      NodeFunctionExecution*
    > value;
};

struct NodeStatementReturn {
    NodeExpression* expr;
};

struct NodeStatementPrintConsole {
    NodeExpression* expr;
};

struct NodeStatementReturnType {
    Token ident;
};

struct NodeFunctionArguments {
  NodeStatementReturnType* type;
  Token ident;
};

struct NodeStatementDefinition {
    bool exports; // gives
    NodeStatementReturnType* returns; //void, String, Int
    Token ident; // variable name
    NodeExpression* expr; // variable value, string value
    std::vector<NodeFunctionArguments*> args;
    NodeFunctionExecution* functionCall;
};

struct NodeStatementTakeFilepath {
    NodeExpression* expr;
};

struct NodeStatementTake {
    NodeStatementTakeFilepath* filepath;
    Token ident;
};

struct NodeProgram;

struct NodeStatement {
    std::variant<
      NodeStatementReturn*, 
      NodeStatementDefinition*, 
      NodeStatementTake*,
      NodeStatementPrintConsole*,
      NodeProgram*,
      NodeFunctionExecution*
    > value;
};

struct NodeProgram {
    std::vector<NodeStatement*> stmts;
    std::string programName;
    std::string programFilePath;
};