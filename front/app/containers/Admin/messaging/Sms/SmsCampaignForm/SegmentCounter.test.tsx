import React from 'react';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import { MAX_SMS_SEGMENTS } from '../utils/segments';

import SegmentCounter from './SegmentCounter';

const EMOJI = '\u{1F600}';

const readout = () => screen.getByTestId('sms-segment-readout').textContent;
const pill = () => screen.getByTestId('sms-segment-pill').textContent;
const encodingWarning = () =>
  screen.queryByTestId('sms-segment-encoding-warning');

describe('SegmentCounter', () => {
  describe('the readout', () => {
    it('starts at zero of a single segment', () => {
      render(<SegmentCounter body="" />);
      expect(readout()).toBe('0 / 160');
    });

    it('fills a single segment at 160 characters', () => {
      render(<SegmentCounter body={'a'.repeat(160)} />);
      expect(readout()).toBe('160 / 160');
    });

    // The ceiling moves: a second segment reserves a header, so each holds 153, not 160.
    it('raises the ceiling to two concatenated segments at 161 characters', () => {
      render(<SegmentCounter body={'a'.repeat(161)} />);
      expect(readout()).toBe('161 / 306');
    });

    it('drops the ceiling to 70 as soon as the message turns Unicode', () => {
      render(<SegmentCounter body={`Hello ${EMOJI}`} />);
      expect(readout()).toBe('8 / 70');
    });

    // An emoji is one character but two code units. Counting characters would report
    // this completely full segment as half empty.
    it('counts code units, not characters, under Unicode', () => {
      render(<SegmentCounter body={EMOJI.repeat(35)} />);
      expect(readout()).toBe('70 / 70');
    });

    it('counts a GSM-7 extension character as the two it costs', () => {
      render(<SegmentCounter body="€" />);
      expect(readout()).toBe('2 / 160');
    });
  });

  describe('the cost pill', () => {
    it('reports one SMS for a short message', () => {
      render(<SegmentCounter body="Hello" />);
      expect(pill()).toBe('1 SMS');
    });

    it('reports two SMS once the message spills over', () => {
      render(<SegmentCounter body={'a'.repeat(161)} />);
      expect(pill()).toBe('2 SMS');
    });

    it('explains the cost on hover', async () => {
      render(<SegmentCounter body={'a'.repeat(161)} />);

      await userEvent.hover(screen.getByTestId('sms-segment-pill'));

      expect(
        await screen.findByText(/Sent as 2 messages to every recipient/)
      ).toBeInTheDocument();
    });

    it('explains that an over-long message cannot be sent', async () => {
      render(<SegmentCounter body={'a'.repeat(153 * MAX_SMS_SEGMENTS + 1)} />);

      expect(pill()).toBe(`${MAX_SMS_SEGMENTS + 1} SMS`);

      await userEvent.hover(screen.getByTestId('sms-segment-pill'));

      expect(await screen.findByText(/cannot be sent/)).toBeInTheDocument();
    });
  });

  // The icon is strictly about encoding. A long message is long, not wrong.
  describe('the encoding warning', () => {
    it('is absent for a message that is only long', () => {
      render(<SegmentCounter body={'a'.repeat(153 * 4)} />);

      expect(pill()).toBe('4 SMS');
      expect(encodingWarning()).not.toBeInTheDocument();
    });

    it('appears for a one-segment message containing a non-GSM character', () => {
      render(<SegmentCounter body={`Hello ${EMOJI}`} />);

      expect(pill()).toBe('1 SMS');
      expect(encodingWarning()).toBeInTheDocument();
    });

    it('appears for a curly quote pasted from a word processor', () => {
      render(<SegmentCounter body={'Your idea’s moved on.'} />);

      expect(encodingWarning()).toBeInTheDocument();
    });

    // Accented Latin, the euro sign and braces are all in GSM-7. An em dash is not,
    // which is why it is deliberately absent from this string.
    it('does not appear for the GSM-7 characters an admin is likely to type', () => {
      render(<SegmentCounter body="Café à Genève, €5 {ok}" />);

      expect(encodingWarning()).not.toBeInTheDocument();
    });

    it('appears for an em dash, which looks innocuous but is not GSM-7', () => {
      render(<SegmentCounter body="Vote now — before Friday" />);

      expect(encodingWarning()).toBeInTheDocument();
    });
  });
});
