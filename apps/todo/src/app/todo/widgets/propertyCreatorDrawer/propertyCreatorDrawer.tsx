import { Drawer, Portal } from '@chakra-ui/react';
import {
  addProperty,
  propertyActions,
  PropertyId,
  propertySelectors,
  usePropertiesStore,
} from '../../logic/property';
import { ReactNode, useRef, useState } from 'react';
import {
  IPropertyCreator,
  PropertyCreator,
  PropertyDescription,
  PropertyLabel,
  PropertyName,
  PropertySubmit,
  PropertyType,
  PropertyTypeMeta,
} from '../../features/propertyCreator';
import { toaster } from '../../../../components/ui/toaster';

type IPropertyCreatorDrawer = {
  propertyId?: PropertyId;
  children: ReactNode;
};

export const PropertyCreatorDrawer = ({
  propertyId = 'undefined',
  children,
}: IPropertyCreatorDrawer) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const property = usePropertiesStore((state) =>
    propertySelectors.selectById(state, propertyId)
  );
  const handleValid: IPropertyCreator['onValid'] = (data, form) => {
    if (property) {
      propertyActions.upsertOne({ id: propertyId, ...data });
    } else {
      addProperty(data);
    }
    form.reset();
    toaster.create({
      description: `Property "${data.name}" has been ${property ? 'updated' : 'created'} successfully`,
      type: 'info',
    });
    setOpen(false);
  };
  return (
    <Drawer.Root open={open} onOpenChange={(e) => setOpen(e.open)} size="sm">
      <Drawer.Trigger asChild>{children}</Drawer.Trigger>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content ref={containerRef}>
            <Drawer.CloseTrigger />
            <Drawer.Header>
              <Drawer.Title>
                {property ? `Update ${property.name}` : 'Create property'}
              </Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
              <PropertyCreator property={property} onValid={handleValid}>
                <PropertyName />
                <PropertyDescription />
                <PropertyType container={containerRef} />
                <PropertyTypeMeta />
                <PropertyLabel />
                <PropertySubmit>
                  {property ? 'Update' : 'Create'}
                </PropertySubmit>
              </PropertyCreator>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
};
