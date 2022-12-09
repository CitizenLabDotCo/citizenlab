import { isValidUrl } from './utils';

const validPlatformLinks = [
  {
    platform: 'Typeform',
    urls: ['https://citizenlabco.typeform.com/to/I3AaTInh'],
  },
  {
    platform: 'BalancingAct',
    urls: ['https://dummy.abalancingact.com/dummy'],
  },
  {
    platform: 'Enalyzer',
    urls: ['https://surveys.enalyzer.com/?pid=cefb4s4s'],
  },
  {
    platform: 'Qualtrics',
    urls: [
      'https://qfreeaccountssjc1.az1.qualtrics.com/jfe/form/SV_0c5J0877iwxXFX0',
    ],
  },
  {
    platform: 'Smart survey',
    urls: ['https://www.smartsurvey.co.uk/s/LU3JMS/'],
  },
  {
    platform: 'Tableau',
    urls: [
      'https://public.tableau.com/views/CountyExplorationTool/Dashboard1?:language=en-US&:display_count=n&:origin=viz_share_link&:showVizHome=no&:embed=true',
    ],
  },
  {
    platform: 'Konveio',
    urls: [
      'https://maunakea.konveio.com/sites/maunakea.konveio.com/files/u2/MKMasterPlan-AllParts_Sept2021.pdf',
    ],
  },
  {
    platform: 'Facebook',
    urls: [
      'https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Fnytimes%2Fvideos%2F348112350782308%2F&',
    ],
  },
  {
    platform: 'Youtube',
    urls: ['https://www.youtube.com/embed/szg3dIZ8xDc'],
  },
  {
    platform: 'Vimeo',
    urls: ['https://player.vimeo.com/video/719182720?h=ef103ac0a7'],
  },
  {
    platform: 'Dailymotion',
    urls: ['https://www.dailymotion.com/embed/video/x855y3y?'],
  },
  {
    platform: 'Dreambroker',
    urls: ['https://www.dreambroker.com/channel/3lkvmi5h/iframe/33jxadml'],
  },
  {
    platform: 'Wistia',
    urls: ['https://citizenlab-15.wistia.com/medias/lgaj8h7vnt'],
  },
  {
    platform: 'Snapsurveys',
    urls: [
      'https://online1.snapsurveys.com/interview/deff624d-0604-45bb-a072-0c6da45b22e6',
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
  {
    platform: 'PDF Files',
    urls: [
      'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    ],
  },
];

describe('isValidUrl', () => {
  // I'm using this structure to make it easy to identify which platform has a failing test
  it.each(validPlatformLinks)(
    'should return [true, "whitelist"] for valid url %s',
    (validPlatformData) => {
      validPlatformData.urls.forEach((url) => {
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
