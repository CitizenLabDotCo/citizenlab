

const Step = (props: any) => {
    const {step, currentStep, children} = props;

    if (currentStep !== step) {
        return null;
    }

    return children;
}

export default Step;
