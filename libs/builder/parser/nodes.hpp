#pragma once

#include <variant>

#include "../tokenize/tokenization.hpp"

namespace Frame {
    #pragma region Forward Definitions

        struct NodeStatement;
        struct NodeExpression;
        struct NodeTerm;

    #pragma endregion

    #pragma region Expression

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

        struct NodeTermIntLit {
            Token int_lit;
        };

        struct NodeTermIdent {
            Token ident;
        };

        struct NodeTermStringLit {
            Token string_lit;
        };

        struct NodeObjectLitProp {
            Token key;
            NodeTerm* value;
        };

        struct NodeTermObjectLit {
            std::vector<NodeObjectLitProp*> keys;
        };

        struct NodeTermArrayLit {
            std::vector<NodeTerm*> values;
        };

        struct NodeTermUndefined {};
        struct NodeTermNull {};

        struct NodeTermBooleanLit {
            Token value;
        };

        struct NodeTerm {
            std::variant<
            NodeTermIntLit*, 
            NodeTermIdent*, 
            NodeTermStringLit*,
            NodeTermObjectLit*,
            NodeTermArrayLit*,
            NodeTermUndefined*,
            NodeTermNull*,
            NodeTermBooleanLit*
            > value;
        };

        struct NodeFunctionExecution {
            std::vector<Token> dotNotations;
            Token ident;
            std::vector<NodeTerm*> functionParams;
        };

        struct NodeExpression {
            std::variant<
            NodeTerm*, 
            NodeBinaryExpression*,
            NodeFunctionExecution*
            > value;
        };

    #pragma endregion

    #pragma region Return 

        struct NodeStatementReturn {
            NodeExpression* expr;
        };

    #pragma endregion

    #pragma region Statment Definition

        struct NodeStatementReturnType {
            Token ident;
        };

        struct NodeFunctionArguments {
            NodeStatementReturnType* type;
            Token ident;
        };

        struct NodeStatementDefinition {
            NodeStatementReturnType* returns; //void, String, Int
            Token ident; // variable name
            NodeExpression* expr; // variable value, string value
            std::vector<NodeFunctionArguments*> args;
            NodeFunctionExecution* functionCall;
        };

    #pragma endregion

    #pragma region Take Statement

        struct NodeStatementTake {
            std::vector<NodeStatement*> stmts;
            std::string programName;
            std::string programFilePath;
        };

    #pragma endregion

    #pragma region Builtin Functions

        struct NodePrintConsole {
            NodeExpression* expr;
        };

        struct NodeInitWebApp {
            NodeExpression* expr;
        };

        struct NodeXtraCommand {
            std::variant<
                NodeInitWebApp*
            > cmd;
        };

        struct NodeBuiltinFunction {
            std::variant<
                NodePrintConsole*,
                NodeXtraCommand*
            > fn;
        };

    #pragma endregion

    #pragma region FunctionEnd

        struct NodeFunctionEnd {
            bool end;
            bool isSelfCalling;
        };

    #pragma endregion

    #pragma region Discard

        struct NodeDiscard {};

    #pragma endregion

    #pragma region Decorators

        struct ElementStatement {
            std::string key;
            std::string value;
            std::optional<bool> isVariable;
            std::optional<bool> isFunction;
            std::optional<bool> isConditional;
            std::optional<bool> isExpression;
        };

        struct ElementData {
            std::string selector;
            std::vector<std::optional<ElementStatement*>> attributes;
            std::vector<std::optional<ElementData*>> children;
            std::optional<ElementStatement*> content;
            std::string usedInComponent;
            std::optional<std::string> usesComponent;
            std::vector<std::variant<std::string, bool, float>> componentArgs;
            std::string styleContent;
        };

        struct NodeHTMLProgram {
            std::vector<std::optional<ElementData*>> value;
        };

        struct NodeModuleDecorator {
            NodeObjectLitProp* injectables;
            NodeObjectLitProp* components;
            NodeObjectLitProp* capsules;
            NodeObjectLitProp* exports;
        };

        struct NodeComponentDecorator {
            NodeHTMLProgram* htmlMarkup;
            std::string styleContent;
            std::string htmlMarker;
        };

        struct NodePropDecorator {};
        struct NodeEmitDecorator {};
        struct NodeInjectableDecorator {};

        struct NodeStatementDecorator {
            std::variant<
                NodeComponentDecorator*,
                NodeModuleDecorator*,
                NodePropDecorator*,
                NodeEmitDecorator*,
                NodeInjectableDecorator*
            > decorator;
        };

    #pragma endregion

    #pragma region Frame Definition

    struct NodeStatementFrame {
        Token name;
        std::vector<NodeStatement*> stmts;
        std::optional<std::vector<NodeFunctionArguments*>> args;
        std::optional<std::vector<NodeStatement*>> constructor_stmts;
    };

    #pragma endregion

    #pragma region If Statement

    struct NodeConditional {
        NodeExpression* lhs;
        Token comparator;
        NodeExpression* rhs;
        std::optional<Token> join_operator;
    };

    struct NodeStatementIf {
        std::vector<NodeConditional*> conditions;
        std::vector<NodeStatement*> stmts;
    };

    struct NodeStatementElseIf {
        std::vector<NodeConditional*> conditions;
        std::vector<NodeStatement*> stmts;
    };

    struct NodeStatementElse {
        std::vector<NodeStatement*> stmts;
    };

    struct NodeIfElseIfElse {
        std::variant<
            NodeStatementIf*,
            NodeStatementElseIf*,
            NodeStatementElse*
        > conditional;
    };

    #pragma endregion

    struct NodeStatement {
        std::variant<
            NodeStatementReturn*, 
            NodeStatementDefinition*, 
            NodeStatementTake*,
            NodeBuiltinFunction*,
            NodeFunctionExecution*,
            NodeFunctionEnd*,
            NodeDiscard*,
            NodeStatementDecorator*,
            NodeStatementFrame*,
            NodeIfElseIfElse*
        > value;
    };

    struct NodeProgram {
        std::vector<NodeStatement*> stmts;
        std::string programName;
        std::string programFilePath;
    };

}