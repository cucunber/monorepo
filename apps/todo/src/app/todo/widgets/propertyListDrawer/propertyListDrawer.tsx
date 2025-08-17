import { Button, Drawer, IconButton, Portal } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { PropertyList } from '../../features/propertyList';
import { LuBlocks } from 'react-icons/lu';
import { PropertyCreatorDrawer } from '../propertyCreatorDrawer';

type IPropertyListDrawer = {
  children: ReactNode;
};

export const PropertyListDrawer = ({ children }: IPropertyListDrawer) => {
  return (
    <Drawer.Root size="sm">
      <Drawer.Trigger>{children}</Drawer.Trigger>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.CloseTrigger />
            <Drawer.Header>
              <Drawer.Title>Space properties</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body w="full">
              <PropertyCreatorDrawer>
                <Button mb={4} variant="subtle" w="full">Create property</Button>
              </PropertyCreatorDrawer>
              <PropertyList />
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
};

export const PropertyListDrawerTrigger = () => (
  <IconButton variant="subtle">
    <LuBlocks />
  </IconButton>
);
