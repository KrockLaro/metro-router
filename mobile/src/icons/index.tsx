import React from 'react';
import Svg, { Path, Circle, Rect, Line, G } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
}

export const WheelchairIcon: React.FC<IconProps> = ({ size = 24, color = '#222' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="3.5" r="2" stroke={color} strokeWidth="1.8" />
    <Path d="M12 6.5V13h6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M18 13l1.5 4h-8" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="9" cy="18" r="3" stroke={color} strokeWidth="1.8" />
    <Path d="M12 13l-3 5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

export const WheelchairPartialIcon: React.FC<IconProps> = ({ size = 24, color = '#222' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="3.5" r="2" stroke={color} strokeWidth="1.8" />
    <Path d="M12 6.5V13h6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M18 13l1.5 4h-8" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="9" cy="18" r="3" stroke={color} strokeWidth="1.8" />
    <Path d="M12 13l-3 5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Line x1="3" y1="3" x2="21" y2="21" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

export const WheelchairNoneIcon: React.FC<IconProps> = ({ size = 24, color = '#222' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.8" />
    <Line x1="5" y1="5" x2="19" y2="19" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

export const TicketOfficeIcon: React.FC<IconProps> = ({ size = 24, color = '#222' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 9V7a1 1 0 011-1h16a1 1 0 011 1v2a3 3 0 000 6v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2a3 3 0 000-6z"
      stroke={color} strokeWidth="1.8" strokeLinejoin="round"
    />
    <Line x1="15" y1="8" x2="15" y2="16" stroke={color} strokeWidth="1.8" strokeDasharray="2 2" />
  </Svg>
);

export const TicketMachineIcon: React.FC<IconProps> = ({ size = 24, color = '#222' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="6" y="3" width="12" height="18" rx="2" stroke={color} strokeWidth="1.8" />
    <Rect x="9" y="6" width="6" height="4" rx="1" stroke={color} strokeWidth="1.6" />
    <Line x1="9" y1="14" x2="15" y2="14" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    <Line x1="9" y1="17" x2="12" y2="17" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
  </Svg>
);

export const TurnstileIcon: React.FC<IconProps> = ({ size = 24, color = '#222' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" />
    <Path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

export const WcIcon: React.FC<IconProps> = ({ size = 24, color = '#222' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="6" cy="5" r="1.6" stroke={color} strokeWidth="1.6" />
    <Path d="M6 7v6m0 0v7m0-7l-2 3m2-3l2 3" stroke={color} strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="18" cy="5" r="1.6" stroke={color} strokeWidth="1.6" />
    <Path d="M18 7v5m0 0l-2 8m2-8l2 8" stroke={color} strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const WaitingRoomIcon: React.FC<IconProps> = ({ size = 24, color = '#222' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 11V8a3 3 0 013-3h8a3 3 0 013 3v3"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Path d="M5 11h14v4H5z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    <Line x1="6" y1="15" x2="6" y2="19" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Line x1="18" y1="15" x2="18" y2="19" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

export const WifiIcon: React.FC<IconProps> = ({ size = 24, color = '#222' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 9a15 15 0 0118 0" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Path d="M6 12.5a10 10 0 0112 0" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Path d="M9 16a5 5 0 016 0" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Circle cx="12" cy="19.5" r="1.4" fill={color} />
  </Svg>
);

export const ParkingIcon: React.FC<IconProps> = ({ size = 24, color = '#222' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="18" height="18" rx="4" stroke={color} strokeWidth="1.8" />
    <Path d="M9 17V7h4a3 3 0 010 6H9" stroke={color} strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const BikeRackIcon: React.FC<IconProps> = ({ size = 24, color = '#222' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="5.5" cy="17" r="3" stroke={color} strokeWidth="1.6" />
    <Circle cx="18.5" cy="17" r="3" stroke={color} strokeWidth="1.6" />
    <Path d="M5.5 17l4-9h5l4 9M9.5 8h5M12 8l2.5 9"
      stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const LuggageIcon: React.FC<IconProps> = ({ size = 24, color = '#222' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="4" y="7" width="16" height="12" rx="2" stroke={color} strokeWidth="1.8" />
    <Path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Line x1="9" y1="12" x2="9" y2="15" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Line x1="15" y1="12" x2="15" y2="15" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

export const HelpDeskIcon: React.FC<IconProps> = ({ size = 24, color = '#222' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" />
    <Path d="M9.5 9.5a2.5 2.5 0 015 0c0 1.5-2.5 2-2.5 3.5"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Circle cx="12" cy="16.5" r="1" fill={color} />
  </Svg>
);

export const LiftIcon: React.FC<IconProps> = ({ size = 24, color = '#222' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="4" y="2.5" width="16" height="19" rx="2" stroke={color} strokeWidth="1.8" />
    <Line x1="12" y1="2.5" x2="12" y2="21.5" stroke={color} strokeWidth="1.6" />
    <Path d="M8 10l-2 2 2 2M16 8l2 2-2 2" stroke={color} strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const EscalatorIcon: React.FC<IconProps> = ({ size = 24, color = '#222' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="6" cy="6" r="1.6" stroke={color} strokeWidth="1.6" />
    <Path d="M6 7.5v3l6 5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    <Path d="M12 15.5h6" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    <Path d="M3 19h18" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
  </Svg>
);

export const SearchIcon: React.FC<IconProps> = ({ size = 24, color = '#222' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth="1.8" />
    <Line x1="16.5" y1="16.5" x2="21" y2="21"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

export const CloseIcon: React.FC<IconProps> = ({ size = 24, color = '#222' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="5" y1="5" x2="19" y2="19" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="19" y1="5" x2="5" y2="19" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const SunIcon: React.FC<IconProps> = ({ size = 24, color = '#222' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="4" stroke={color} strokeWidth="1.8" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
      const rad = (deg * Math.PI) / 180;
      const x1 = 12 + Math.cos(rad) * 7, y1 = 12 + Math.sin(rad) * 7;
      const x2 = 12 + Math.cos(rad) * 10, y2 = 12 + Math.sin(rad) * 10;
      return (
        <Line key={deg} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      );
    })}
  </Svg>
);

export const MoonIcon: React.FC<IconProps> = ({ size = 24, color = '#222' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z"
      stroke={color} strokeWidth="1.8" strokeLinejoin="round"
    />
  </Svg>
);

// ============================================================
// НАВИГАЦИЯ МАРШРУТА
// ============================================================

export const BackIcon: React.FC<IconProps> = ({ size = 24, color = '#222' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15 5l-7 7 7 7" stroke={color} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const ChevronLeftIcon: React.FC<IconProps> = ({ size = 24, color = '#222' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15 6l-6 6 6 6" stroke={color} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const ChevronRightIcon: React.FC<IconProps> = ({ size = 24, color = '#222' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 6l6 6-6 6" stroke={color} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ size = 24, color = '#222' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 9l6 6 6-6" stroke={color} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const ShareIcon: React.FC<IconProps> = ({ size = 24, color = '#222' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 3v13M12 3l-4 4M12 3l4 4" stroke={color} strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" stroke={color} strokeWidth="1.8"
      strokeLinecap="round" />
  </Svg>
);