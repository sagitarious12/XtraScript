#pragma once

#include "../parent_parser.hpp"
#include "parse_file.hpp"

namespace Frame {
    class ParseTake {
    public:
        ParseTake(){}

        std::variant<
            std::optional<NodeStatementTake*>,
            std::optional<NodeDiscard*>
        > parseNode(ParentParser* parent) {

            parent->try_consume(TokenType::take, "Invalid take statement. Expected 'take'");
            Token filepath = parent->try_consume(TokenType::string_lit, "Invalid file path in take statement");
            parent->try_consume(TokenType::as, "invalid take statement. Expected 'as'");
            Token fileIdentity = parent->try_consume(TokenType::ident, "invalid take statement. Missing take file identity.");
            parent->try_consume(TokenType::semi, "Missing Semi Colon in take statement");
            std::string fullFilePath = parent->m_file_reader.get_base_filepath(filepath.value.value());

            auto programIt = parent->m_programs.find(fullFilePath);
            if (programIt == parent->m_programs.end()) {
                parent->m_programs.insert({ fullFilePath, fileIdentity.value.value() });

                    std::string contents = parent->m_file_reader.read_file(filepath.value.value().c_str());

                    if (contents == "") {
                        std::cerr << "Could Not Find The File " << fullFilePath << std::endl;
                        exit(EXIT_FAILURE);
                    }

                    Tokenizer tokenizer(std::move(contents));
                    std::vector<Token> tokens = tokenizer.tokenize();

                    // replace this
                    ParseFile fileParser;
                    std::optional<NodeStatementTake*> program = fileParser.parseNode(parent, fileIdentity.value.value(), filepath.value.value(), tokens);

                    if (!program.has_value()) {
                        std::cerr << "Invalid program at " << filepath.value.value() << std::endl;
                        exit(EXIT_FAILURE);
                    }
                    
                    return program;
            }

            else {
                parent->m_import_renames.insert({ fileIdentity.value.value(), parent->m_programs[fullFilePath] });
                auto discard = parent->m_allocator.alloc<NodeDiscard>();
                return discard;
            }
        }
    };
}