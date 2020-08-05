function generateUrls(host) {
  // Every page that has the IdeaCards component
  // will complain a missing submit button for the search field
  // So we ignore this specific rule (WCAG2AA.Principle3.Guideline3_2.3_2_2.H32.2) for such pages
  // The high thresholds are to deal with pa11y's inability to deal with transparent backgrounds
  return [
    {
      url: `${host}/en-GB/ideas`,
      ignore: ['WCAG2AA.Principle3.Guideline3_2.3_2_2.H32.2'],
      threshold: 4,
    },
    {
      url: `${host}/en-GB/projects/rup-inspraak-vanaf-startnota-tot-openbaar-onderzoek/process`,
      ignore: ['WCAG2AA.Principle3.Guideline3_2.3_2_2.H32.2'],
      // Allow for two disabled 'Start an idea' buttons (with a too light background color) to pass the test
      threshold: 5,
    },
    {
      url: `${host}/en-GB/projects/rup-inspraak-vanaf-startnota-tot-openbaar-onderzoek/info`,
      // Allow Twitter share button with a too low contrast ratio
      threshold: 4,
    },
    {
      url: `${host}/en-GB/profile/sylvester-kalinoski`,
      ignore: ['WCAG2AA.Principle3.Guideline3_2.3_2_2.H32.2'],
      threshold: 3,
    },
    {
      url: `${host}/en-GB/projects/an-idea-bring-it-to-your-council/ideas/new`,
      threshold: 9,
    },
    {
      url: `${host}/en-GB/`,
      threshold: 9,
    },
    {
      url: `${host}/en-GB/ideas/new`,
    },
    {
      url: `${host}/en-GB/ideas/quisquam-omnis-non-quas`,
      // Hide Twitter sharing button as the Twitter colors have a too low contrast ratio
      hideElements: '.twitter',
    },
    {
      url: `${host}/en-GB/projects`,
      threshold: 6,
    },
    {
      url: `${host}/en-GB/pages/information`,
      threshold: 3,
    },
    `${host}/en-GB/projects/renewing-westbrook-parc/events`,
    `${host}/en-GB/sign-in`,
    `${host}/en-GB/sign-up`,
  ];
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
      Accept: 'text/html',
    },
  },
  standard: 'WCAG2A',
  urls: generateUrls(
    process.env.NODE_ENV === 'staging'
      ? 'https://pa11y.stg.citizenlab.co'
      : 'http://localhost:3000'
  ),
};

module.exports = config;
