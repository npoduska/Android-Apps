import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import StockCard from './StockCard';

const StockDataComponent = ({ stocksData, errors, loading }) => {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#214FF3FF" />
        <Text style={styles.loadingText}>Loading stock data...</Text>
      </View>
    );
  }

  if (errors && errors.length > 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorTitle}>Errors occurred while fetching data:</Text>
        {errors.map((error, index) => (
          <Text key={index} style={styles.errorText}>
            {error.symbol}: {error.error}
          </Text>
        ))}
      </View>
    );
  }

  if (!stocksData || stocksData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No stock data available. Press the "Fetch Stock Data" button to load data.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Stock Portfolio</Text>
        {stocksData.map((stockData, index) => (
          <StockCard key={index} stockData={stockData} />
        ))}
      </View>
    </ScrollView>
  );
};

StockDataComponent.propTypes = {
  stocksData: PropTypes.array,
  errors: PropTypes.array,
  loading: PropTypes.bool
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    width: '100%',
  },
  container: {
    width: '100%',
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 5,
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  }
});

export default StockDataComponent;