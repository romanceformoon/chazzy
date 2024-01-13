import { suggestAAColorVariant } from 'accessible-colors';
import { backgroundColor } from '../chat/constants';

export const nicknameColors = [
  '#FF0000',
  '#0000FF',
  '#008000',
  '#B22222',
  '#FF7F50',
  '#99CD32',
  '#FF4400',
  '#2E8B56',
  '#DAA520',
  '#D2691E',
  '#5F9EA0',
  '#1E8FFF',
  '#FF69B4',
  '#8A2BE2',
  '#00FF80',
].map((color) => suggestAAColorVariant(color, backgroundColor));
