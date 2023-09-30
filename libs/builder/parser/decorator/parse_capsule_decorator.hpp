#pragma once

#include "../parent_parser.hpp"

namespace Frame {
    class ParseCapsuleDecorator {
    public:
        ParseCapsuleDecorator() {}

        std::optional<NodeModuleDecorator*> parseNode(ParentParser* parent) {
            auto module = parent->m_allocator.alloc<NodeModuleDecorator>();
            
            ParseObject objectParser;

            if (auto obj = objectParser.parseNode(parent)) {
                for (NodeObjectLitProp* prop : obj.value()->keys) {
                    if (prop->key.value.value() == "Injectable") {
                        module->injectables = prop;
                    } else if (prop->key.value.value() == "Component") {
                        module->components = prop;
                    } else if (prop->key.value.value() == "Capsule") {
                        module->capsules = prop;
                    } else if (prop->key.value.value() == "Export") {
                        module->exports = prop;
                    } else {
                        std::cerr << "Invalid Prop in Capsule Decorator" << std::endl;
                        exit(EXIT_FAILURE);
                    }
                }
            }

            return module;
        }
    };
}