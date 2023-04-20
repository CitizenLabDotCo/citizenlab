export const ideaImagesData = [
  {
    id: '30c1b604-71fd-4ac4-9cd7-3e5601d9cb0f',
    type: 'image',
    attributes: {
      ordering: null,
      created_at: '2023-02-28T05:56:37.762Z',
      updated_at: '2023-02-28T05:56:37.762Z',
      versions: {
        small: 'http://localhost:4000/uploads/small.png',
        medium: 'http://localhost:4000/uploads/medium.png',
        large: 'http://localhost:4000/uploads/large.png',
        fb: 'http://localhost:4000/uploads/fb.png',
      },
    },
  },
  {
    id: '3y81b604-71fd-4ac4-9cd7-3e5601d989hj',
    type: 'image',
    attributes: {
      ordering: null,
      created_at: '2021-02-28T05:56:37.762Z',
      updated_at: '2020-02-28T05:56:37.762Z',
      versions: {
        small: 'http://localhost:4000/uploads/small.png',
        medium: 'http://localhost:4000/uploads/medium.png',
        large: 'http://localhost:4000/uploads/large.png',
        fb: 'http://localhost:4000/uploads/fb.png',
      },
    },
  },
];

export default jest.fn(() => {
  return { data: { data: ideaImagesData } };
});
