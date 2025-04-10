import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from "react-native";

// Define currency type for better type safety
type CurrencyCode = "USD" | "PLN" | "EUR" | "CAD" | "MXN";

// Define the shape of our currency values and rates
type CurrencyValues = {
  [key in CurrencyCode]: string;
};

type CurrencyRates = {
  [key in CurrencyCode]: number;
};

// Props type for input row component
interface CurrencyInputRowProps {
  code: CurrencyCode;
  value: string;
  onChangeText: (value: string) => void;
}

// Props type for rate row component
interface CurrencyRateRowProps {
  base: CurrencyCode;
  target: CurrencyCode;
  rate: string;
}

export default function CurrencyConverter() {
  // State for currency values
  const [values, setValues] = useState<CurrencyValues>({
    USD: "",
    PLN: "",
    EUR: "",
    CAD: "",
    MXN: "",
  });

  // State for conversion rates
  const [rates, setRates] = useState<CurrencyRates>({
    USD: 1,
    PLN: 0,
    EUR: 0,
    CAD: 0,
    MXN: 0,
  });

  // Track which currency was last edited
  const [lastEditedCurrency, setLastEditedCurrency] = useState<CurrencyCode | "">("");
  
  // Button state
  const [isConvertButtonDisabled, setIsConvertButtonDisabled] = useState(true);
  const [isConverting, setIsConverting] = useState(false);
  
  // Loading state
  const [loading, setLoading] = useState(true);

  // Track date of rates
  const [ratesDate, setRatesDate] = useState<string>("");

  // API Key
  const API_KEY = "GET YOUR OWN";

  // Fetch currency rates on component mount
  useEffect(() => {
    fetchRates();
  }, []);

  // Fetch rates from API
  const fetchRates = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.exchangeratesapi.io/v1/latest?access_key=${API_KEY}&symbols=USD,CAD,MXN,PLN`,
        );
      const data = await response.json();
      console.log(data)

      if (!data.success) {
        throw new Error("API returned error: " + (data.error?.info || "Unknown error"));
      }

       // Store the date for display - convert from YYYY-MM-DD to MM/DD/YYYY
      const apiDate = data.date || "Unknown";
      if (apiDate !== "Unknown" && apiDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = apiDate.split('-');
        setRatesDate(`${month}/${day}/${year}`);
      } else {
        setRatesDate(apiDate);
      }
      
       // Check if we have the needed rates
      if (!data.rates || !data.rates.USD) {
        throw new Error("Invalid API response format");
      }

      // Convert EUR base to USD base rates
      // 1. Get USD value in EUR
      const usdInEur = data.rates.USD;
      
      // 2. Calculate all rates with USD as base
      const usdBasedRates: CurrencyRates = {
        USD: 1, // 1 USD = 1 USD
        EUR: 1 / usdInEur, // Convert EUR to USD-based rate
        PLN: data.rates.PLN / usdInEur, // Convert PLN to USD-based rate
        CAD: data.rates.CAD / usdInEur, // Convert CAD to USD-based rate
        MXN: data.rates.MXN / usdInEur, // Convert MXN to USD-based rate
      };
      
      setRates(usdBasedRates);
      console.log(setRates);

      // Extract rates for our currencies
      // setRates({
      //   USD: 1,
      //   PLN: data.usd.pln,
      //   EUR: data.usd.eur,
      //   CAD: data.usd.cad,
      //   MXN: data.usd.mxn,
      // });
      console.log(usdBasedRates)
      console.log(data.date);
      setLoading(false);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch currency rates. Please try again.");
      setLoading(false);
    }
  };

  // Handle input changes with proper types
  const handleInputChange = (currency: CurrencyCode, value: string) => {
    // Only allow numeric input with decimal point
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setValues({
        ...values,
        [currency]: value,
      });
      setLastEditedCurrency(currency);
      setIsConvertButtonDisabled(value === "");
    }
  };

  // Convert currencies based on the last edited currency
  const convertCurrencies = () => {
    if (!lastEditedCurrency || values[lastEditedCurrency] === "") {
      return;
    }

    setIsConverting(true);
    
    const baseValue = parseFloat(values[lastEditedCurrency]);
    const baseRate = rates[lastEditedCurrency];
    
    // Convert to USD first (as our rates are based on USD)
    const valueInUSD = baseValue / baseRate;
    
    // Convert from USD to all other currencies
    const newValues: CurrencyValues = {
      USD: valueInUSD.toFixed(2),
      PLN: (valueInUSD * rates.PLN).toFixed(2),
      EUR: (valueInUSD * rates.EUR).toFixed(2),
      CAD: (valueInUSD * rates.CAD).toFixed(2),
      MXN: (valueInUSD * rates.MXN).toFixed(2),
    };
    
    // Keep the original input value
    newValues[lastEditedCurrency] = values[lastEditedCurrency];
    
    setValues(newValues);
    setIsConvertButtonDisabled(true);
    setIsConverting(false);
  };

  // Clear all values
  const clearValues = () => {
    setValues({
      USD: "",
      PLN: "",
      EUR: "",
      CAD: "",
      MXN: "",
    });
    setIsConvertButtonDisabled(true);
    setLastEditedCurrency("");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007a33" />
        <Text style={styles.loadingText}>Loading exchange rates...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Nick's Currency Converter</Text>
      </View>

      <View style={styles.mainContent}>
        {/* Currency Input Rows */}
        <CurrencyInputRow
          code="USD"
          value={values.USD}
          onChangeText={(value: string) => handleInputChange("USD", value)}
        />
        <CurrencyInputRow
          code="PLN"
          value={values.PLN}
          onChangeText={(value: string) => handleInputChange("PLN", value)}
        />
        <CurrencyInputRow
          code="EUR"
          value={values.EUR}
          onChangeText={(value: string) => handleInputChange("EUR", value)}
        />
        <CurrencyInputRow
          code="CAD"
          value={values.CAD}
          onChangeText={(value: string) => handleInputChange("CAD", value)}
        />
        <CurrencyInputRow
          code="MXN"
          value={values.MXN}
          onChangeText={(value: string) => handleInputChange("MXN", value)}
        />

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.convertButton,
              isConvertButtonDisabled && styles.disabledButton,
            ]}
            onPress={convertCurrencies}
            disabled={isConvertButtonDisabled}
          >
            {isConverting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Convert Currency</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.clearButton]}
            onPress={clearValues}
          >
            <Text style={styles.buttonText}>Clear</Text>
          </TouchableOpacity>
        </View>

        {/* Current Conversion Rates */}
        <View style={styles.ratesContainer}>
          <Text style={styles.ratesHeader}>Conversion Rates ({ratesDate})</Text>
          <CurrencyRateRow base="USD" target="PLN" rate={rates.PLN.toFixed(3)} />
          <CurrencyRateRow base="USD" target="EUR" rate={rates.EUR.toFixed(3)} />
          <CurrencyRateRow base="USD" target="CAD" rate={rates.CAD.toFixed(3)} />
          <CurrencyRateRow base="USD" target="MXN" rate={rates.MXN.toFixed(3)} />
        </View>
      </View>
    </SafeAreaView>
  );
}

// Component for individual currency input row
function CurrencyInputRow({ code, value, onChangeText }: CurrencyInputRowProps) {
  return (
    <View style={styles.inputRow}>
      <Text style={styles.currencyCode}>{code}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
        placeholder="0.00"
      />
    </View>
  );
}

// Component for conversion rate display row
function CurrencyRateRow({ base, target, rate }: CurrencyRateRowProps) {
  return (
    <View style={styles.rateRow}>
      <Text style={styles.rateText}>
        1 {base} = {rate} {target}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    backgroundColor: "#007a33",
    padding: 15,
    alignItems: "flex-start",
  },
  headerText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  mainContent: {
    flex: 1,
    padding: 20,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  currencyCode: {
    width: 60,
    fontSize: 18,
    fontWeight: "bold",
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "white",
    paddingHorizontal: 10,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  button: {
    flex: 1,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    margin: 5,
  },
  convertButton: {
    backgroundColor: "#8BC34A",
  },
  clearButton: {
    backgroundColor: "#66b3a1",
  },
  disabledButton: {
    backgroundColor: "#CCCCCC",
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  ratesContainer: {
    marginTop: 10,
  },
  ratesHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  rateRow: {
    marginBottom: 10,
  },
  rateText: {
    fontSize: 16,
  },
});