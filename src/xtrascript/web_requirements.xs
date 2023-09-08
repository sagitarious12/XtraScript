
// main entry point
Void main => () {
    // Xtra builtin to create a new web app
    Xtra.initWebApp(SomeComponentCapsule);
}

// decorator to create a new component
#Component{
    // define what the styles are
    styles: "./styles.scss",
    // define the html file
    markup: "./web.html",
    // define the html selector
    marker: "some-component"
}
// create a new "class" or frame
frame SomeComponent {
    Int displayValue;
    Array<Int> values = [];

    // a constructor
    SomeComponent(
        // an injected service
        SomeComponentService service
    ) {
        displayValue = service.getDisplayValue();
    }

    Bool shouldDisplayValue => () {
        if (this.displayValue > 10) {
            return false;
        } 
        else if (this.displayValue < 10) {
            return false;
        }
        else {
            return true;
        }
    }
}

// decorator for an injectable frame
#Injectable
frame SomeComponentService {
    Int getDisplayValue => () {
        return 10;
    }
}

// decorator for a modular frame
// this will define the various components and injectables for a capsule
#Capsule{
    Injectable: [
        SomeComponentService
    ],
    Component: [
        SomeComponent
    ],
    Capsule: []
}
frame SomeComponentCapsule {}