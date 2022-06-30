import { isValidUrl } from './utils';

const validUrlObject = [
  {
    platform: 'Tableau',
    urls: [
      'https://public.tableau.com/views/CountyExplorationTool/Dashboard1?:language=en-US&:display_count=n&:origin=viz_share_link&:showVizHome=no&:embed=true',
    ],
  },
  {
    platform: 'Slideshare',
    urls: ['http://www.slideshare.net/slideshow/embed_code/key/AYBogCfDlXkgMi'],
  },
  {
    platform: 'ArcGIS',
    urls: ['https://arcg.is/1jiOj'],
  },
  {
    platform: 'Eventbrite',
    urls: ['https://www.eventbrite.com/e/embed-test-tickets-370340266707'],
  },
  {
    platform: 'OneDrive',
    urls: [
      'https://onedrive.live.com/embed?cid=ECDDF98AA79FDEDB&resid=ECDDF98AA79FDEDB%21145&authkey=AIRY6_880wuOdDc&em=2',
    ],
  },
  {
    platform: 'Survey-Xact',
    urls: ['http://www.survey-xact.dk/LinkCollector?key=2H8CQ8F392C1'],
  },
  {
    platform: 'Google Maps',
    urls: [
      'https://www.google.com/maps/d/embed?mid=1NpY8BKXpxsOSGarew0TN3YGdw3e3XC0',
    ],
  },
  {
    platform: 'Google Slides',
    urls: [
      'https://docs.google.com/presentation/d/1tH9H0iptQPQobd6WVvGbdnh5Oe64XkzkZNO3OIHq5bg/edit?usp=sharing',
    ],
  },
  {
    platform: 'Google Sheets',
    urls: [
      'https://docs.google.com/spreadsheets/d/1imf6fBE-YO-6cWe_fLTskxcbfCerHCof_DSUQ9a7Ndc/edit?usp=sharing',
    ],
  },
  {
    platform: 'Google Forms',
    urls: [
      'https://docs.google.com/forms/d/e/1FAIpQLScdxf9qMpfAEIpMR9q2Zz8F0JqMP4kH_Tk_uKIlaH9603iz3Q/viewform?usp=sf_link',
    ],
  },
  {
    platform: 'Google Docs',
    urls: [
      'https://docs.google.com/document/d/1rhGoKtBEMrB118KNgSr9CaiA0-1dR_wozSp4fddD0kE/edit?usp=sharing',
    ],
  },
  {
    platform: 'Survey Monkey',
    urls: ['https://www.surveymonkey.co.uk/r/ZF632GH'],
  },
];

describe('isValidUrl', () => {
  // I'm using this structure to make it easy to identify which platform has a failing test
  it.each(validUrlObject)(
    'should return true for valid url %s',
    (urlObject) => {
      urlObject.urls.forEach((url) => {
        expect(isValidUrl(url)).toStrictEqual([true, 'whitelist']);
      });
    }
  );

  it('should return [false, "whitelist"] for Invalid urls', () => {
    expect(isValidUrl('http://www.example.com/contact/')).toStrictEqual([
      false,
      'whitelist',
    ]);
  });
});
