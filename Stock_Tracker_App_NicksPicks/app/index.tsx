import React, { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import StockTextInputComponent from '../components/stockTextInput';
import StockDataComponent from '../components/stockData';
import { fetchMultipleStocks } from '../services/stockApiService';

// Define interfaces for your data types
interface StockData {
  symbol: string;
  currentPrice: string;
  buyInPrice: string;
  buyInDate: string;
  pastThreeDaysLows: { date: string; low: string; }[];
  trending: string;
  volumeChange: string;
  dividendInfo: {
    amount: string;
    yield: string;
    exDividendDate: string;
    declarationDate: string;
    recordDate: string;
    paymentDate: string;
  };
  companyName: string;
  fiscalYearEnd: string;
  latestQuarter : string;
  // Add any other properties as needed
}

interface ErrorData {
  symbol: string;
  error: string;
}

const App = () => {
  // Properly type your state variables
  const [stocksData, setStocksData] = useState<StockData[]>([]);
  const [errors, setErrors] = useState<ErrorData[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFetchStocks = async (symbols: string[]) => {
    try {
      setLoading(true);
      setErrors([]);
      
      const result = await fetchMultipleStocks(symbols);
      
      setStocksData(result.stocksData);
      setErrors(result.errors);
    } catch (error: any) {
      console.error('Error fetching stocks:', error);
      setErrors([{ symbol: 'GENERAL', error: error.message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StockTextInputComponent onFetchStocks={handleFetchStocks} />
      <StockDataComponent 
        stocksData={stocksData} 
        errors={errors} 
        loading={loading} 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5FCFF',
  },
});

export default App;