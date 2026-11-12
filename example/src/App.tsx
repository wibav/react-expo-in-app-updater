import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { checkForUpdate, UpdateFlow } from 'react-expo-in-app-updater';

export default function App() {
  const [updateAvailable, setUpdateAvailable] = useState('');

  useEffect(() => {
    getData();
  }, []);

  async function getData() {
    try {
      const result = await checkForUpdate(UpdateFlow.FLEXIBLE);
      setUpdateAvailable(result);
    } catch (e: any) {
      setUpdateAvailable(`${e?.code}: ${e?.message}`);
    }
  }

  return (
    <View style={styles.container}>
      <Text>{updateAvailable}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 80 },
});
