const config = {
  defaults: {
    timeout: 60000,
    wait: 10000,
    chromeLaunchConfig: {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      // headless: false,
    },
    headers: {
      Accept: 'text/html'
    }
  },
  standard: 'WCAG2A',
  urls: process.env.NODE_ENV === 'staging' ? [
    // Every page that has the IdeaCards component
    // will complain a missing submit button for the search field
    // So we ignore this specific rule for such pages
    {
      url: 'https://pa11y.stg.citizenlab.co/en-GB/',
      ignore: [
        'WCAG2AA.Principle3.Guideline3_2.3_2_2.H32.2'
      ]
    }, {
      url: 'https://pa11y.stg.citizenlab.co/en-GB/ideas',
      ignore: [
        'WCAG2AA.Principle3.Guideline3_2.3_2_2.H32.2'
      ]
    }, {
      url: 'https://pa11y.stg.citizenlab.co/en-GB/projects/rup-inspraak-vanaf-startnota-tot-openbaar-onderzoek/process',
      ignore: [
        'WCAG2AA.Principle3.Guideline3_2.3_2_2.H32.2'
      ],
      // Allow for two disabled 'Start an idea' buttons (with a too light background color) to pass the test
      threshold: 2
    }, {
      url: 'https://pa11y.stg.citizenlab.co/en-GB/projects/rup-inspraak-vanaf-startnota-tot-openbaar-onderzoek/info',
      ignore: [
        'WCAG2AA.Principle3.Guideline3_2.3_2_2.H32.2'
      ],
      // Allow Twitter share button with a too low contrast ratio
      threshold: 1
    }, {
      url: 'https://pa11y.stg.citizenlab.co/en-GB/profile/sylvester-kalinoski',
      ignore: [
        'WCAG2AA.Principle3.Guideline3_2.3_2_2.H32.2'
      ]
    }, {
      url: 'https://pa11y.stg.citizenlab.co/en-GB/projects/an-idea-bring-it-to-your-council/ideas/new',
       threshold: 9,
    }, {
      url: 'https://pa11y.stg.citizenlab.co/en-GB/ideas/new',
    }, {
      url: 'https://pa11y.stg.citizenlab.co/en-GB/ideas/quisquam-omnis-non-quas',
      // Hide Twitter sharing button as the Twitter colors have a too low contrast ratio
      hideElements: '.twitter',
    },
    'https://pa11y.stg.citizenlab.co/en-GB/projects',
    'https://pa11y.stg.citizenlab.co/en-GB/projects/renewing-westbrook-parc/events',
    'https://pa11y.stg.citizenlab.co/en-GB/sign-in',
    'https://pa11y.stg.citizenlab.co/en-GB/sign-up',
    'https://pa11y.stg.citizenlab.co/en-GB/pages/information'
  ] : [
    {
      url: 'http://localhost:3000/en-GB',
      ignore: [
        'WCAG2AA.Principle3.Guideline3_2.3_2_2.H32.2'
      ]
    }, {
      url: 'http://localhost:3000/en-GB/ideas',
      ignore: [
        'WCAG2AA.Principle3.Guideline3_2.3_2_2.H32.2'
      ]
    }, {
      url: 'http://localhost:3000/en-GB/projects/rup-inspraak-vanaf-startnota-tot-openbaar-onderzoek/process',
      ignore: [
        'WCAG2AA.Principle3.Guideline3_2.3_2_2.H32.2'
      ],
      // Allow for two disabled 'Start an idea' buttons (with a too light background color) to pass the test
      threshold: 2
    }, {
      url: 'http://localhost:3000/en-GB/projects/rup-inspraak-vanaf-startnota-tot-openbaar-onderzoek/info',
      ignore: [
        'WCAG2AA.Principle3.Guideline3_2.3_2_2.H32.2'
      ],
      // Allow Twitter share button with a too low contrast ratio
      threshold: 1
    }, {
      url: 'http://localhost:3000/en-GB/profile/sylvester-kalinoski',
      ignore: [
        'WCAG2AA.Principle3.Guideline3_2.3_2_2.H32.2'
      ]
    }, {
      url: 'http://localhost:3000/en-GB/projects/an-idea-bring-it-to-your-council/ideas/new',
      threshold: 9,
    }, {
      url: 'http://localhost:3000/en-GB/ideas/new',
    }, {
      url: 'http://localhost:3000/en-GB/ideas/quisquam-omnis-non-quas',
      // Hide Twitter sharing button as the Twitter colors have a too low contrast ratio
      hideElements: '.twitter',
    },
    'http://localhost:3000/en-GB/projects',
    'http://localhost:3000/en-GB/projects/rup-inspraak-vanaf-startnota-tot-openbaar-onderzoek/events',
    'http://localhost:3000/en-GB/sign-in',
    'http://localhost:3000/en-GB/sign-up',
    'http://localhost:3000/en-GB/pages/information'
  ]
}

module.exports = config;
