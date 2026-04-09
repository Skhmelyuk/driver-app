import React from 'react';
import Svg, { Path, G, Mask, Rect } from 'react-native-svg';
import { IconProps } from './types';

export const DoubleArrowIcon: React.FC<IconProps> = ({ size = 32, color = '#ffffff', style }) => (
  <Svg width={size} height={size} viewBox="0 0 50 50" fill="none" style={style}>
    <Path
      d="M39.583 37.3936L24.9997 26.9769L10.4163 37.3936L10.4163 32.2894L24.9997 21.8727L39.583 32.2894L39.583 37.3936ZM39.583 24.9977L24.9997 14.5811L10.4163 24.9977L10.4163 19.8936L24.9997 9.4769L39.583 19.8936L39.583 24.9977Z"
      fill={color}
    />
  </Svg>
);
