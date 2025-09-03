import { rangesValid } from './rangesValid';

describe('rangesValid', () => {
  describe('no selectedRange and no disabledRanges', () => {
    it('is valid', () => {
      expect(rangesValid({}, [])).toEqual({ valid: true });
    });
  });

  describe('selectedRange but no disabledRanges', () => {
    it('is valid when from is defined and to is undefined', () => {
      expect(rangesValid({ from: new Date() }, [])).toEqual({ valid: true });
    });

    it('is valid to have from and to be the same value', () => {
      const date = new Date();
      expect(rangesValid({ from: date, to: date }, [])).toEqual({
        valid: true,
      });
    });

    it('is invalid when only to is defined', () => {
      expect(rangesValid({ to: new Date() }, [])).toEqual({
        valid: false,
        reason:
          'selectedRange.from cannot be undefined if selectedRange.to is defined',
      });
    });
  });

  describe('no selectedRange but disabledRanges', () => {
    it('is valid', () => {
      expect(
        rangesValid({}, [
          { from: new Date(2024, 1, 1), to: new Date(2024, 2, 1) },
          { from: new Date(2024, 2, 2), to: new Date(2024, 3, 1) },
        ])
      ).toEqual({ valid: true });
    });

    // TODO: also unskip this test once a proper solution has been found
    // to this annoying bug in date-fns
    it.skip('is invalid if disabledRanges overlap', () => {
      expect(
        rangesValid({}, [
          { from: new Date(2024, 1, 1), to: new Date(2024, 2, 1) },
          { from: new Date(2024, 2, 1), to: new Date(2024, 3, 1) },
        ])
      ).toEqual({
        valid: false,
        reason: 'disabledRanges invalid',
      });
    });

    it('is possible to have one-day disabled ranges', () => {
      expect(
        rangesValid({}, [
          { from: new Date(2024, 1, 1), to: new Date(2024, 1, 1) },
        ])
      ).toEqual({ valid: true });
    });

    it('should be valid 1', () => {
      const disabledRanges = [
        {
          from: new Date(2024, 2, 1),
          to: new Date(2024, 2, 1),
        },
        {
          from: new Date(2024, 2, 2),
          to: new Date(2024, 2, 20),
        },
      ];

      expect(rangesValid({}, disabledRanges)).toEqual({ valid: true });
    });

    it('should be valid 2', () => {
      const disabledRanges = [
        {
          from: new Date(2024, 2, 1),
          to: new Date(2024, 2, 1),
        },
        {
          from: new Date(2024, 2, 2),
        },
      ];

      expect(rangesValid({}, disabledRanges)).toEqual({ valid: true });
    });
  });

  describe('selectedRange and disabledRanges', () => {
    describe('closed disabled ranges', () => {
      it('is valid when open selectedRange is between disabledRanges', () => {
        expect(
          rangesValid({ from: new Date(2024, 2, 1) }, [
            { from: new Date(2024, 1, 1), to: new Date(2024, 1, 25) },
            { from: new Date(2024, 2, 6), to: new Date(2024, 2, 10) },
          ])
        ).toEqual({ valid: true });
      });

      it('is valid when closed selectedRange is within disabledRanges', () => {
        expect(
          rangesValid(
            { from: new Date(2024, 2, 1), to: new Date(2024, 2, 5) },
            [
              { from: new Date(2024, 1, 1), to: new Date(2024, 1, 25) },
              { from: new Date(2024, 2, 6), to: new Date(2024, 2, 10) },
            ]
          )
        ).toEqual({ valid: true });
      });

      it('is valid when open selectedRange is after disabledRanges', () => {
        expect(
          rangesValid({ from: new Date(2024, 3, 1) }, [
            { from: new Date(2024, 1, 1), to: new Date(2024, 1, 25) },
            { from: new Date(2024, 2, 6), to: new Date(2024, 2, 10) },
          ])
        ).toEqual({ valid: true });
      });

      it('is valid when closed selectedRange is after disabledRanges', () => {
        expect(
          rangesValid(
            { from: new Date(2024, 3, 1), to: new Date(2024, 3, 5) },
            [
              { from: new Date(2024, 1, 1), to: new Date(2024, 1, 25) },
              { from: new Date(2024, 2, 6), to: new Date(2024, 2, 10) },
            ]
          )
        ).toEqual({ valid: true });
      });

      it('is invalid when closed selectedRange overlaps with disabledRanges', () => {
        expect(
          rangesValid(
            { from: new Date(2024, 1, 28), to: new Date(2024, 3, 5) },
            [
              { from: new Date(2024, 1, 1), to: new Date(2024, 1, 25) },
              { from: new Date(2024, 2, 6), to: new Date(2024, 2, 10) },
            ]
          )
        ).toEqual({
          valid: false,
          reason: 'selectedRange and disabledRanges invalid together',
        });
      });

      it('is valid (bug)', () => {
        const selectedRange = {
          from: new Date('2024-10-28'),
          to: new Date('2024-12-13'),
        };

        const disabledRanges = [
          {
            from: new Date('2024-08-19'),
            to: new Date('2024-10-13'),
          },
          {
            from: new Date('2024-10-15'),
            to: new Date('2024-10-27'),
          },
          {
            from: new Date('2024-12-14'),
            to: new Date('2024-12-16'),
          },
          {
            from: new Date('2024-12-17'),
            to: new Date('2024-12-19'),
          },
        ];

        expect(rangesValid(selectedRange, disabledRanges)).toEqual({
          valid: true,
        });
      });
    });

    describe('open disabled range', () => {
      it('is invalid when selectedRange.to is undefined and is last', () => {
        expect(
          rangesValid({ from: new Date(2024, 2, 1) }, [
            { from: new Date(2024, 1, 1) },
          ])
        ).toEqual({
          valid: false,
          reason:
            'selectedRange cannot be last if disabledRanges ends with an open range',
        });
      });

      it('is valid when selectedRange.to is undefined and is not last', () => {
        expect(
          rangesValid({ from: new Date(2024, 2, 1) }, [
            { from: new Date(2024, 1, 1), to: new Date(2024, 1, 25) },
            { from: new Date(2024, 3, 1) },
          ])
        ).toEqual({ valid: true });
      });

      it('is valid when selectedRange.to is defined and is not last', () => {
        expect(
          rangesValid(
            { from: new Date(2024, 2, 1), to: new Date(2024, 2, 5) },
            [{ from: new Date(2024, 3, 1) }]
          )
        ).toEqual({ valid: true });
      });

      it('is invalid when selectedRange.to is defined and is last', () => {
        expect(
          rangesValid(
            { from: new Date(2024, 3, 1), to: new Date(2024, 3, 5) },
            [{ from: new Date(2024, 2, 1) }]
          )
        ).toEqual({
          valid: false,
          reason:
            'selectedRange cannot be last if disabledRanges ends with an open range',
        });
      });
    });
  });
});
