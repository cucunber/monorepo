import {
  Badge,
  Box,
  CheckboxCheckedChangeDetails,
  HStack,
  Input,
  NativeSelect,
  Text,
} from '@chakra-ui/react';
import {
  PickPropertyMeta,
  PropertyId,
  propertySelectors,
  usePropertiesStore,
} from '../../logic/property';
import {
  propertyTaskActions,
  propertyTaskSelectors,
  usePropertiesTaskStore,
} from '../../logic/property-task';
import { getPropertyTaskKey } from '../../logic/property-task/property-task.schema';
import { TaskId } from '../../logic/task';
import { ChangeEventHandler, useMemo } from 'react';
import { PropertyOption } from '../../logic/property/property.schema';
import { Editable } from '../../../../shared/component/editable';
import {
  NumberInputField,
  NumberInputRoot,
} from '../../../../components/ui/number-input';
import { Tooltip } from '../../../../components/ui/tooltip';
import { Switch } from '../../../../components/ui/switch';

type IPropertyBadge = {
  propertyId: PropertyId;
  taskId: TaskId;
};

type INumberRenderer = {
  meta: PickPropertyMeta<'number'>;
} & IPropertyBadge;

const NumberRenderer = ({ meta, propertyId, taskId }: INumberRenderer) => {
  const property = usePropertyValue(propertyId, taskId);
  if (!property) {
    return null;
  }
  const value = property.value;
  const label = meta.label || meta.name;

  const handleChange: ChangeEventHandler<HTMLInputElement> = (ev) => {
    propertyTaskActions.updateOne(getPropertyTaskKey(propertyId, taskId), {
      value: ev.target.value,
    });
  };

  return (
    <Badge as={HStack}>
      {label}{' '}
      <Editable>
        <Box w="48px" fontSize="1em" h="1em">
          <Editable.Preview>
            <Tooltip content={value}>
              <Text truncate>{value}</Text>
            </Tooltip>
          </Editable.Preview>
          <Editable.Control>
            <NumberInputRoot h="1em" p="0" fontSize="inherit">
              <NumberInputField
                p="0"
                h="inherit"
                border="none"
                value={value}
                onChange={handleChange}
                min={meta.min}
                max={meta.max}
              />
            </NumberInputRoot>
          </Editable.Control>
        </Box>
      </Editable>
    </Badge>
  );
};

type IStringRenderer = {
  meta: PickPropertyMeta<'string'>;
} & IPropertyBadge;

const StringRenderer = ({ meta, propertyId, taskId }: IStringRenderer) => {
  const property = usePropertyValue(propertyId, taskId);
  if (!property) {
    return null;
  }
  const value = property.value;
  const label = meta.label || meta.name;

  const handleChange: ChangeEventHandler<HTMLInputElement> = (ev) => {
    propertyTaskActions.updateOne(getPropertyTaskKey(propertyId, taskId), {
      value: ev.target.value,
    });
  };

  return (
    <Badge>
      {label}{' '}
      <Editable>
        <Box w="48px" fontSize="0.8rem" h="1rem">
          <Editable.Preview>
            <Tooltip content={value}>
              <Text truncate>{value}</Text>
            </Tooltip>
          </Editable.Preview>
          <Editable.Control>
            <Input
              p="0"
              h="inherit"
              border="none"
              value={value}
              onChange={handleChange}
            />
          </Editable.Control>
        </Box>
      </Editable>
    </Badge>
  );
};

type IBoolRenderer = {
  meta: PickPropertyMeta<'bool'>;
} & IPropertyBadge;
const BoolRenderer = ({ meta, propertyId, taskId }: IBoolRenderer) => {
  const property = usePropertyValue(propertyId, taskId);
  if (!property) {
    return null;
  }
  const value = property.value as unknown as boolean;
  const label = meta.label || meta.name;

  const handleChange = (details: CheckboxCheckedChangeDetails) => {
    propertyTaskActions.updateOne(getPropertyTaskKey(propertyId, taskId), {
      value: !!details.checked,
    });
  };

  return (
    <Badge>
      {label}{' '}
      <Editable>
        <Box w="48px" fontSize="0.8rem" h="1rem">
          <Editable.Preview>
            <Tooltip content="value">
              <Text truncate>{value.toString()}</Text>
            </Tooltip>
          </Editable.Preview>
          <Editable.Control>
            <Switch
              size="xs"
              checked={value}
              onCheckedChange={handleChange}
            />
          </Editable.Control>
        </Box>
      </Editable>
    </Badge>
  );
};

type IDateRenderer = {
  meta: PickPropertyMeta<'date'>;
} & IPropertyBadge;
const DateRenderer = ({ meta, propertyId, taskId }: IDateRenderer) => {
  const property = usePropertyValue(propertyId, taskId);
  if (!property) {
    return null;
  }
  const value = property.value;
  const label = meta.label || meta.name;

  const handleChange: ChangeEventHandler<HTMLInputElement> = (ev) => {
    propertyTaskActions.updateOne(getPropertyTaskKey(propertyId, taskId), {
      value: ev.target.value,
    });
  };

  return (
    <Badge>
      {label}{' '}
      <Editable>
        <Box w="48px" fontSize="0.8rem" h="1rem">
          <Editable.Preview>
            <Tooltip content={value}>
              <Text truncate>{value}</Text>
            </Tooltip>
          </Editable.Preview>
          <Editable.Control>
            <Input
              p="0"
              h="inherit"
              border="none"
              value={value}
              type="date"
              onChange={handleChange}
            />
          </Editable.Control>
        </Box>
      </Editable>
    </Badge>
  );
};

type IEnumRenderer = {
  meta: PickPropertyMeta<'enum'>;
} & IPropertyBadge;
const EnumRenderer = ({ meta, propertyId, taskId }: IEnumRenderer) => {
  const property = usePropertyValue(propertyId, taskId);
  if (!property) {
    return null;
  }
  const value = property.value;
  const label = meta.label || meta.name;
  const { options } = meta;

  const mappedValue = Array.isArray(value) ? value : [];

  const optionsById = useMemo(
    () =>
      options.reduce((acc, v) => {
        acc[v.value] = v;
        return acc;
      }, {} as Record<string, PropertyOption>),
    [options]
  );

  const titles = mappedValue.map((val) => optionsById[val].title);

  const handleChange: ChangeEventHandler<HTMLSelectElement> = (ev) => {
    propertyTaskActions.updateOne(getPropertyTaskKey(propertyId, taskId), {
      value: [ev.target.value],
    });
  };

  return (
    <Badge>
      {label}
      <Editable>
        <Box w="48px" fontSize="0.8rem" h="1rem">
          <Editable.Preview>
            <Tooltip content={titles}>
              <Text truncate>{titles}</Text>
            </Tooltip>
          </Editable.Preview>
          <Editable.Control>
            <NativeSelect.Root h="1em" p="0" fontSize="inherit">
              <NativeSelect.Field
                multiple={meta.multiple}
                value={mappedValue}
                onChange={handleChange}
                p="0"
                h="inherit"
                border="none"
                fontSize="inherit"
              >
                {options.map(({ id, value, title }) => (
                  <option key={id} value={value}>
                    {title}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Editable.Control>
        </Box>
      </Editable>
    </Badge>
  );
};

const RendererMap = {
  number: NumberRenderer,
  string: StringRenderer,
  bool: BoolRenderer,
  date: DateRenderer,
  enum: EnumRenderer,
};

const usePropertyValue = (propertyId: PropertyId, taskId: TaskId) =>
  usePropertiesTaskStore((state) =>
    propertyTaskSelectors.selectById(
      state,
      getPropertyTaskKey(propertyId, taskId)
    )
  );

export const PropertyBadge = ({ propertyId, taskId }: IPropertyBadge) => {
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

  return (
    <Renderer
      meta={{ ...property.type, ...property }}
      propertyId={propertyId}
      taskId={taskId}
    />
  );
};
