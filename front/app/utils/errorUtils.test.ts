import { isCLErrorJSON } from 'utils/errorUtils';

const CLErrors = [
  {
    json: {
      errors: {
        body_multiloc: [{ error: 'blank' }, { error: 'blank' }],
      },
    },
  },
  {
    json: {
      errors: {
        survey_embed_url: [
          { error: 'blank' },
          { error: 'invalid', value: null },
        ],
      },
    },
  },
];

const otherErrors = [
  {
    status: 500,
    error: 'Internal Server Error',
    exception:
      '#\u003cSocketError: Failed to open TCP connection to cl2-nlp:8000 (getaddrinfo: Name or service not known)\u003e',
    traces: {
      'Application Trace': [],
      'Framework Trace': [
        {
          id: 0,
          trace:
            "/usr/local/lib/ruby/2.5.0/net/http.rb:939:in `rescue in block in connect'",
        },
        {
          id: 138,
          trace:
            'puma(3.12.0) lib / puma / thread_pool.rb:133: in `block in spawn_thread',
        },
      ],
    },
  },
];

describe('isCLErrorJSON', () => {
  test.each(CLErrors)('returns true when passed in CLErrors', (val: any) => {
    expect(isCLErrorJSON(val)).toBe(true);
  });
  test.each(otherErrors)(
    'returns false when passed in some other errors',
    (val: any) => {
      expect(isCLErrorJSON(val)).toBe(false);
    }
  );
});
