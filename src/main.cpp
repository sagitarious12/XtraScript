#if FR_RUN_TESTING == 1
#include "testing/test_mounting.hpp"
#else
#include "harnesses/harness_commands.hpp"
#endif


int main(int argc, char* argv[])
{   
#if FR_RUN_TESTING == 1
    Frame::TestMounter testing;
    bool testResult = testing.mount();
    if (testResult) {
        return EXIT_SUCCESS;
    } else {
        return EXIT_FAILURE;
    }
#else
    CommandHarness harness(argc, argv);
    return EXIT_SUCCESS;
#endif
}