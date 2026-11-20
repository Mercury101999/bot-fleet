import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Line, Polygon } from 'react-native-svg';

import { arrowPoints, layoutFleet, segmentBetween } from '@/lib/layout';
import type { Bot, Handoff } from '@/lib/types';
import { fonts } from '@/theme/tokens';
import { useAppTheme } from '@/theme/useAppTheme';

const NODE = 56;
const RADIUS = NODE / 2;
const NAME_CLEARANCE = 22;

export function TeamMap({ bots, links, onOpen }: { bots: Bot[]; links: Handoff[]; onOpen: (id: string) => void }) {
  const { colors } = useAppTheme();
  const windowWidth = useWindowDimensions().width;
  const width = Math.max(280, Math.min(windowWidth, 760) - 40);
  const layout = layoutFleet(
    bots.map((bot) => bot.id),
    width,
  );
  const byId = new Map(bots.map((bot) => [bot.id, bot]));
  const position = new Map(layout.positions.map((item) => [item.id, item]));
  const columnWidth = layout.width / layout.columns;

  return (
    <View accessibilityLabel="Fleet network" style={{ width: layout.width, height: layout.height, position: 'relative', alignSelf: 'center' }}>
      <Svg width={layout.width} height={layout.height} accessible={false}>
        {links.map((link) => {
          const from = position.get(link.fromId);
          const to = position.get(link.toId);
          if (!from || !to) return null;
          const segment = segmentBetween(from, to, RADIUS, NAME_CLEARANCE);
          return (
            <Line
              key={link.id}
              x1={segment.x1}
              y1={segment.y1}
              x2={segment.x2}
              y2={segment.y2}
              stroke={colors.mapLine}
              strokeWidth={1.6}
            />
          );
        })}
        {links.map((link) => {
          const from = position.get(link.fromId);
          const to = position.get(link.toId);
          if (!from || !to) return null;
          const segment = segmentBetween(from, to, RADIUS, NAME_CLEARANCE);
          return (
            <Polygon key={`${link.id}-arrow`} points={arrowPoints(segment.x1, segment.y1, segment.x2, segment.y2)} fill={colors.accent} />
          );
        })}
      </Svg>
      {layout.positions.map((item) => {
        const bot = byId.get(item.id);
        if (!bot) return null;
        return (
          <Pressable
            key={bot.id}
            accessibilityRole="button"
            accessibilityLabel={`Open ${bot.name}`}
            onPress={() => onOpen(bot.id)}
            style={[styles.hit, { left: item.x - columnWidth / 2, top: item.y - RADIUS, width: columnWidth }]}>
            <View
              style={[
                styles.node,
                {
                  backgroundColor: colors.elevated,
                  borderColor: colors.status[bot.status].ink,
                },
              ]}>
              <Text style={styles.emoji}>{bot.emoji}</Text>
            </View>
            <Text
              numberOfLines={1}
              style={[styles.name, { color: colors.ink, backgroundColor: colors.bg, fontFamily: fonts.bodyMedium, maxWidth: columnWidth - 12 }]}>
              {bot.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  hit: { position: 'absolute', alignItems: 'center' },
  node: {
    width: NODE,
    height: NODE,
    borderRadius: RADIUS,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 24 },
  name: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    paddingHorizontal: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
});
