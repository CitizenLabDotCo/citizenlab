export default function (backgroundColor = 'transparent', activeColor = 'transparent') {
  return `
    background: ${backgroundColor};
    border-radius: 5px;
    cursor: pointer;
    align-items: center;
    justify-content: center;
    display: flex;
    padding: .75rem 1rem;

    svg {
      flex: 0 0 1rem;
      margin-right: 1rem;
    }

    span {
      display: block;
      flex: 0 0 auto;
    }

    &:hover,
    &:focus {
      background: ${activeColor};
    }
  `;
}
