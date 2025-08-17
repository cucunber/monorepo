import { Button, Popover } from '@chakra-ui/react';
import { ReactNode, useCallback } from 'react';
import { EmojiList, Render } from '../emojiList';

type PickerControls = {
  onSelect: (emoji: string) => void;
};

type IEmojiPicker = {
  children: ReactNode;
} & PickerControls;

export const EmojiPicker = ({ children, onSelect }: IEmojiPicker) => {
  const render: Render = useCallback(
    ({ emoji }) => {
      const handleSelect = () => {
        onSelect(emoji);
      };
      return (
        <Button fontSize="1.8em" variant="ghost" onClick={handleSelect}>
          {emoji}
        </Button>
      );
    },
    [onSelect]
  );
  return (
    <Popover.Root>
      <Popover.Trigger>{children}</Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content>
          <Popover.CloseTrigger />
          <Popover.Body overflow="hidden" maxHeight="300px">
            <EmojiList render={render} />
          </Popover.Body>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  );
};
