#pragma once

#include "../parent_parser.hpp"
#include "../html/html_program.hpp"
#include "../../tokenize/html_tokenization.hpp"
#include "../object/parse_object.hpp"

class ParseComponentDecorator {
public:
    ParseComponentDecorator() {}

    std::optional<NodeComponentDecorator*> parseNode(ParentParser* parent) {
        auto component = parent->m_allocator.alloc<NodeComponentDecorator>();

        ParseObject objectParser;
        if (auto componentDecoratorObject = objectParser.parseNode(parent)) {
            
            bool foundStyles = false;

            for (NodeObjectLitProp* prop : componentDecoratorObject.value()->keys) {
                if (prop->key.value.value() == "styles") {
                    if (std::holds_alternative<NodeTermStringLit*>(prop->value->value)) {
                        auto stringLit = std::get<NodeTermStringLit*>(prop->value->value);
                        if (parent->m_file_reader.file_exists(stringLit->string_lit.value.value())) {
                            std::string styles = parent->m_file_reader.read_file(stringLit->string_lit.value.value().c_str());
                            component->styleContent = styles;
                            foundStyles = true;
                        } else {
                            std::cerr << "Styles File Does Not Exist" << std::endl;
                            exit(EXIT_FAILURE);
                        }
                    } else {
                        std::cerr << "Invalid Value For key 'styles'. Expected a string literal" << std::endl;
                        exit(EXIT_FAILURE);
                    }
                }
            }

            if (!foundStyles) {
                std::cerr << "Missing prop 'styles' on the component decorator" << std::endl;
                exit(EXIT_FAILURE);
            }

            for (NodeObjectLitProp* prop: componentDecoratorObject.value()->keys) {
                if (prop->key.value.value() == "markup") {
                    if (std::holds_alternative<NodeTermStringLit*>(prop->value->value)) {
                        auto stringLit = std::get<NodeTermStringLit*>(prop->value->value);
                        std::string html = parent->m_file_reader.read_file(stringLit->string_lit.value.value().c_str());

                        HTMLTokenizer htmlTokenizer(html);
                        std::vector<HTMLToken> tokens = htmlTokenizer.tokenize();

                        std::string componentName;
                        if (hasComponentName(parent)) {
                            componentName = parent->peek(1).value().value.value();
                        } else {
                            std::cerr << "No 'frame' defined after the component decorator" << std::endl;
                            exit(EXIT_FAILURE);
                        }

                        HTMLParserParent htmlParseParent(std::move(tokens), componentName, component->styleContent);
                        HTMLParseProgram htmlParseProgram;

                        if (auto htmlProgram = htmlParseProgram.parseNode(parent, &htmlParseParent)) {
                            component->htmlMarkup = htmlProgram.value();
                        } else {
                            std::cerr << "Failed To Parse HTML Program" << std::endl;
                        }

                    } else {
                        std::cerr << "Invalid Value For key 'markup'. Expected a string literal" << std::endl;
                        exit(EXIT_FAILURE);
                    }
                }

                else if (prop->key.value.value() == "marker") {
                    if (std::holds_alternative<NodeTermStringLit*>(prop->value->value)) {
                        auto stringLit = std::get<NodeTermStringLit*>(prop->value->value);
                        component->htmlMarker = stringLit->string_lit.value.value();
                    } else {
                        std::cerr << "Invalid Value For key 'marker'. Expected a string literal" << std::endl;
                        exit(EXIT_FAILURE);
                    }
                }

            }
        }

        return component;
    }

private:

    bool hasComponentName(ParentParser* parent) {
        return parent->peek().has_value() &&
            parent->peek().value().type == TokenType::frame &&
            parent->peek(1).has_value() &&
            parent->peek(1).value().type == TokenType::ident;
    }
};