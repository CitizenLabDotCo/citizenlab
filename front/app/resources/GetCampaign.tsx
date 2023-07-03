import { ICampaignData } from 'api/campaigns/types';
import useCampaign from 'api/campaigns/useCampaign';

type children = (renderProps: GetCampaignChildProps) => JSX.Element | null;

interface Props {
  id: string;
  children?: children;
}

export type GetCampaignChildProps = ICampaignData | undefined;

const GetCampaign = ({ id, children }: Props) => {
  const { data: campaign } = useCampaign(id);
  return (children as children)(campaign?.data);
};

export default GetCampaign;
