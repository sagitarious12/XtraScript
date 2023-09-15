Void main => () {
    Xtra.initWebApp(SomeComponentCapsule);
};

#Component{
    styles="./styles.css",
    markup="./index.html",
    marker="SomeComponent"
}
frame SomeComponent {
    #Prop{} Int someValue;
    //#Emitter{Int} someEmitter;
    Int displayValue;
    //Array{Int} values = [];

    SomeComponent(
        SomeComponentService service
    ) {
        displayValue = service.getDisplayValue();
    };

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
    };
};

#Injectable{}
frame SomeComponentService {
    Int getDisplayValue => () {
        return 10;
    };
};

#Capsule{
    Injectable = [
        SomeComponentService
    ],
    Component = [
        SomeComponent
    ],
    Capsule = [],
    Export = [
        SomeComponentService,
        SomeComponent
    ]
}
frame SomeComponentCapsule {};