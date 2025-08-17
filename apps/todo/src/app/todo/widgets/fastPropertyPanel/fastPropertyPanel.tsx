import { StackProps, VStack } from '@chakra-ui/react';
import {
  PropertyId,
  propertySelectors,
  usePropertiesStore,
} from '../../logic/property';
import { AnyPropertyBadge } from '../../features/propertyBadge';
import { ReactNode } from 'react';

type RenderProps = {
  id: PropertyId;
};

export type RenderFn = (props: RenderProps) => ReactNode;

type IFastPropertyPanel = {
  render?: RenderFn;
};

const defaultRender: RenderFn = ({ id }) => (
  <AnyPropertyBadge propertyId={id} />
);

export const FastPropertyPanel = ({
  render,
  ...props
}: IFastPropertyPanel & Omit<StackProps, 'children'>) => {
  const ids = usePropertiesStore(propertySelectors.selectIds);

  const computedRender = render || defaultRender;

  return <VStack {...props}>{ids.map((id) => computedRender({ id }))}</VStack>;
};
