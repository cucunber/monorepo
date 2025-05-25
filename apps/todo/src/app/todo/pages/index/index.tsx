import {
  addTask,
  SimpleTask,
  tasksActions,
  tasksSelectors,
  useTasksStore,
} from '../../logic/task';
import {
  Button,
  Card,
  HStack,
  Input,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';

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
        <Input
          {...form.register('title')}
        />
        <Textarea {...form.register('description')} />
        <Button type="submit">Add</Button>
      </form>
    </FormProvider>
  );
};

const Tasks = () => {
  const tasksEntities = useTasksStore(tasksSelectors.selectAll);
  return (
    <HStack>
      {tasksEntities.map((entity) => (
        <Card.Root width="320px" key={entity.id}>
          <Card.Body gap="2">
            <Card.Title mt="2">{entity.title}</Card.Title>
            <Card.Description>
              {entity.description || 'no description'}
            </Card.Description>
          </Card.Body>
          <Card.Footer justifyContent="flex-end">
            <Button
              onClick={() => {
                tasksActions.removeOne(entity);
              }}
              variant="solid"
              colorPalette="red"
            >
              Delete
            </Button>
          </Card.Footer>
        </Card.Root>
      ))}
    </HStack>
  );
};

export const TasksIndex = function TasksIndex() {
  return (
    <VStack>
      <TaskForm />
      <Tasks />
    </VStack>
  );
};
