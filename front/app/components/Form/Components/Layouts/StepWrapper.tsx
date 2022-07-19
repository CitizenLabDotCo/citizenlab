import React from 'react';

const StepWrapper = (props) => {
    const { currentStep} = props;

    return React.Children.map(props.children, (child, index) => {
        return React.cloneElement(child, {step: index + 1, currentStep});
    })
}

export default StepWrapper;