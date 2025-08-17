import {
  Button,
  Card,
  Heading,
  HStack,
  IconButton,
  VStack,
} from '@chakra-ui/react';
import {
  propertyActions,
  PropertyId,
  propertySelectors,
  usePropertiesStore,
} from '../../logic/property';
import { Tooltip } from '../../../../components/ui/tooltip';
import { LuSettings, LuTrash } from 'react-icons/lu';
import { PropertyCreatorDrawer } from '../../widgets/propertyCreatorDrawer';

type IPropertyCard = {
  id: PropertyId;
};

const PropertyCard = ({ id }: IPropertyCard) => {
  const property = usePropertiesStore((state) =>
    propertySelectors.selectById(state, id)
  );

  if (!property) {
    return null;
  }

  const handleDeleteClick = () => {
    propertyActions.removeOne(property);
  };

  let content = (
    <HStack justifyContent="space-between" w="full">
      <Heading size="sm">
        {property.label} {property.name}
      </Heading>
      <HStack>
        <PropertyCreatorDrawer propertyId={id}>
          <IconButton size="xs" variant="ghost">
            <LuSettings />
          </IconButton>
        </PropertyCreatorDrawer>
        <IconButton
          onClick={handleDeleteClick}
          size="xs"
          variant="subtle"
          colorPalette="red"
        >
          <LuTrash />
        </IconButton>
      </HStack>
    </HStack>
  );

  if (property.description) {
    content = <Tooltip content={property.description}>{content}</Tooltip>;
  }

  return content;
};

export const PropertyList = () => {
  const propertiesIds = usePropertiesStore(propertySelectors.selectIds);

  return (
    <VStack w="full">
      {propertiesIds.map((id) => (
        <PropertyCard id={id} key={id} />
      ))}
    </VStack>
  );
};
