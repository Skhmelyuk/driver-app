import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { IconProps } from './types';

export const MenuIcon: React.FC<IconProps> = ({ size = 24, color = '#ffffff', style }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M3 18H21V16H3V18ZM3 13H21V11H3V13ZM3 6V8H21V6H3Z"
      fill={color}
    />
  </Svg>
);
