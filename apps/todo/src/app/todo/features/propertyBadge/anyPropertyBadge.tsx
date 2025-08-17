import { Badge, BadgeProps } from '@chakra-ui/react';
import {
  PickPropertyMeta,
  PropertyId,
  propertySelectors,
  usePropertiesStore,
} from '../../logic/property';
import { forwardRef } from 'react';

type IAnyPropertyBadge = {
  propertyId: PropertyId;
};

type INumberRenderer = {
  meta: PickPropertyMeta<'number'>;
};

const HoverableBadge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ _hover, ...props }, ref) => (
    <Badge
      {...props}
      ref={ref}
      overflow="hidden"
      w="22px"
      _hover={{
        ..._hover,
        w: '100%',
      }}
    />
  )
);

const NumberRenderer = ({ meta }: INumberRenderer) => {
  const label = meta.label;

  return (
    <HoverableBadge>
      {label} {meta.name}
    </HoverableBadge>
  );
};

type IStringRenderer = {
  meta: PickPropertyMeta<'string'>;
};

const StringRenderer = ({ meta }: IStringRenderer) => {
  const label = meta.label;

  return (
    <HoverableBadge>
      {label} {meta.name}
    </HoverableBadge>
  );
};

type IBoolRenderer = {
  meta: PickPropertyMeta<'bool'>;
};
const BoolRenderer = ({ meta }: IBoolRenderer) => {
  const label = meta.label;

  return (
    <HoverableBadge>
      {label} {meta.name}
    </HoverableBadge>
  );
};

type IDateRenderer = {
  meta: PickPropertyMeta<'bool'>;
};
const DateRenderer = ({ meta }: IDateRenderer) => {
  const label = meta.label;

  return (
    <HoverableBadge>
      {label} {meta.name}
    </HoverableBadge>
  );
};

type IEnumRenderer = {
  meta: PickPropertyMeta<'enum'>;
};
const EnumRenderer = ({ meta }: IEnumRenderer) => {
  const label = meta.label;

  return (
    <HoverableBadge>
      {label} {meta.name}
    </HoverableBadge>
  );
};

const RendererMap = {
  number: NumberRenderer,
  string: StringRenderer,
  bool: BoolRenderer,
  date: DateRenderer,
  enum: EnumRenderer,
};

export const AnyPropertyBadge = ({ propertyId }: IAnyPropertyBadge) => {
  const property = usePropertiesStore((state) =>
    propertySelectors.selectById(state, propertyId)
  );

  if (!property) {
    return null;
  }

  const Renderer = RendererMap[property.type.type];
  if (!Renderer) {
    return null;
  }

  // @ts-ignore
  return <Renderer meta={{...property.type, ...property}} />;
};
