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
      url: 'https://demo.stg.citizenlab.co/en/',
      ignore: [
        'WCAG2AA.Principle3.Guideline3_2.3_2_2.H32.2'
      ]
    }, {
      url: 'https://demo.stg.citizenlab.co/en/ideas',
      ignore: [
        'WCAG2AA.Principle3.Guideline3_2.3_2_2.H32.2'
      ]
    }, {
      url: 'https://demo.stg.citizenlab.co/en/projects/renewing-westbrook-parc/process',
      ignore: [
        'WCAG2AA.Principle3.Guideline3_2.3_2_2.H32.2'
      ],
      // Allow for two disabled buttons with a light background color to be on the page
      threshold: 2
    }, {
      url: 'https://demo.stg.citizenlab.co/en/projects/renewing-westbrook-parc/info',
      ignore: [
        'WCAG2AA.Principle3.Guideline3_2.3_2_2.H32.2'
      ],
      // Allow Twitter share button with a too low contrast ratio
      threshold: 1
    }, {
      url: 'https://demo.stg.citizenlab.co/en/profile/koen-gremmelprez',
      ignore: [
        'WCAG2AA.Principle3.Guideline3_2.3_2_2.H32.2'
      ]
    }, {
      url: 'https://demo.stg.citizenlab.co/en/projects/open-idea-project/ideas/new',
      threshold: 12,
    }, {
      url: 'https://demo.stg.citizenlab.co/en/ideas/new',
      // Allow disabled button to have a too low contrast ratio
      threshold: 1,
    }, {
      url: 'https://demo.stg.citizenlab.co/en/ideas/more-box-parking-for-bikes-in-the-centrum',
      // Hide Twitter sharing button as the Twitter colors have a too low contrast ratio
      hideElements: '.twitter',
    },
    'https://demo.stg.citizenlab.co/en/projects',
    'https://demo.stg.citizenlab.co/en/projects/renewing-westbrook-parc/events',
    'https://demo.stg.citizenlab.co/en/sign-in',
    'https://demo.stg.citizenlab.co/en/sign-up',
    'https://demo.stg.citizenlab.co/en/pages/information'
  ] : [
    {
      url: 'http://localhost:3000/en/',
      ignore: [
        'WCAG2AA.Principle3.Guideline3_2.3_2_2.H32.2'
      ]
    }, {
      url: 'http://localhost:3000/en/ideas',
      ignore: [
        'WCAG2AA.Principle3.Guideline3_2.3_2_2.H32.2'
      ]
    }, {
      url: 'http://localhost:3000/en/projects/ratione-rerum-minus-quisquam-aperiam/process',
      ignore: [
        'WCAG2AA.Principle3.Guideline3_2.3_2_2.H32.2'
      ]
    }, {
      url: 'http://localhost:3000/en/projects/ratione-rerum-minus-quisquam-aperiam/info',
      ignore: [
        'WCAG2AA.Principle3.Guideline3_2.3_2_2.H32.2'
      ]
    }, {
      url: 'http://localhost:3000/en/profile/koen-gremmelprez',
      ignore: [
        'WCAG2AA.Principle3.Guideline3_2.3_2_2.H32.2'
      ]
    }, {
      url: 'http://localhost:3000/en/projects/open-idea-project/ideas/new',
      threshold: 12,
    }, {
      url: 'http://localhost:3000/en/ideas/new',
      threshold: 1,
    },
    'http://localhost:3000/en/projects',
    'http://localhost:3000/en/projects/ratione-rerum-minus-quisquam-aperiam/events',
    'http://localhost:3000/en/ideas/ut-maiores-dolorem-optio-aut-quas',
    'http://localhost:3000/en/sign-in',
    'http://localhost:3000/en/sign-up',
    'http://localhost:3000/en/pages/information'
  ]
}

module.exports = config;
