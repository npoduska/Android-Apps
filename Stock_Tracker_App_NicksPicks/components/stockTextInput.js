import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { getApiCallsRemaining } from '../services/stockApiService';

const StockTextInputComponent = ({ onFetchStocks }) => {
  const [apiCallsLeft, setApiCallsLeft] = useState('--');
  
  // Update API calls counter when component mounts and after each fetch
  useEffect(() => {
    // Load the initial value
    setApiCallsLeft(getApiCallsRemaining());
    
    // Set up an interval to periodically check for updates
    const intervalId = setInterval(() => {
      setApiCallsLeft(getApiCallsRemaining());
    }, 5000); // Check every 5 seconds
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);
  
  const handleButtonPress = () => {
    try {
      // Stock symbols we want to fetch
      const stockSymbols = ['ARCC', 'NHI', 'ET', 'MPW', 'EPD'];
      
      console.log(`Fetching data for symbols: ${stockSymbols.join(', ')}`);
      
      // Call the parent component with our symbols
      onFetchStocks(stockSymbols);
      
      // Update API calls left after fetch
      setTimeout(() => {
        setApiCallsLeft(getApiCallsRemaining());
      }, 2000); // Add a small delay to ensure API calls are completed
      
      // Optionally display a success message
      Alert.alert(
        'Success',
        `Retrieving data for ${stockSymbols.length} stocks`,
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to process stock data',
        [{ text: 'OK', style: 'cancel' }]
      );
      console.error('Error handling stock data:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.defaultText}>Default Stocks: ARCC, NHI, ET, MPW, & EPD </Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Fetch Stock Data"
          onPress={handleButtonPress}
          color="#004d00" // Darkest green from the palette
        />
        <Text style={styles.apiCounterText}>
          API Calls Remaining Today: {apiCallsLeft}
        </Text>
      </View>
    </View>
  );
};

StockTextInputComponent.propTypes = {
  onFetchStocks: PropTypes.func.isRequired
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  defaultText: {
    marginBottom: 10,
    fontSize: 16,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  apiCounterText: {
    marginTop: 10,
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  }
});

export default StockTextInputComponent;