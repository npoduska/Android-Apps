import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';

const StockCard = ({ stockData }) => {
  const handleGetNews = () => {
    if (!stockData?.companyName || !stockData?.symbol) return;
    
    // Create the search query for Perplexity.ai
    const searchQuery = `What is the latest news (past 6 weeks) of ${stockData.symbol} ${stockData.companyName}?`;
    
    // Encode the query for use in URL
    const encodedQuery = encodeURIComponent(searchQuery);
    
    // Create the Perplexity URL with the pre-filled query
    const perplexityUrl = `https://www.perplexity.ai/?q=${encodedQuery}`;
    
    // Open the URL in the device's default browser
    Linking.openURL(perplexityUrl).catch(err => 
      console.error('Error opening Perplexity in browser:', err)
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{stockData.companyName} ({stockData.symbol})</Text>
        <TouchableOpacity 
          style={styles.newsButton} 
          onPress={handleGetNews}
        >
          <Text style={styles.newsButtonText}>Get News</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.dataRow}>
        <Text style={styles.label}>Current Price:  </Text>
        <Text style={styles.value}>${stockData.currentPrice}</Text>
      </View>
      <View style={styles.dataRow}>
        <Text style={styles.label}>Buy-in Price: </Text>
        <Text style={styles.value}>${stockData.buyInPrice}</Text>
      </View>
      <View style={styles.dataRow}>
        <Text style={styles.label}>Last Buy-in Date: </Text>
        <Text style={styles.value}>{stockData.buyInDate}</Text>
      </View>
      <View style={styles.dataRow}>
        <Text style={styles.label}>Past 3 Trading Day Lows:</Text>
        {stockData.pastThreeDaysLows.map((day, index) => (
          <Text key={index} style={styles.value}>
            {day.date}: ${day.low}
          </Text>
        ))}
      </View>
      <View style={styles.dataRow}>
        <Text style={styles.label}>Trending:  </Text>
        <Text style={styles.value}>{stockData.trending}</Text>
      </View>
      <View style={styles.dataRow}>
        <Text style={styles.label}>Volume Change:  </Text>
        <Text style={styles.value}>{stockData.volumeChange}</Text>
      </View>
      <View style={styles.dataRow}>
        <Text style={styles.label}>Fiscal Year End:  </Text>
        <Text style={styles.value}>{stockData.fiscalYearEnd}</Text>
      </View>
      <View style={styles.dataRow}>
        <Text style={styles.label}>Latest Quarter:  </Text>
        <Text style={styles.value}>{stockData.latestQuarter}</Text>
      </View>
      {stockData.dividendInfo && (
        <View style={styles.dividendSection}>
          <Text style={styles.dividendTitle}>Latest Dividend Information</Text>
          <View style={styles.dataRow}>
            <Text style={styles.label}>Amount:  </Text>
            <Text style={styles.value}>{stockData.dividendInfo.amount}</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.label}>Dividend Yield:  </Text>
            <Text style={styles.value}>{stockData.dividendInfo.yield}</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.label}>Ex-Dividend Date:  </Text>
            <Text style={styles.value}>{stockData.dividendInfo.exDividendDate}</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.label}>Declaration Date:  </Text>
            <Text style={styles.value}>{stockData.dividendInfo.declarationDate}</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.label}>Record Date:  </Text>
            <Text style={styles.value}>{stockData.dividendInfo.recordDate}</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.label}>Payment Date:  </Text>
            <Text style={styles.value}>{stockData.dividendInfo.paymentDate}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

StockCard.propTypes = {
  stockData: PropTypes.object.isRequired
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  newsButton: {
    backgroundColor: '#66b3a1', // Teal green from the palette
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginLeft: 10,
    width: '28%', // approximately 25-30% width
  },
  newsButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  dataRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
    color: '#007a33', // Medium green for labels
  },
  value: {
    marginLeft: 5,
  },
  dividendSection: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#b2e0d4', // Light green for border
    paddingTop: 10,
  },
  dividendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#004d00', // Darkest green for section title
  }
});

export default StockCard;