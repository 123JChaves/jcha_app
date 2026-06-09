import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { IMenuButtonProps } from '../@types/interfaces/IMenuButtonProps';

export const MenuButtons = ({ title, icon, onPress, width = '47%' }: IMenuButtonProps) => {
  // Define se o ícone deve usar o padrão WhatsApp ou o padrão Moove (Preto/Dourado)
  const isWhatsApp = icon === 'whatsapp';
  const iconColor = isWhatsApp ? '#25D366' : '#111';
  const glowColor = isWhatsApp ? 'rgba(37, 211, 102, 0.3)' : '#D4AF37';

  return (
    <TouchableOpacity style={[styles.card, { width }]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconWrapper}>
        <MaterialCommunityIcons 
          name={icon} 
          size={32} 
          color={iconColor} 
          style={[
            styles.iconGlow, 
            { 
                shadowColor: glowColor, 
                textShadowColor: isWhatsApp ? 'transparent' : 'rgba(212, 175, 55, 0.5)' 
            }
          ]} 
        />
      </View>
      <Text style={styles.cardText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    paddingVertical: 25,
    borderRadius: 18,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f2f2f2',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  iconWrapper: {
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconGlow: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    // Efeito para Android
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  cardText: {
    color: '#111',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
});