import { MaterialCommunityIcons } from "@expo/vector-icons";
import { DimensionValue } from "react-native";

export interface IMenuButtonProps {
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color?: string;      // Cor do ícone
  onPress: () => void;
  width?: DimensionValue;
  bgColor?: string;   // Fundo do ícone (o "glow")
  textColor?: string; // Cor da letra
}