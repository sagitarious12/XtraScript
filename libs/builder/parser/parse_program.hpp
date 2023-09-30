#pragma once

#include <iomanip>

#include "parent_parser.hpp"
#include "statement/parse_statement.hpp"
#include "statement/parse_file.hpp"

namespace Frame {
    class ParseProgram {
    public:
        explicit ParseProgram(){}

        std::optional<NodeProgram> parse_program(std::string name, std::string filePath, ParentParser* parent) {
            
            NodeProgram program;
            parent->m_current_program = name;
            program.programName = name;
            program.programFilePath = parent->m_file_reader.get_base_filepath(filePath);

            while (parent->peek().has_value()) {
                auto statement = std::make_unique<ParseStatement>();
                if (auto stmt = statement.get()->parseNode(parent)) {
                    if (auto discard = std::holds_alternative<NodeDiscard*>(stmt.value()->value)) {
                        continue;
                    }
                    program.stmts.push_back(stmt.value());
                }
                else {
                    std::cerr << "Invalid statement found on line: " << parent->peek().value().lineNumber + 1 << std::endl;
                    std::cerr << "Invalid " << token_names.at(as_integer(parent->peek().value().type)) << std::endl;
                    exit(EXIT_FAILURE);
                }
            }

            NodeProgram finalProgram = removeTakeStatements(program, parent);

            return finalProgram;
        }  

        NodeProgram removeTakeStatements(NodeProgram prog, ParentParser* parent) {
            std::vector<NodeStatementTake*> takes;

            for (int i = 0; i < prog.stmts.size(); i++) {
                auto statement = prog.stmts.at(i);
                if (std::holds_alternative<NodeStatementTake*>(statement->value)) {
                    if (auto node_take = std::get<NodeStatementTake*>(statement->value)) {
                        std::vector<NodeStatementTake*> embeddedTakes = removeTakeStatements(node_take);
                        takes.push_back(node_take);
                        for(NodeStatementTake* take : embeddedTakes) {
                            takes.push_back(take);
                        }
                        prog.stmts.erase(prog.stmts.begin() + i);
                        i--;
                    }
                }
            }

            NodeProgram program;

            for (NodeStatementTake* take : takes) {
                auto statement = parent->m_allocator.alloc<NodeStatement>();
                statement->value = take;
                program.stmts.push_back(statement);
            }

            for (NodeStatement* statement : prog.stmts) {
                program.stmts.push_back(statement);
            } 

            program.programName = prog.programName;
            program.programFilePath = prog.programFilePath;

            return program;
        }

        std::vector<NodeStatementTake*> removeTakeStatements(NodeStatementTake* take) {
            std::vector<NodeStatementTake*> takes;
            for (int i = 0; i < take->stmts.size(); i++) {
                if (std::holds_alternative<NodeStatementTake*>(take->stmts.at(i)->value)) {
                    if (auto node_take = std::get<NodeStatementTake*>(take->stmts.at(i)->value)) {
                        auto embeddedTakes = removeTakeStatements(node_take);
                        takes.push_back(node_take);
                        for (NodeStatementTake* take : embeddedTakes) {
                            takes.push_back(take);
                        }
                        take->stmts.erase(take->stmts.begin() + i);
                        i--;
                    }
                }
            }
            return takes;
        }
    };
}

