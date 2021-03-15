import useMapConfig, {
  Props as HookProps,
  IOutput,
} from '../hooks/useMapConfig';

export type GetMapConfigChildProps = IOutput;

type children = (renderProps: IOutput) => JSX.Element | null;

const GetMapConfig: React.SFC<HookProps> = (props) => {
  const mapConfig = useMapConfig(props);
  return (props.children as children)(mapConfig);
};

export default GetMapConfig;
