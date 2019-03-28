function generateUrls(host) {
  // Every page that has the IdeaCards component
  // will complain a missing submit button for the search field
  // So we ignore this specific rule for such pages
  return [
    {
      url: `${host}/en-GB/`,
      // Allow for signed-out header title and subtitle to be on 'unrecognizable'/transparent background
      threshold: 2
    }, {
      url: `${host}/en-GB/ideas`,
      ignore: [
        'WCAG2AA.Principle3.Guideline3_2.3_2_2.H32.2'
      ]
    }, {
      url: `${host}/en-GB/projects/rup-inspraak-vanaf-startnota-tot-openbaar-onderzoek/process`,
      ignore: [
        'WCAG2AA.Principle3.Guideline3_2.3_2_2.H32.2'
      ],
      // Allow for two disabled 'Start an idea' buttons (with a too light background color) to pass the test
      threshold: 2
    }, {
      url: `${host}/en-GB/projects/rup-inspraak-vanaf-startnota-tot-openbaar-onderzoek/info`,
      // Allow Twitter share button with a too low contrast ratio
      threshold: 1
    }, {
      url: `${host}/en-GB/profile/sylvester-kalinoski`,
      ignore: [
        'WCAG2AA.Principle3.Guideline3_2.3_2_2.H32.2'
      ]
    }, {
      url: `${host}/en-GB/projects/an-idea-bring-it-to-your-council/ideas/new`,
       threshold: 9,
    }, {
      url: `${host}/en-GB/ideas/new`,
    }, {
      url: `${host}/en-GB/ideas/quisquam-omnis-non-quas`,
      // Hide Twitter sharing button as the Twitter colors have a too low contrast ratio
      hideElements: '.twitter',
    },
    `${host}/en-GB/projects`,
    `${host}/en-GB/projects/renewing-westbrook-parc/events`,
    `${host}/en-GB/sign-in`,
    `${host}/en-GB/sign-up`,
    `${host}/en-GB/pages/information`
  ]
}

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
  urls: generateUrls(process.env.NODE_ENV === 'staging' ? 'https://pa11y.stg.citizenlab.co' : 'http://localhost:3000')
}

module.exports = config;
