import { IInsightsInputLinks } from '../api/inputs/types';

const links: IInsightsInputLinks = {
  self: 'http://localhost:3000/web_api/v1/insights/?page%5Bnumber%5D=1&page%5Bsize%5D=20',
  last: 'http://localhost:3000/web_api/v1/insights/?page%5Bnumber%5D=2&page%5Bsize%5D=20',
  next: 'http://localhost:3000/web_api/v1/insights/?page%5Bnumber%5D=2&page%5Bsize%5D=20',
  first:
    'http://localhost:3000/web_api/v1/insights/?page%5Bnumber%5D=1&page%5Bsize%5D=20',
  prev: null,
};

export default links;
