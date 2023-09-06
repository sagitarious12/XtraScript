#pragma once

#include <variant>

#include "tokenization.hpp"

struct NodeDiscard {};

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

struct NodeBinaryExpressionSub {
    NodeExpression* lhs;
    NodeExpression* rhs;
};

struct NodeBinaryExpression {
    std::variant<
        NodeBinaryExpressionAdd*,
        NodeBinaryExpressionSub*
    > bin_expr;
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
    std::vector<NodeTerm*> functionParams;
};

struct NodeFunctionEnd {
    bool end;
    bool isSelfCalling;
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

struct NodeStatement;

struct NodeStatementTake {
    std::vector<NodeStatement*> stmts;
    std::string programName;
    std::string programFilePath;
};

struct NodeStatement {
    std::variant<
      NodeStatementReturn*, 
      NodeStatementDefinition*, 
      NodeStatementTake*,
      NodeStatementPrintConsole*,
      NodeFunctionExecution*,
      NodeFunctionEnd*,
      NodeDiscard*
    > value;
};

struct NodeProgram {
    std::vector<NodeStatement*> stmts;
    std::string programName;
    std::string programFilePath;
};