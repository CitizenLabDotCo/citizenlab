import React from 'react';

const SubmitBtn = ({name, help, style}) => {
    return (
        <div className="submit-btn" style={style}>
            <input type="submit" value={name ? name : 'Submit'}/>
            {help ? <span>press <strong>Enter ↵</strong></span> : ''}
        </div>
    )
}

export default SubmitBtn;