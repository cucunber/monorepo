import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  UniqueIdentifier,
  DragEndEvent,
} from '@dnd-kit/core';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import {
  createContext,
  PropsWithChildren,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react';
import { propertyTaskActions } from '../../logic/property-task';
import { PropertyId } from '../../logic/property';
import { Box, BoxProps } from '@chakra-ui/react';
import { TaskId } from '../../logic/task';

type IDropperContext = {
  propertyId: UniqueIdentifier | null;
  taskId: UniqueIdentifier | null;
};

const DropperContext = createContext({} as IDropperContext);

export const PropertyDropperConsumer = DropperContext.Consumer;
export const usePropertyDropper = () => useContext(DropperContext);

export const PropertyDropper = ({ children }: PropsWithChildren) => {
  const [activeProperty, setActiveProperty] = useState<UniqueIdentifier | null>(
    null
  );
  const [originTaskId, setOriginTaskId] = useState<UniqueIdentifier | null>(
    null
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id.toString();
    setActiveProperty(id);

    if (id.includes('@')) {
      const [, taskId] = id.split('@');
      setOriginTaskId(taskId);
    } else {
      setOriginTaskId(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;

    const activeId = active.id as string;
    const overId = over?.id as string | undefined;

    if (overId === 'trash' && originTaskId) {
      const [propertyId] = activeId.split('@');
      propertyTaskActions.removeOne({
        propertyId,
        taskId: originTaskId.toString(),
        value: '',
      });
    } else if (overId && !originTaskId) {
      propertyTaskActions.addOne({
        propertyId: activeId,
        taskId: overId,
        value: '',
      });
    }

    setActiveProperty(null);
    setOriginTaskId(null);
  };

  const value = useMemo<IDropperContext>(
    () => ({ propertyId: activeProperty, taskId: originTaskId }),
    [activeProperty, originTaskId]
  );

  return (
    <DropperContext.Provider value={value}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {children}
      </DndContext>
    </DropperContext.Provider>
  );
};

type DraggableProps = {
  isDragging: boolean;
};

type IDraggableProperty = {
  propertyId: PropertyId;
  children: ReactNode | ((props: DraggableProps) => ReactNode);
};

export const DraggableProperty = ({
  children,
  propertyId,
  ...props
}: Omit<BoxProps, 'children'> & IDraggableProperty) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: propertyId,
    });

  const computedTransform: string | undefined = transform
    ? `translate(${transform.x}px, ${transform.y}px)`
    : undefined;

  const computedChildren = useMemo(
    () =>
      typeof children === 'function' ? children({ isDragging }) : children,
    [isDragging, children]
  );

  return (
    <Box
      {...props}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      transform={computedTransform}
    >
      {computedChildren}
    </Box>
  );
};

type DraggableCardPropertyProps = {
  isDragging: boolean;
};

type IDraggableCardProperty = {
  propertyId: PropertyId;
  taskId: TaskId;
  children: ReactNode | ((props: DraggableCardPropertyProps) => ReactNode);
};

export const DraggableCardProperty = ({
  propertyId,
  taskId,
  children,
  ...props
}: Omit<BoxProps, 'children'> & IDraggableCardProperty) => {
  const fullId = `${propertyId}@${taskId}`;
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: fullId,
    });

  const computedTransform: string | undefined = transform
    ? `translate(${transform.x}px, ${transform.y}px)`
    : undefined;

  const computedChildren = useMemo(
    () =>
      typeof children === 'function' ? children({ isDragging }) : children,
    [isDragging, children]
  );

  return (
    <Box
      {...props}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      transform={computedTransform}
    >
      {computedChildren}
    </Box>
  );
};

type DroppableCardProps = {
  isOver: boolean;
};

type IDroppableCard = {
  taskId: TaskId;
  children: ReactNode | ((props: DroppableCardProps) => ReactNode);
};

export const DroppableCard = ({
  taskId,
  children,
  ...props
}: Omit<BoxProps, 'children'> & IDroppableCard) => {
  const { isOver, setNodeRef } = useDroppable({ id: taskId });

  const computedChildren = useMemo(
    () => (typeof children === 'function' ? children({ isOver }) : children),
    [isOver, children]
  );

  return (
    <Box ref={setNodeRef} {...props}>
      {computedChildren}
    </Box>
  );
};

type DroppableTrashProps = {
  isOver: boolean;
};

type IDroppableTrash = {
  children: ReactNode | ((props: DroppableTrashProps) => ReactNode);
};

export const DroppableTrash = ({
  children,
  ...props
}: Omit<BoxProps, 'children'> & IDroppableTrash) => {
  const { setNodeRef, isOver } = useDroppable({ id: 'trash' });

  const computedChildren = useMemo(
    () => (typeof children === 'function' ? children({ isOver }) : children),
    [isOver, children]
  );

  return (
    <Box {...props} ref={setNodeRef}>
      {computedChildren}
    </Box>
  );
};
