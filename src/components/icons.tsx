import Svg, { Circle, Path, Rect } from 'react-native-svg';

export function HomeIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="8" height="8" rx="2" stroke={color} strokeWidth={1.7} />
      <Rect x="13" y="3" width="8" height="5" rx="2" stroke={color} strokeWidth={1.7} />
      <Rect x="13" y="10" width="8" height="11" rx="2" stroke={color} strokeWidth={1.7} />
      <Rect x="3" y="13" width="8" height="8" rx="2" stroke={color} strokeWidth={1.7} />
    </Svg>
  );
}

export function BotsIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle cx="8" cy="9" r="3.2" stroke={color} strokeWidth={1.7} />
      <Circle cx="16" cy="15" r="3.2" stroke={color} strokeWidth={1.7} />
      <Path d="M8 12.2v1.2a4 4 0 0 0 4 4h1" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
    </Svg>
  );
}

export function MapIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M8 8.2 16 6.8M7.6 9.4 11.2 15.4M16.4 8.6 13 15.2" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Circle cx="6.5" cy="7" r="2.2" fill={color} />
      <Circle cx="17.5" cy="6.2" r="2.2" fill={color} />
      <Circle cx="12" cy="17.2" r="2.2" fill={color} />
    </Svg>
  );
}

export function SettingsIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M4 8h9M4 16h6" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
      <Circle cx="16.5" cy="8" r="2.1" stroke={color} strokeWidth={1.7} />
      <Circle cx="13" cy="16" r="2.1" stroke={color} strokeWidth={1.7} />
    </Svg>
  );
}
