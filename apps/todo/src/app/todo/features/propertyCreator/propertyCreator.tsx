import {
  Controller,
  FormProvider,
  SubmitErrorHandler,
  SubmitHandler,
  useFieldArray,
  useForm,
  useFormContext,
  UseFormReturn,
  useWatch,
} from 'react-hook-form';
import { SimpleProperty } from '../../logic/property';
import { PropsWithChildren, RefObject, useEffect } from 'react';
import {
  Accordion,
  Badge,
  Box,
  Button,
  ButtonProps,
  Checkbox,
  createListCollection,
  Field,
  Fieldset,
  HStack,
  IconButton,
  Input,
  InputGroup,
  Portal,
  Select,
  SimpleGrid,
  Span,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { EmojiPicker } from '../emojiPicker';
import {
  NumberInputField,
  NumberInputRoot,
} from '../../../../components/ui/number-input';
import { v4 as uuidv4 } from 'uuid';
import { LuCopy, LuPlus, LuTrash } from 'react-icons/lu';
import { Tooltip } from '../../../../components/ui/tooltip';

export type IPropertyCreator = {
  property?: Partial<SimpleProperty>;
  onValid: (
    data: SimpleProperty,
    form: UseFormReturn<SimpleProperty, any, SimpleProperty>,
    event?: React.BaseSyntheticEvent
  ) => unknown | Promise<unknown>;
  onInvalid?: SubmitErrorHandler<SimpleProperty>;
};

const usePropertyForm = () => useFormContext<SimpleProperty>();

export const PropertyName = () => {
  const { register } = usePropertyForm();

  return (
    <Field.Root>
      <Field.Label>Name</Field.Label>
      <Input {...register('name')} />
    </Field.Root>
  );
};

export const PropertyDescription = () => {
  const { register } = usePropertyForm();

  return (
    <Field.Root>
      <Field.Label>Description</Field.Label>
      <Textarea {...register('description')} />
    </Field.Root>
  );
};

const possibleType = createListCollection({
  items: [
    { label: 'string', value: 'string' },
    { label: 'number', value: 'number' },
    { label: 'bool', value: 'bool' },
    { label: 'enum', value: 'enum' },
    { label: 'date', value: 'date' },
  ],
});

type IPropertyType = {
  container?: RefObject<HTMLElement | null>;
};

export const PropertyType = ({ container }: IPropertyType) => {
  const { register } = usePropertyForm();

  return (
    <Field.Root>
      <Field.Label>Type</Field.Label>
      <Select.Root {...register('type.type')} collection={possibleType}>
        <Select.HiddenSelect />
        <Select.Control>
          <Select.Trigger>
            <Select.ValueText placeholder="Select type" />
          </Select.Trigger>
          <Select.IndicatorGroup>
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>
        <Portal container={container}>
          <Select.Positioner>
            <Select.Content>
              {possibleType.items.map((type) => (
                <Select.Item item={type} key={type.value}>
                  {type.label}
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Portal>
      </Select.Root>
    </Field.Root>
  );
};

const PropertyNumberMeta = () => {
  const { register } = usePropertyForm();

  return (
    <HStack w="full">
      <Field.Root w="full">
        <Field.Label>Min</Field.Label>
        <NumberInputRoot w="full">
          <NumberInputField {...register('type.min')} />
        </NumberInputRoot>
      </Field.Root>
      <Field.Root w="full">
        <Field.Label>Max</Field.Label>
        <NumberInputRoot w="full">
          <NumberInputField {...register('type.max')} />
        </NumberInputRoot>
      </Field.Root>
      <Field.Root>
        <Field.Label>Unit</Field.Label>
        <Input w="100px" {...register('type.unit')} />
      </Field.Root>
    </HStack>
  );
};

const PropertyStringMeta = () => <Text>No extra settings</Text>;

const PropertyBoolMeta = () => <Text>No extra settings</Text>;

const PropertyDateMeta = () => {
  const { register } = usePropertyForm();

  return (
    <HStack w="full">
      <Field.Root w="full">
        <Field.Label>Min</Field.Label>
        <Input {...register('type.min')} w="full" type="date" />
      </Field.Root>
      <Field.Root w="full">
        <Field.Label>Max</Field.Label>
        <Input {...register('type.max')} w="full" type="date" />
      </Field.Root>
    </HStack>
  );
};

const PropertyEnumMeta = () => {
  const { control, register, getValues } = usePropertyForm();
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'type.options',
  });

  const handleCreateNewClick = () => {
    append({ id: uuidv4(), value: '', title: '' });
  };

  const handleRemoveClick = (index: number) => () => {
    remove(index);
  };

  const handleCopyValueToTitleClick = (index: number) => () => {
    const currentValue = getValues('type.options')[index];
    update(index, {
      ...currentValue,
      title: currentValue.value,
    });
  };

  return (
    <VStack w="full">
      <Field.Root>
        <Checkbox.Root>
          <Checkbox.HiddenInput />
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          <Checkbox.Label>Multiple</Checkbox.Label>
        </Checkbox.Root>
      </Field.Root>
      <Field.Root w="full">
        <Field.Label>Options</Field.Label>
        <VStack maxH="100px" overflowY="auto" gap={2} w="full">
          <Box position="sticky" top={0} w="full" zIndex={1}>
            <Button onClick={handleCreateNewClick} w="full" variant="subtle">
              <LuPlus />
              Add
            </Button>
          </Box>
          {fields.map((field, index) => (
            <HStack key={field.id}>
              <Input
                {...register(`type.options.${index}.value`)}
                placeholder="value: red, blue, green"
                w="full"
              />
              <InputGroup
                endElement={
                  <Tooltip showArrow content="As value">
                    <IconButton
                      onClick={handleCopyValueToTitleClick(index)}
                      size="xs"
                      variant="subtle"
                    >
                      <LuCopy />
                    </IconButton>
                  </Tooltip>
                }
              >
                <Input
                  {...register(`type.options.${index}.title`)}
                  placeholder="title: red color, blue color, etc"
                  w="full"
                />
              </InputGroup>
              <IconButton
                colorPalette="red"
                variant="subtle"
                onClick={handleRemoveClick(index)}
              >
                <LuTrash />
              </IconButton>
            </HStack>
          ))}
        </VStack>
      </Field.Root>
    </VStack>
  );
};

const PropertyEnumMetaMap = {
  number: PropertyNumberMeta,
  string: PropertyStringMeta,
  bool: PropertyBoolMeta,
  enum: PropertyEnumMeta,
  date: PropertyDateMeta,
};

export const PropertyTypeMeta = () => {
  const { control, resetField } = usePropertyForm();
  const type = useWatch({ control, name: 'type.type' });
  const Component = PropertyEnumMetaMap[type];
  useEffect(() => {
    const fieldsToReset = [
      'type.max',
      'type.min',
      'type.multiple',
      'type.unit',
      'type.options',
    ] as const;
    fieldsToReset.forEach((field) => resetField(field));
  }, [type]);
  if (!Component) {
    return null;
  }

  return (
    <Accordion.Root collapsible>
      <Accordion.Item value="extra">
        <Accordion.ItemTrigger>
          <Span>Settings</Span>
          <Accordion.ItemIndicator />
        </Accordion.ItemTrigger>
        <Accordion.ItemContent>
          <Accordion.ItemBody>
            <Component />
          </Accordion.ItemBody>
        </Accordion.ItemContent>
      </Accordion.Item>
    </Accordion.Root>
  );
};

export const PropertyLabel = () => {
  const { control } = usePropertyForm();

  return (
    <Field.Root>
      <Field.Label>Label</Field.Label>
      <Controller
        name="label"
        control={control}
        render={({ field: { onChange, value } }) => (
          <EmojiPicker onSelect={onChange}>
            <Badge
              minW={!value ? '24px' : undefined}
              variant="solid"
              colorPalette="blue"
              fontSize="1.2em"
            >
              {value}
            </Badge>
          </EmojiPicker>
        )}
      />
    </Field.Root>
  );
};

export const PropertySubmit = (props: Omit<ButtonProps, 'type'>) => (
  <Button {...props} type="submit" />
);

const DEFAULT_PROPERTY: Partial<SimpleProperty> = {
  type: { type: 'string' },
};

export const PropertyCreator = ({
  property = DEFAULT_PROPERTY,
  children,
  onValid,
  onInvalid,
}: PropsWithChildren<IPropertyCreator>) => {
  const form = useForm<SimpleProperty>({ defaultValues: property || DEFAULT_PROPERTY });

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(
          (data, ev) => onValid(data, form, ev),
          onInvalid
        )}
      >
        <Fieldset.Root>{children}</Fieldset.Root>
      </form>
    </FormProvider>
  );
};
