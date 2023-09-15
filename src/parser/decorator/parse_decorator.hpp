#pragma once

#include "../parent_parser.hpp"
#include "parse_component_decorator.hpp"
#include "parse_capsule_decorator.hpp"

class ParseDecorator {
public:
    ParseDecorator() {}

    std::optional<NodeStatementDecorator*> parseNode(ParentParser* parent) {
        auto decorator = parent->m_allocator.alloc<NodeStatementDecorator>();

        parent->try_consume(TokenType::hash);
        auto decoratorType = parent->try_consume(TokenType::ident);

        if (decoratorType.value().value == "Component") {
            ParseComponentDecorator componentDecoratorParser;
            if (auto component = componentDecoratorParser.parseNode(parent)) {
                decorator->decorator = component.value();
            }
            return decorator;
        }

        else if (decoratorType.value().value == "Prop") {
            parent->try_consume(TokenType::open_brace, "Missing Brace after Prop Decorator");
            parent->try_consume(TokenType::close_brace, "Missing Close Brace for Prop Decorator");
            auto propDecorator = parent->m_allocator.alloc<NodePropDecorator>();
            decorator->decorator = propDecorator;
            return decorator;
        }

        else if (decoratorType.value().value == "Emitter") {
            parent->try_consume(TokenType::open_brace, "Missing Brace after Emitter Decorator");
            parent->try_consume(TokenType::close_brace, "Missing Close Brace for Emitter Decorator");
            auto emitterDecorator = parent->m_allocator.alloc<NodeEmitDecorator>();
            decorator->decorator = emitterDecorator;
            return decorator;
        }

        else if (decoratorType.value().value == "Injectable") {
            parent->try_consume(TokenType::open_brace, "Missing Brace after Injectable Decorator");
            parent->try_consume(TokenType::close_brace, "Missing Close Brace for Injectable Decorator");
            auto injectableDecorator = parent->m_allocator.alloc<NodeInjectableDecorator>();
            decorator->decorator = injectableDecorator;
            return decorator;
        }

        else if (decoratorType.value().value == "Capsule") {
            ParseCapsuleDecorator capsuleDecoratorParser;
            if (auto capsule = capsuleDecoratorParser.parseNode(parent)) {
                decorator->decorator = capsule.value();
            }
            return decorator;
        }

        else {
            std::cerr << "Unsupported Decorator" << std::endl;
            exit(EXIT_FAILURE);
        }

        return {};
    }
};