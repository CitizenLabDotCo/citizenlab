import React, { FC } from 'react';

export interface IBleh {
   text: string;
}

const Bleh: FC<IBleh> = ({ text }) => <h1>{text}</h1>;

export default Bleh;
