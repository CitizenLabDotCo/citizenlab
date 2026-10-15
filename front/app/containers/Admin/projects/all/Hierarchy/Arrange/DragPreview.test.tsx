import { copyOf } from './DragPreview';

describe('copyOf', () => {
  it("copies an item without the dragged item's fade", () => {
    const card = document.createElement('div');
    card.className = 'card dragging';
    card.textContent = 'Night bus network';

    const copy = copyOf(card);

    expect(copy).toBeInstanceOf(HTMLDivElement);
    expect(copy instanceof HTMLElement && copy.className).toBe('card');
    expect(copy.textContent).toBe('Night bus network');
    expect(card.className).toBe('card dragging');
  });

  it('puts a row in a table, with its cells as wide as they were', () => {
    const table = document.createElement('table');
    const row = table.insertRow();
    const widths = [240, 120];
    widths.forEach((width) => {
      const cell = row.insertCell();
      Object.defineProperty(cell, 'offsetWidth', { value: width });
    });
    Object.defineProperty(row, 'offsetWidth', { value: 360 });

    const copy = copyOf(row);

    expect(copy).toBeInstanceOf(HTMLTableElement);
    if (!(copy instanceof HTMLTableElement)) return;
    expect(copy.style.width).toBe('360px');
    expect(copy.style.tableLayout).toBe('fixed');
    expect([...copy.rows[0].cells].map((cell) => cell.style.width)).toEqual([
      '240px',
      '120px',
    ]);
  });
});
