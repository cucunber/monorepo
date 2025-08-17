import { Box, BoxProps } from '@chakra-ui/react';
import {
  createContext,
  Dispatch,
  FocusEventHandler,
  MouseEventHandler,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useMemo,
  useState,
} from 'react';

type View = 'preview' | 'control';

type IEditableContext = {
  view: View;
};

type IEditableControlsContext = {
  setView: Dispatch<SetStateAction<IEditableContext['view']>>;
};

const EditableContext = createContext({} as IEditableContext);
const EditableControlsContext = createContext({} as IEditableControlsContext);

const useEditable = () => useContext(EditableContext);
const useEditableControls = () => useContext(EditableControlsContext);

const Preview = ({ onClick, ...props }: BoxProps) => {
  const { view } = useEditable();
  const { setView } = useEditableControls();

  if (view !== 'preview') {
    return null;
  }

  const handleClick: MouseEventHandler<HTMLDivElement> = (ev) => {
    setView('control');
    onClick?.(ev);
  };

  return <Box w="full" h="full" {...props} onClick={handleClick} />;
};

const Control = ({ onBlur, ...props }: BoxProps) => {
  const { view } = useEditable();
  const { setView } = useEditableControls();

  if (view !== 'control') {
    return null;
  }

  const handleBlur: FocusEventHandler<HTMLDivElement> = (ev) => {
    setView('preview');
    onBlur?.(ev);
  };

  return <Box w="full" h="full" {...props} onBlur={handleBlur} tabIndex={0} />;
};

export const Editable = ({ children }: PropsWithChildren<unknown>) => {
  const [view, setView] = useState<View>('preview');

  const value = useMemo(() => ({ view }), [view]);
  const controls = useMemo(() => ({ setView }), [setView]);

  return (
    <EditableContext.Provider value={value}>
      <EditableControlsContext.Provider value={controls}>
        {children}
      </EditableControlsContext.Provider>
    </EditableContext.Provider>
  );
};

Editable.Preview = Preview;
Editable.Control = Control;
