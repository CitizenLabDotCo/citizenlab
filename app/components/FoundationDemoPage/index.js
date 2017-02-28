/**
*
* FoundationDemoPage
*
*/

import React from 'react';
import styled from 'styled-components';
import {
  Link,
  Button,
  Colors,
  Sizes,
} from '../Foundation';

const ExampleDiv = styled.div`
  margin-bottom: 20px;
  padding: 20px;
  border: 1px solid #999;
`;

class FoundationDemoPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <div className="cl-foundation-demo-page">
        <h2>Foundation Demo Page</h2>
        <hr />

        <div className="row">
          <ExampleDiv>
            <Link>Learn More</Link>
            <Link>View All Features</Link>
            <Button color={Colors.SUCCESS}>Save</Button>
            <Button color={Colors.ALERT}>Delete</Button>
          </ExampleDiv>

          <ExampleDiv>
            <Link size={Sizes.TINY}>So Tiny</Link>
            <Link size={Sizes.SMALL}>So Small</Link>
            <Link>So Basic</Link>
            <Link size={Sizes.LARGE}>So Large</Link>
            <Link isExpanded>Such Expand</Link>
            <Link size={Sizes.TINY} isExpanded>Wow, Small Expand</Link>
          </ExampleDiv>

          <ExampleDiv>
            <Link color={Colors.PRIMARY}>Primary Color</Link>
            <Link color={Colors.SECONDARY}>Secondary Color</Link>
            <Link color={Colors.SUCCESS}>Success Color</Link>
            <Link color={Colors.ALERT}>Alert Color</Link>
            <Link color={Colors.WARNING}>Warning Color</Link>
            <Link isDisabled>Disabled Button</Link>
          </ExampleDiv>
        </div>
      </div>
    );
  }
}

export default FoundationDemoPage;
