import { Card, HStack, IconButton } from '@chakra-ui/react';
import {
  selectPropertyTasksById,
  usePropertiesTaskStore,
} from '../../logic/property-task';
import {
  TaskId,
  tasksActions,
  tasksSelectors,
  useTasksStore,
} from '../../logic/task';
import { PropertyBadge } from '../propertyBadge';
import { ReactNode } from 'react';
import { PropertyTaskSchema } from '../../logic/property-task/property-task.schema';
import { LuTrash } from 'react-icons/lu';

export type PropertyRender = (props: PropertyTaskSchema) => ReactNode;

type ITaskCard = {
  taskId: TaskId;
  propertyRender?: PropertyRender;
};

const defaultPropertyRender: PropertyRender = (props) => (
  <PropertyBadge {...props} />
);

export const TaskCard = ({ taskId, propertyRender }: ITaskCard) => {
  const task = useTasksStore((state) =>
    tasksSelectors.selectById(state, taskId)
  );
  const taskProperties = usePropertiesTaskStore((state) =>
    selectPropertyTasksById(taskId)(state)
  );

  if (!task) {
    return;
  }
  return (
    <Card.Root width="320px" key={task.id}>
      <Card.Body gap="2">
        <Card.Title mt="2">{task.title}</Card.Title>
        <Card.Description>
          {task.description || 'no description'}
        </Card.Description>
      </Card.Body>
      <Card.Footer justifyContent="flex-end">
        <HStack wrap="wrap">
          {taskProperties.ids.map((id) => {
            const entity = taskProperties.entities[id];
            const computedPropertyRender =
              propertyRender || defaultPropertyRender;
            return computedPropertyRender(entity);
          })}
        </HStack>
        <IconButton
          onClick={() => {
            tasksActions.removeOne(task);
          }}
          variant="subtle"
          colorPalette="red"
        >
          <LuTrash />
        </IconButton>
      </Card.Footer>
    </Card.Root>
  );
};
