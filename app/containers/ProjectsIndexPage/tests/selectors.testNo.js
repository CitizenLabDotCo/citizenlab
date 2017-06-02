// import { fromJS } from 'immutable';
// import { generateResourcesProjectValue } from 'utils/testing/mocks';

// import { makeSelectProjects } from '../selectors';

// describe('ProjectsIndexPage selectors', () => {
//   describe('makeSelectProjects', () => {
//     it('it should return available projects', () => {
//       const selector = makeSelectProjects();
//       const generator = generateResourcesProjectValue;

//       const state = {
//         // page name nested for proper conversion by fromJS
//         projectsIndexPage: {
//           projects: [],
//         },
//         resources: {
//           projects: {},
//         },
//       };

//       let i = 0;
//       while (i < 10) {
//         state.projectsIndexPage.projects.push(i.toString());
//         state.resources[i.toString()] = generator(i.toString()).data;

//         i += 1;
//       }

//       const resourcesImm = fromJS(state.resources);
//       const expectedResult = fromJS(state.projectsIndexPage.projects).map((id) => resourcesImm.get('projects').get(id));

//       expect(selector(fromJS(state))).toEqual(expectedResult);
//     });
//   });
// });

describe('ProjectsIndexPage actions', () => {
  it('should have meaningful tests in the future', () => {
    expect(true).toEqual(true);
  });
});
