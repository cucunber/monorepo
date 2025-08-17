import { Box, Button, SimpleGrid } from '@chakra-ui/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ReactNode, useMemo, useRef } from 'react';

const BASIC = {
  emoticons: [128512, 128591],
  misc_symbols_and_pictographs: [127744, 128511],
  transport_and_map: [128640, 128767],
  supplemental_symbols_and_pictographs: [129280, 129535],
  symbols_and_pictographs_extended_a: [129648, 129791],
  miscellaneous_symbols: [9728, 9983],
  dingbats: [9984, 10175],
  enclosed_alphanumeric_supplement: [127232, 127487],
  enclosed_ideographic_supplement: [127488, 127743],
  regional_indicator_symbols: [127462, 127487],
};

const FLAGS = {
  regional_indicator_symbols: [127462, 127487],
};

const SEQUENCE = {
  variation_selector_16: 65039,
  zero_width_joiner: 8205,
  vs16_emoji_sequences: [
    [10084, 65039],
    [9728, 65039],
    [9757, 65039],
    [9996, 65039],
  ],
  zwj_emoji_sequences: [
    [128104, 8205, 128187],
    [128105, 8205, 128188],
    [128105, 8205, 128103],
    [128104, 8205, 128104, 8205, 128102],
    [129489, 8205, 129309, 8205, 129489],
    [128105, 8205, 10084, 65039, 8205, 128139, 8205, 128105],
    [128104, 8205, 10084, 65039, 8205, 128104],
  ],
};

type RenderProps = {
  emoji: string;
};

export type Render = (props: RenderProps) => ReactNode;

type IEmojiList = {
  render?: Render;
};

const DefaultRender: Render = ({ emoji }) => (
  <Button fontSize="1.8em" variant="ghost">
    {emoji}
  </Button>
);

const PER_ROW = 8;

function batchArray<T>(array: T[], batchSize: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < array.length; i += batchSize) {
    batches.push(array.slice(i, i + batchSize));
  }
  return batches;
}

export const EmojiList = ({ render }: IEmojiList) => {
  const basic = useMemo(() => {
    const emojis = [];

    for (const [, [start, end]] of Object.entries(BASIC)) {
      for (let cp = start; cp <= end; cp++) {
        emojis.push(String.fromCodePoint(cp));
      }
    }

    return emojis;
  }, []);
  const flags = useMemo(() => {
    const [start, end] = FLAGS.regional_indicator_symbols;
    const flags = [];

    for (let first = start; first <= end; first++) {
      for (let second = start; second <= end; second++) {
        flags.push(String.fromCodePoint(first, second));
      }
    }

    return flags;
  }, []);
  const sequence = useMemo(() => {
    const { vs16_emoji_sequences, zwj_emoji_sequences } = SEQUENCE;

    const vs16Emojis = vs16_emoji_sequences.map((seq) =>
      String.fromCodePoint(...seq)
    );
    const zwjEmojis = zwj_emoji_sequences.map((seq) =>
      String.fromCodePoint(...seq)
    );

    return [...vs16Emojis, ...zwjEmojis];
  }, []);

  const emojis = useMemo(
    () => batchArray([...basic, ...flags, ...sequence], PER_ROW),
    [basic, flags, sequence]
  );

  const RenderComponent = render || DefaultRender;

  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: emojis.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 5,
  });

  return (
    <Box ref={parentRef} maxH="inherit" overflowY="auto">
      <Box height={`${virtualizer.getTotalSize()}px`} top="0" left="0" w="100%" position="relative">
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <SimpleGrid
            key={virtualItem.index}
            columns={PER_ROW}
            position="absolute"
            height={`${virtualItem.size}px`}
            transform={`translateY(${virtualItem.start}px)`}
            top={0}
            left={0}
          >
            {emojis[virtualItem.index].map((emoji, index) => (
              <RenderComponent key={`${emoji}-${index}`} emoji={emoji} />
            ))}
          </SimpleGrid>
        ))}
      </Box>
    </Box>
  );
};
