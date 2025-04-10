import { Stack } from "expo-router";
import { Text, View, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function RootLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007a33', // Medium green from the palette
        },
        headerTintColor: '#FFFFFF', // White text for better contrast
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShadowVisible: false, // Remove shadow for cleaner look
        headerBackVisible: true, // More modern navigation
        headerTitle: () => (
          <View style={{ 
            flexDirection: 'row',
            alignItems: 'center', 
            justifyContent: 'center',
            paddingVertical: 12,
          }}>
            <View style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: '#e0f7f1', // Lightest green from the palette
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 8,
            }}>
              <Text style={{ 
                fontSize: 14, 
                fontWeight: 'bold', 
                color: '#004d00' // Darkest green from the palette
              }}>
                NP
              </Text>
            </View>
            <Text style={{ 
              fontSize: 20, 
              fontWeight: '600', 
              color: '#FFFFFF', // White text
              letterSpacing: 0.5,
            }}>
              Nick's Pick$
            </Text>
          </View>
        ),
        headerTitleAlign: 'center',
        contentStyle: {
          backgroundColor: '#F9F9F9', // Light background for content
          paddingTop: insets.top,
        }
      }}
    />
  );
}