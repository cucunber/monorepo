import {
  addTask,
  SimpleTask,
  tasksSelectors,
  useTasksStore,
} from '../../logic/task';
import { Box, Button, HStack, Input, Textarea, VStack } from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import {
  PropertyListDrawer,
  PropertyListDrawerTrigger,
} from '../../widgets/propertyListDrawer';
import { PropertyRender, TaskCard } from '../../features/taskCard';
import {
  DraggableCardProperty,
  DraggableProperty,
  DroppableCard,
  DroppableTrash,
  PropertyDropper,
  PropertyDropperConsumer,
} from '../../widgets/propertyDropper';
import { FastPropertyPanel, RenderFn } from '../../widgets/fastPropertyPanel';
import { AnyPropertyBadge, PropertyBadge } from '../../features/propertyBadge';
import { LuTrash } from 'react-icons/lu';

const TaskForm = () => {
  const form = useForm<SimpleTask>();

  const handleSubmit: Parameters<(typeof form)['handleSubmit']>[0] = (
    formValues
  ) => {
    addTask(formValues);
    form.reset();
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <Input {...form.register('title')} />
        <Textarea {...form.register('description')} />
        <Button type="submit">Add</Button>
      </form>
    </FormProvider>
  );
};

const propertyRender: PropertyRender = (props) => (
  <DraggableCardProperty {...props}>
    <PropertyBadge {...props} />
  </DraggableCardProperty>
);

const Tasks = () => {
  const taskIds = useTasksStore(tasksSelectors.selectIds);
  return (
    <HStack wrap="wrap">
      {taskIds.map((taskId) => (
        <DroppableCard key={taskId} taskId={taskId}>
          <TaskCard taskId={taskId} propertyRender={propertyRender} />
        </DroppableCard>
      ))}
    </HStack>
  );
};

const fastPropertyRender: RenderFn = ({ id }) => (
  <DraggableProperty propertyId={id}>
    <AnyPropertyBadge propertyId={id} />
  </DraggableProperty>
);

export const TasksIndex = function TasksIndex() {
  return (
    <VStack>
      <PropertyDropper>
        <PropertyListDrawer>
          <PropertyListDrawerTrigger />
        </PropertyListDrawer>
        <TaskForm />
        <Tasks />
        <FastPropertyPanel
          position="fixed"
          right="0"
          bottom="0"
          background="red"
          render={fastPropertyRender}
        />
        <PropertyDropperConsumer>
          {(props) =>
            props.propertyId && (
              <DroppableTrash>
                <Box
                  p="4"
                  borderRadius="full"
                  position="fixed"
                  left="50%"
                  transform="translateX(-50%)"
                  bottom="0"
                >
                  <LuTrash />
                </Box>
              </DroppableTrash>
            )
          }
        </PropertyDropperConsumer>
      </PropertyDropper>
    </VStack>
  );
};
