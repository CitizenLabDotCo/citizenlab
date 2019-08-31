// import React, { memo } from 'react';
// import { Provider, createClient, useQuery  } from 'urql';

// // style
// import styled from 'styled-components';

// const Loading = styled.div``;

// const List = styled.div``;

// const client = createClient({
//   url: 'http://localhost:5001/admin_templates_api/graphql'
// });

// interface Props { }

// const CommentsSection = memo<Props>((props) => {
//   const [{ fetching, data }] = useQuery({
//     query: `{
//       todos {
//         id
//       }
//     }`,
//   });

//   return (
//     <Provider value={client}>
//       {fetching ? <Loading /> : <List />}
//     </Provider>
//   );
// });

// export default CommentsSection;
