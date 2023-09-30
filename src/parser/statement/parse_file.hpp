#pragma once

#include <iomanip>

#include "../parent_parser.hpp"
#include "parse_statement.hpp"

std::optional<NodeStatementTake*> ParseFile::parseNode(ParentParser* parent, std::string name, std::string filePath, std::vector<Token> tokens) {
    // storing temp variables for resetting later.
    std::vector<Token> tempCurrentTokens = parent->m_tokens;
    std::map<std::string, std::string> current_renames = parent->m_import_renames;
    std::string tempCurrentProgram = parent->m_current_program;
    int tempCurrentIndex = parent->m_index;

    // reseting the variables on the parent to the new program values.
    parent->m_import_renames.clear();
    parent->m_index = 0;
    parent->m_tokens = tokens;
    parent->m_current_program = name;

    // init a new NodeStatementTake struct
    auto prog = parent->m_allocator.alloc<NodeStatementTake>();
    prog->programName = name;
    prog->programFilePath = parent->m_file_reader.get_base_filepath(filePath);

    // extract all statements out of file
    while (parent->peek().has_value()) {
        auto statement = std::make_unique<ParseStatement>();
        if (auto stmt = statement.get()->parseNode(parent)) {
            if (auto discard = std::holds_alternative<NodeDiscard*>(stmt.value()->value)) {
                continue;
            }
            prog->stmts.push_back(stmt.value());
        }
        else {
            std::cerr << "Invalid statement on line: " << parent->peek().value().lineNumber + 1 << std::endl;
            std::cerr << "Invalid " << token_names.at(as_integer(parent->peek().value().type)) << std::endl;
            exit(EXIT_FAILURE);
        }
    }

    // reset the parent tokens and everything back to the other file
    parent->m_import_renames.clear();
    parent->m_import_renames = current_renames;
    parent->m_tokens = tempCurrentTokens;
    parent->m_index = tempCurrentIndex;
    parent->m_current_program = tempCurrentProgram;
    
    return prog;
}