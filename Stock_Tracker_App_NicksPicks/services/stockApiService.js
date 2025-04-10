import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALPHA_VANTAGE_API_KEY } from '@env';
import Constants from 'expo-constants';
// const ALPHA_VANTAGE_API_KEY = Constants.expoConfig.extra.apiKey;

// Keys for storage
const API_CALLS_KEY = 'alphavantage_api_calls_remaining';
const RESET_DATE_KEY = 'alphavantage_reset_date';

// Initialize API calls tracking
let apiCallsRemaining = 25; // Default starting value

// Load the saved API call count on import
const initializeApiCallCounter = async () => {
  try {
    // Get the stored reset date
    const storedResetDateStr = await AsyncStorage.getItem(RESET_DATE_KEY);
    const today = new Date().toDateString();
    
    // Check if we need to reset the counter (new day)
    if (!storedResetDateStr || storedResetDateStr !== today) {
      // It's a new day, reset the counter
      apiCallsRemaining = 25;
      await AsyncStorage.setItem(API_CALLS_KEY, String(apiCallsRemaining));
      await AsyncStorage.setItem(RESET_DATE_KEY, today);
      console.log('API call counter reset for new day:', today);
    } else {
      // Same day, load the saved count
      const savedCount = await AsyncStorage.getItem(API_CALLS_KEY);
      if (savedCount !== null) {
        apiCallsRemaining = parseInt(savedCount, 10);
        console.log('Loaded API calls remaining:', apiCallsRemaining);
      }
    }
  } catch (error) {
    console.error('Error initializing API call counter:', error);
  }
};

// Call this function when the module is loaded
initializeApiCallCounter();

// Update the counter in memory and storage
const updateApiCallsRemaining = async (calls) => {
  apiCallsRemaining = calls;
  try {
    await AsyncStorage.setItem(API_CALLS_KEY, String(apiCallsRemaining));
  } catch (error) {
    console.error('Error saving API call count:', error);
  }
};

export const getApiCallsRemaining = () => {
  return apiCallsRemaining;
};

export const fetchStockData = async (symbol) => {
  console.log(`Processing stock symbol: ${symbol}`);
  // Enhanced validation for stock symbols
  if (!symbol || typeof symbol !== 'string') {
    throw new Error('Invalid stock symbol: Symbol must be a string');
  }
  
  // Trim whitespace
  symbol = symbol.trim();
  
  if (symbol === '') {
    throw new Error('Invalid stock symbol: Symbol cannot be empty');
  }
  
  // Validate symbol format (standard US stock symbols are 1-5 uppercase letters)
  const validSymbolPattern = /^[A-Z]{1,5}$/;
  if (!validSymbolPattern.test(symbol)) {
    throw new Error('Invalid stock symbol format: Must be 1-5 uppercase letters');
  }
  
  // Optional: Whitelist approach - only allow specific symbols
  const allowedSymbols = ['ARCC', 'NHI', 'ET', 'MPW', 'EPD'];
  if (!allowedSymbols.includes(symbol)) {
    throw new Error(`Invalid stock symbol: ${symbol} is not in the allowed list`);
  }
  
  // Validate symbol
  if (!symbol || symbol.trim() === '') {
    throw new Error('Invalid stock symbol');
  }

  if (!ALPHA_VANTAGE_API_KEY) {
    throw new Error('API key not configured');
  }

  try {
    // Fetch data from Alpha Vantage API
    const timeSeriesUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const dividendUrl = `https://www.alphavantage.co/query?function=DIVIDENDS&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const overviewUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    
    // Decrement the API call counter for each call (3 calls per stock)
    const newCount = Math.max(0, apiCallsRemaining - 3);
    await updateApiCallsRemaining(newCount);

    // Fetch all data concurrently
    const [timeSeriesResponse, dividendResponse, overviewResponse] = await Promise.all([
      fetch(timeSeriesUrl),
      fetch(dividendUrl),
      fetch(overviewUrl)
    ]);
    
    // Parse responses to JSON
    const timeSeriesData = await timeSeriesResponse.json();
    const dividendData = await dividendResponse.json();
    const commonData = await overviewResponse.json();

    // Extract time series data
    const timeSeries = timeSeriesData['Time Series (Daily)'];
    if (!timeSeries) {
      throw new Error(`No stock data available for ${symbol}`);
    }
    
    // Extract dividend data
    const dividendSeries = dividendData['data'];
    if (!dividendSeries) {
      throw new Error(`No dividend data available for ${symbol}`);
    }

    // Extract Company Name
    const companyName = commonData["Name"];
    if (!companyName) {
      throw new Error(`No company name available for ${symbol}`);
    }

    // Extract the fiscal year end month
    const fiscalYearEnd = commonData["FiscalYearEnd"];
    if (!fiscalYearEnd) {
      throw new Error(`No fiscalYearEnd data available for ${symbol}`);
    }

    // Extract and Format latestQuarter date
    const formattedlatestQuarter = new Date(commonData['LatestQuarter']).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });

    // Get dates in order
    const dates = Object.keys(timeSeries).sort((a, b) => new Date(b) - new Date(a));

    // Check if we have enough historical data
    if (dates.length < 4) {
      throw new Error(`Insufficient historical data for ${symbol}`);
    }

    // Extract latest stock data
    const latestData = timeSeries[dates[0]];
    
    // Get the first dividend data entry (most recent)
    const latestDividendData = dividendSeries[0];
    
    // Format current price
    const currentPrice = `${parseFloat(latestData['4. close']).toFixed(2)}`;

    //Buy In prices
    const prices = {
      ARCC: '20.00',
      ET: '17.00',
      MPW: '5.70',
      EPD: '33.00',
      NHI: '73.00'
    };
    const buyInPrice = prices[symbol] || '0.00';

    //Most recent Buy In prices
    const buyDates = {
      ARCC: "04/03/2025",
      ET: "03/10/2025",
      MPW: "03/11/2025",
      EPD: "03/11/2025",
      NHI: "04/23/2021"
    };
    const buyInDate = buyDates[symbol] || 'unknown';

    // Format past 3 trading day lows with dates
    const pastThreeDays = dates.slice(1, 4).map(date => {
      const formattedDate = new Date(date).toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      });
      return {
        date: formattedDate,
        low: `${parseFloat(timeSeries[date]['3. low']).toFixed(2)}`
      };
    });

    // Calculate trending using Simple Moving Averages (SMA)
    const lowPrices = dates.slice(0, 50).map(date => parseFloat(timeSeries[date]['3. low']));
    const shortSma = lowPrices.slice(0, 20).reduce((a, b) => a + b, 0) / 20;
    const longSma = lowPrices.reduce((a, b) => a + b, 0) / 50;
    const trending = shortSma > longSma ? "Upward" : "Downward";

    // Calculate volume change
    const volumes = dates.slice(0, 50).map(date => parseInt(timeSeries[date]['5. volume']));
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / 50;
    const latestVolume = parseInt(latestData['5. volume']);
    const volumeChange = ((latestVolume - avgVolume) / Math.abs(avgVolume)) * 100;
    const formattedVolumeChange = `${volumeChange.toFixed(1)}%`;

    // Create dividend info object
    const dividendInfo = {
      amount: `$${parseFloat(latestDividendData['amount']).toFixed(2)}`,
      yield:  `${parseFloat(commonData['DividendYield']).toFixed(4)*100}%`,
      exDividendDate: new Date(latestDividendData['ex_dividend_date']).toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      }),
      declarationDate: new Date(latestDividendData['declaration_date']).toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      }),
      recordDate: new Date(latestDividendData['record_date']).toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      }),
      paymentDate: new Date(latestDividendData['payment_date']).toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      })
    };

    return {
      symbol,
      currentPrice,
      buyInPrice,
      buyInDate,
      pastThreeDaysLows: pastThreeDays,
      trending,
      volumeChange: formattedVolumeChange,
      dividendInfo,
      companyName,
      fiscalYearEnd,
      latestQuarter: formattedlatestQuarter
    };
  } catch (error) {
    console.error(`Error processing stock data for ${symbol}:`, error.message);
    throw error;
  }
};

// Function to fetch data for multiple stocks
export const fetchMultipleStocks = async (symbols) => {
  // Validate symbols array
  if (!Array.isArray(symbols)) {
    throw new Error('Invalid input: Symbols must be provided as an array');
  }
  
  // Validate array isn't empty
  if (symbols.length === 0) {
    throw new Error('Invalid input: No stock symbols provided');
  }
  
  // Validate array size (prevent too many API calls)
  if (symbols.length > 10) {
    throw new Error('Invalid input: Too many stock symbols (maximum 10)');
  }
  
  const stocksData = [];
  const errors = [];

  // Process each symbol
  for (const symbol of symbols) {
    try {
      const data = await fetchStockData(symbol);
      stocksData.push(data);
    } catch (error) {
      errors.push({ symbol, error: error.message });
    }
  }

  return { stocksData, errors };
};