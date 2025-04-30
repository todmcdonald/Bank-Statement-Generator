import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import './App.css';

const BankStatementGenerator = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  
  // Add a ref for PDF export
  const statementRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);

  // PDF export function
  const generatePDF = async () => {
    if (!statements || statements.length === 0) return;
    
    // Show loading indicator
    setIsExporting(true);
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    let pageIndex = 0;
    
    // Loop through all accounts and their statements
    for (let accIndex = 0; accIndex < statements.length; accIndex++) {
      const account = statements[accIndex];
      
      for (let stmtIndex = 0; stmtIndex < account.statements.length; stmtIndex++) {
        // Set the current view to this statement
        setActiveAccount(accIndex);
        setActiveMonth(stmtIndex);
        
        // Give React time to update the DOM
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Capture the statement as an image
        const canvas = await html2canvas(statementRef.current, {
          scale: 2,
          logging: false,
          useCORS: true
        });
        
        // Add a new page for all but the first statement
        if (pageIndex > 0) {
          pdf.addPage();
        }
        
        // Add the image to the PDF
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210; // A4 width in mm
        const imgHeight = canvas.height * imgWidth / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pageIndex++;
      }
    }
    
    // Hide loading indicator
    setIsExporting(false);
    
    // Download the PDF
    pdf.save('bank_statements.pdf');
  };

  // Format currency values
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  // Format amount in words for checks (e.g. "One hundred twenty-three and 45/100")
  const formatAmountInWords = (amount) => {
    if (amount === undefined || amount === null) return 'Zero and 00/100';
    
    const dollars = Math.floor(amount);
    const cents = Math.round((amount - dollars) * 100);
    
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
      'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    
    const numToWords = (num) => {
      if (num === 0) return 'zero';
      if (num < 20) return ones[num];
      
      const digit = num % 10;
      if (num < 100) return tens[Math.floor(num / 10)] + (digit ? '-' + ones[digit] : '');
      
      if (num < 1000) {
        return ones[Math.floor(num / 100)] + ' hundred' + (num % 100 ? ' ' + numToWords(num % 100) : '');
      }
      
      if (num < 1000000) {
        return numToWords(Math.floor(num / 1000)) + ' thousand' + (num % 1000 ? ' ' + numToWords(num % 1000) : '');
      }
      
      return numToWords(Math.floor(num / 1000000)) + ' million' + (num % 1000000 ? ' ' + numToWords(num % 1000000) : '');
    };
    
    let result = '';
    if (dollars > 0) {
      result = numToWords(dollars);
      // Capitalize first letter
      result = result.charAt(0).toUpperCase() + result.slice(1);
    } else {
      result = 'Zero';
    }
    
    // Format cents with leading zero if needed
    const centsFormatted = cents < 10 ? `0${cents}` : `${cents}`;
    
    return `${result} and ${centsFormatted}/100`;
  };
  
  // Generate a random payee for checks
  const generateRandomPayee = () => {
    const businesses = [
      "ABC Property Management",
      "Reliable Auto Repair", 
      "City Water & Power",
      "Johnson Dental Group",
      "Smith's Landscaping",
      "QuickMart Groceries",
      "Metropolitan Gas Company",
      "Express Delivery Service",
      "Westside Medical Center",
      "Premier Insurance Agency",
      "Quality Home Services",
      "First National Mortgage",
      "United Health Partners",
      "Tech Solutions Inc.",
      "Elite Fitness Center",
      "Green Valley Landscaping",
      "Sunrise Property Management",
      "Franklin Tax Services",
      "City Plumbing & Electric",
      "Capital Auto Insurance",
      "Northwest Dental Associates",
      "Golden State Utilities",
      "Westview Professional Center",
      "Heritage Financial Advisors",
      "Parkside Medical Group",
      "Neighborhood Hardware Store",
      "Riverside Educational Services",
      "Bayside Legal Consultants",
      "Oakwood Home Inspection",
      "Core Fitness & Wellness",
      "Precision Automotive Repair",
      "Valley View Property Rentals",
      "Eastside Grocery Cooperative",
      "Alpine Insurance Services",
      "Clearwater Plumbing Solutions",
      "Modern Office Supplies",
      "Evergreen Lawn Care",
      "Lakeview Pediatric Center",
      "Ocean Breeze Cleaning Services",
      "Summit Contractors Association"
    ];
    
    return businesses[Math.floor(Math.random() * businesses.length)];
  };
  
  // Generate a random invoice number for check memos
  const generateRandomInvoice = () => {
    const invoiceNum = Math.floor(Math.random() * 90000) + 10000;
    return `Invoice #${invoiceNum}`;
  };

  // Generate a random merchant name with location
  const generateRandomMerchant = (location = null) => {
    // WA cities
    const waCities = [
      "Seattle, WA",
      "Tacoma, WA",
      "Bellevue, WA",
      "Kent, WA",
      "Everett, WA",
      "Renton, WA",
      "Auburn, WA",
      "Redmond, WA",
      "Lakewood, WA",
      "Federal Way, WA",
      "Bothell, WA",
      "Edmonds, WA",
      "Issaquah, WA",
      "Lynnwood, WA",
      "Puyallup, WA",
      "Bremerton, WA",
      "Olympia, WA",
      "Shoreline, WA",
      "Sammamish, WA",
      "Burien, WA",
      "Kirkland, WA",
      "Mukilteo, WA",
      "Gig Harbor, WA"
    ];
    
    // Travel destinations
    const travelDestinations = [
      "Portland, OR",
      "San Francisco, CA",
      "Los Angeles, CA",
      "Las Vegas, NV",
      "Phoenix, AZ",
      "Denver, CO",
      "Chicago, IL",
      "New York, NY",
      "Boston, MA",
      "Miami, FL",
      "Honolulu, HI"
    ];
    
    // Retailers
    const retailers = [
      "Walmart",
      "Target",
      "Costco Wholesale",
      "Home Depot",
      "Kroger",
      "Fred Meyer",
      "QFC",
      "Whole Foods",
      "Safeway",
      "Best Buy",
      "Lowe's",
      "Trader Joe's",
      "Bartell Drugs",
      "PCC Community Markets",
      "Metropolitan Market"
    ];
    
    // Restaurants
    const restaurants = [
      "Starbucks",
      "McDonald's",
      "Subway",
      "Dick's Drive-In",
      "Ivar's",
      "Taco Time",
      "Applebee's",
      "Red Robin",
      "Anthony's",
      "The Ram",
      "MOD Pizza",
      "Panera Bread",
      "Chipotle",
      "Taco Bell",
      "Red Lobster"
    ];
    
    // Gas stations
    const gasStations = [
      "Shell",
      "Exxon",
      "Chevron",
      "BP",
      "76",
      "ARCO",
      "Mobil",
      "Conoco",
      "Texaco",
      "Safeway Gas",
      "Costco Gas",
      "Fred Meyer Gas",
      "AM/PM",
      "Circle K",
      "7-Eleven"
    ];
    
    // Travel-specific merchants
    const hotels = [
      "Marriott Hotel",
      "Hilton Hotel",
      "Hyatt Hotel",
      "Sheraton Hotel",
      "Holiday Inn",
      "Best Western",
      "Westin Hotel",
      "Doubletree Hotel",
      "Courtyard Hotel",
      "Motel 6"
    ];
    
    const travelServices = [
      "Uber",
      "Lyft",
      "Taxi Service",
      "Shuttle Express",
      "Airport Parking",
      "AVIS Rent-A-Car",
      "Enterprise Car Rental",
      "Hertz Car Rental",
      "Alaska Airlines",
      "Delta Airlines",
      "United Airlines",
      "American Airlines",
      "Southwest Airlines",
      "Amtrak"
    ];
    
    const attractions = [
      "Museum of Art",
      "Science Center",
      "National Park",
      "Zoo Admission",
      "Aquarium",
      "Theme Park",
      "Concert Venue",
      "Movie Theater",
      "Broadway Show",
      "Tour Service"
    ];
    
    // Choose a random city or use the provided one
    const city = location || waCities[Math.floor(Math.random() * waCities.length)];
    
    // Choose merchant type
    const merchantType = Math.random();
    let merchantList;
    
    // If this is a travel location, occasionally use travel-specific merchants
    if (location && !waCities.includes(location)) {
      const travelMerchantType = Math.random();
      
      if (travelMerchantType < 0.25) {
        // 25% hotels when traveling
        merchantList = hotels;
      } else if (travelMerchantType < 0.5) {
        // 25% transportation services when traveling
        merchantList = travelServices;
      } else if (travelMerchantType < 0.65) {
        // 15% attractions when traveling
        merchantList = attractions;
      } else if (travelMerchantType < 0.8) {
        // 15% restaurants when traveling
        merchantList = restaurants;
      } else {
        // 20% regular retail/gas when traveling
        merchantList = merchantType < 0.5 ? retailers : gasStations;
      }
    } else {
      // Normal merchant distribution for home region
      if (merchantType < 0.4) {
        // 40% retailers
        merchantList = retailers;
      } else if (merchantType < 0.7) {
        // 30% restaurants
        merchantList = restaurants;
      } else {
        // 30% gas stations
        merchantList = gasStations;
      }
    }
    
    // Select a random merchant and combine with city
    const merchant = merchantList[Math.floor(Math.random() * merchantList.length)];
    return `${merchant} - ${city}`;
  };
  
  // Generate travel transactions for a specific destination and date range
  const generateTravelCluster = (statement, startDay, travelLocation, duration = 3) => {
    // Ensure the travel fits within the month
    const daysInMonth = new Date(statement.year, statement.month + 1, 0).getDate();
    const endDay = Math.min(startDay + duration, daysInMonth);
    
    // Generate a sequence of travel transactions
    const transactions = [];
    
    // First, add outbound transportation
    const departureDay = startDay;
    const departureDate = `${statement.month+1}/${departureDay}/${statement.year}`;
    
    // Choose airline, train, or driving
    const transportType = Math.random();
    if (transportType < 0.7) {
      // 70% chance of flying
      const airlines = ["Alaska Airlines", "Delta Airlines", "United Airlines", "American Airlines", "Southwest Airlines"];
      const airline = airlines[Math.floor(Math.random() * airlines.length)];
      const airfare = parseFloat((Math.random() * 400 + 200).toFixed(2)); // $200-$600 airfare
      
      transactions.push({
        date: departureDate,
        description: `PURCHASE - ${airline} - Seattle, WA`,
        amount: -airfare,
        balance: 0, // Will be calculated later
        travelRelated: true
      });
    } else if (transportType < 0.9) {
      // 20% chance of renting a car
      const rentalCompanies = ["AVIS Rent-A-Car", "Enterprise Car Rental", "Hertz Car Rental"];
      const company = rentalCompanies[Math.floor(Math.random() * rentalCompanies.length)];
      const rentalCost = parseFloat((Math.random() * 200 + 100).toFixed(2)); // $100-$300 rental
      
      transactions.push({
        date: departureDate,
        description: `PURCHASE - ${company} - Seattle, WA`,
        amount: -rentalCost,
        balance: 0, // Will be calculated later
        travelRelated: true
      });
    } else {
      // 10% chance of train
      const trainCost = parseFloat((Math.random() * 150 + 75).toFixed(2)); // $75-$225 train ticket
      
      transactions.push({
        date: departureDate,
        description: `PURCHASE - Amtrak - Seattle, WA`,
        amount: -trainCost,
        balance: 0, // Will be calculated later
        travelRelated: true
      });
    }
    
    // Add hotel at destination
    const hotelCheckInDay = startDay;
    const hotelCheckInDate = `${statement.month+1}/${hotelCheckInDay}/${statement.year}`;
    const hotels = ["Marriott Hotel", "Hilton Hotel", "Hyatt Hotel", "Sheraton Hotel", "Holiday Inn"];
    const hotel = hotels[Math.floor(Math.random() * hotels.length)];
    const hotelCost = parseFloat((Math.random() * 200 + 100).toFixed(2)); // $100-$300 per night
    
    transactions.push({
      date: hotelCheckInDate,
      description: `PURCHASE - ${hotel} - ${travelLocation}`,
      amount: -hotelCost * (endDay - startDay),
      balance: 0, // Will be calculated later
      travelRelated: true
    });
    
    // Add local transportation
    for (let day = startDay; day <= endDay; day++) {
      // 70% chance of local transportation each day
      if (Math.random() < 0.7) {
        const transDate = `${statement.month+1}/${day}/${statement.year}`;
        const transportServices = ["Uber", "Lyft", "Taxi Service"];
        const service = transportServices[Math.floor(Math.random() * transportServices.length)];
        const fare = parseFloat((Math.random() * 40 + 10).toFixed(2)); // $10-$50 ride
        
        transactions.push({
          date: transDate,
          description: `PURCHASE - ${service} - ${travelLocation}`,
          amount: -fare,
          balance: 0, // Will be calculated later
          travelRelated: true
        });
      }
    }
    
    // Add meals and attractions throughout the trip
    for (let day = startDay; day <= endDay; day++) {
      // 1-3 transactions per day while traveling
      const dailyTransactions = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < dailyTransactions; i++) {
        const transDate = `${statement.month+1}/${day}/${statement.year}`;
        const transactionType = Math.random();
        
        if (transactionType < 0.6) {
          // 60% restaurants
          const amount = parseFloat((Math.random() * 80 + 20).toFixed(2)); // $20-$100 meal
          transactions.push({
            date: transDate,
            description: `POS PURCHASE - ${generateRandomMerchant(travelLocation)}`,
            amount: -amount,
            balance: 0, // Will be calculated later
            travelRelated: true
          });
        } else if (transactionType < 0.9) {
          // 30% attractions/entertainment
          const attractions = ["Museum of Art", "Science Center", "Zoo Admission", "Aquarium", "Theme Park", "Movie Theater"];
          const attraction = attractions[Math.floor(Math.random() * attractions.length)];
          const amount = parseFloat((Math.random() * 60 + 15).toFixed(2)); // $15-$75 attraction
          
          transactions.push({
            date: transDate,
            description: `PURCHASE - ${attraction} - ${travelLocation}`,
            amount: -amount,
            balance: 0, // Will be calculated later
            travelRelated: true
          });
        } else {
          // 10% shopping
          const amount = parseFloat((Math.random() * 100 + 25).toFixed(2)); // $25-$125 shopping
          transactions.push({
            date: transDate,
            description: `POS PURCHASE - ${generateRandomMerchant(travelLocation)}`,
            amount: -amount,
            balance: 0, // Will be calculated later
            travelRelated: true
          });
        }
      }
    }
    
    // Return all travel transactions to be added to the statement
    return transactions;
  }

  // State for configuration
  const [config, setConfig] = useState({
    statementYear: currentYear,
    statementMonth: currentMonth,
    statementCount: 3,
    accountCounts: {
      checking: 1,
      savings: 1,
      credit: 1
    },
    transferFrequency: 'medium', // 'none', 'low', 'medium', 'high'
    accounts: []
  });
  
  // State for generated data
  const [statements, setStatements] = useState(null);
  const [activeAccount, setActiveAccount] = useState(0);
  const [activeMonth, setActiveMonth] = useState(0);
  
  // Create account configuration
  const createAccount = (type, index) => {
    // Default balances
    const defaultBalances = {
      checking: 1500.00,
      savings: 5000.00,
      credit: 500.00
    };
    
    // Default transaction counts per month
    const defaultTransactions = {
      checking: 100,
      savings: 2,
      credit: 25
    };
    
    // Default names/numbers
    const defaultName = type.charAt(0).toUpperCase() + type.slice(1) + ` Account`;
    const defaultNumber = type === 'credit' 
      ? `4111-1111-2222-${3333 + index}` 
      : `123-456-${7890 + index}`;
    
    return {
      type,
      index,
      accountId: `${type}-${index}`,
      accountName: defaultName,
      accountHolder: "John Smith",
      accountNumber: defaultNumber,
      initialBalance: defaultBalances[type],
      creditLimit: type === 'credit' ? 5000.00 : null,
      transactionsPerMonth: defaultTransactions[type]
    };
  };
  
  // Handle account count changes
  const handleAccountCountChange = (type, value) => {
    const newCount = parseInt(value, 10);
    
    // Set limits
    const limits = {
      checking: [0, 3],
      savings: [0, 2],
      credit: [0, 2]
    };
    
    // Validate against limits
    const validatedCount = Math.max(limits[type][0], Math.min(limits[type][1], newCount));
    
    setConfig(prev => ({
      ...prev,
      accountCounts: {
        ...prev.accountCounts,
        [type]: validatedCount
      }
    }));
  };
  
  // Update account configuration
  const handleAccountChange = (index, field, value) => {
    const newAccounts = [...config.accounts];
    
    // Handle numerical fields
    if (['initialBalance', 'creditLimit', 'transactionsPerMonth'].includes(field)) {
      value = parseInt(value, 10) || 0;
      
      // Apply constraints based on field type
      if (field === 'transactionsPerMonth') {
        const accountType = newAccounts[index].type;
        const min = accountType === 'savings' ? 1 : (accountType === 'checking' ? 5 : 3);
        const max = accountType === 'savings' ? 15 : (accountType === 'checking' ? 200 : 50);
        value = Math.max(min, Math.min(max, value));
      }
    }
    
    newAccounts[index] = {
      ...newAccounts[index],
      [field]: value
    };
    
    setConfig(prev => ({
      ...prev,
      accounts: newAccounts
    }));
  };
  
  // Format month name
  const formatMonth = (monthIndex) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthIndex];
  };
  
  // Initialize accounts based on counts
  useEffect(() => {
    const newAccounts = [];
    
    // Add checking accounts
    for (let i = 0; i < config.accountCounts.checking; i++) {
      newAccounts.push(createAccount('checking', i));
    }
    
    // Add savings accounts
    for (let i = 0; i < config.accountCounts.savings; i++) {
      newAccounts.push(createAccount('savings', i));
    }
    
    // Add credit accounts
    for (let i = 0; i < config.accountCounts.credit; i++) {
      newAccounts.push(createAccount('credit', i));
    }
    
    setConfig(prev => ({
      ...prev,
      accounts: newAccounts
    }));
  }, [config.accountCounts]);
  
  // Generate a random number of transactions based on target with ±25% variance
  const getTransactionCount = (targetCount) => {
    const variance = 0.25; // 25% variance
    const minCount = Math.floor(targetCount * (1 - variance));
    const maxCount = Math.ceil(targetCount * (1 + variance));
    return Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
  };
  
  // === STATEMENT GENERATION FUNCTIONS ===
  
  // Generate all statements and their transactions
  const generateAllStatements = () => {
    const monthCount = parseInt(config.statementCount, 10);
    
    // Create a new array to hold all accounts and their statements
    let allAccounts = [];
    
    // Generate base statements for each account type
    if (config.accountCounts.checking > 0) {
      const checkingAccObj = config.accounts.find(a => a.type === 'checking' && a.index === 0);
      allAccounts.push({
        accountId: 'checking-0',
        accountType: 'checking',
        accountName: checkingAccObj?.accountName || 'Checking Account',
        accountNumber: checkingAccObj?.accountNumber || '123-456-7890',
        accountHolder: checkingAccObj?.accountHolder || 'John Smith',
        bankName: 'Demo Bank',
        routingNumber: '123456789',
        statements: [] // Will be populated with monthly statements
      });
    }
    
    if (config.accountCounts.savings > 0) {
      const savingsAccObj = config.accounts.find(a => a.type === 'savings' && a.index === 0);
      allAccounts.push({
        accountId: 'savings-0',
        accountType: 'savings',
        accountName: savingsAccObj?.accountName || 'Savings Account',
        accountNumber: savingsAccObj?.accountNumber || '123-456-7891',
        accountHolder: savingsAccObj?.accountHolder || 'John Smith',
        bankName: 'Demo Bank',
        statements: [] // Will be populated with monthly statements
      });
    }
    
    if (config.accountCounts.credit > 0) {
      const creditAccObj = config.accounts.find(a => a.type === 'credit' && a.index === 0);
      allAccounts.push({
        accountId: 'credit-0',
        accountType: 'credit',
        accountName: creditAccObj?.accountName || 'Credit Account',
        accountNumber: creditAccObj?.accountNumber || '4111-1111-2222-3333',
        accountHolder: creditAccObj?.accountHolder || 'John Smith',
        bankName: 'Demo Bank',
        statements: [] // Will be populated with monthly statements
      });
    }
    
    // Generate month names, years, and days for all months
    const monthData = [];
    for (let i = 0; i < monthCount; i++) {
      const monthOffset = monthCount - 1 - i; // Start with oldest month
      const date = new Date(config.statementYear, config.statementMonth);
      date.setMonth(date.getMonth() - monthOffset);
      
      const year = date.getFullYear();
      const month = date.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      monthData.push({
        year,
        month,
        daysInMonth,
        startDate: `${month+1}/1/${year}`,
        endDate: `${month+1}/${daysInMonth}/${year}`
      });
    }
    
    // For each account, generate monthly statements
    allAccounts.forEach(account => {
      // Get initial balance from config
      const accountConfig = config.accounts.find(
        a => a.type === account.accountType && a.index === 0
      );
      
      let runningBalance = accountConfig?.initialBalance || 1500;
      if (account.accountType === 'savings') runningBalance = accountConfig?.initialBalance || 5000;
      if (account.accountType === 'credit') runningBalance = accountConfig?.initialBalance || 500;
      
      // For each month, create a base statement
      monthData.forEach((month, monthIndex) => {
        // Create new statement with opening balance
        const statement = {
          year: month.year,
          month: month.month,
          startDate: month.startDate,
          endDate: month.endDate,
          startingBalance: runningBalance,
          endingBalance: runningBalance, // Will be updated after transactions
          transactions: [
            {
              date: month.startDate,
              description: "OPENING BALANCE",
              amount: null,
              balance: runningBalance
            }
          ],
          totalDebits: 0,
          totalCredits: 0
        };
        
        // For credit cards, add the credit limit
        if (account.accountType === 'credit') {
          statement.creditLimit = accountConfig?.creditLimit || 5000;
          statement.availableCredit = statement.creditLimit - runningBalance;
        }
        
        // Add statement to account
        account.statements.push(statement);
      });
    });
    
    // === STEP 1: Generate basic transactions for each statement ===
    allAccounts.forEach(account => {
      account.statements.forEach((statement, statementIndex) => {
        // Get transaction volume from config
        const accountConfig = config.accounts.find(
          a => a.type === account.accountType && a.index === 0
        );
        
        const baseTransactionCount = accountConfig?.transactionsPerMonth || 
          (account.accountType === 'checking' ? 100 : 
           account.accountType === 'savings' ? 2 : 25);
        
        // Generate transactions based on account type
        if (account.accountType === 'checking') {
          // Add direct deposit (payroll)
          const payDay = Math.min(15, monthData[statementIndex].daysInMonth);
          const payDate = `${statement.month+1}/${payDay}/${statement.year}`;
          const payAmount = 1500;
          
          statement.transactions.push({
            date: payDate,
            description: "DIRECT DEPOSIT - EMPLOYER PAYROLL",
            amount: payAmount,
            balance: 0 // Will be calculated later
          });
          
          // Add POS purchases
          const purchaseCount = getTransactionCount(baseTransactionCount);
          
          for (let i = 0; i < purchaseCount; i++) {
            const day = Math.floor(Math.random() * 28) + 1;
            const purchaseDate = `${statement.month+1}/${day}/${statement.year}`;
            // Calculate a random amount with cents between $5.00 and $120.99
            const purchaseAmount = parseFloat((Math.random() * 115.99 + 5).toFixed(2));
            
            statement.transactions.push({
              date: purchaseDate,
              description: `POS PURCHASE - ${generateRandomMerchant()}`,
              amount: -purchaseAmount,
              balance: 0 // Will be calculated later
            });
          }
          
          // Add checks (approximately 10% of transaction volume)
          const baseCheckCount = Math.ceil(purchaseCount * 0.1); // 10% of transaction activity
          const checkCount = Math.max(1, Math.min(10, baseCheckCount)); // At least 1, max 10 checks
          statement.checks = [];
          
          for (let i = 0; i < checkCount; i++) {
            const checkNumber = 1000 + (statement.month * 10) + i;
            const day = Math.floor(Math.random() * 21) + 5;
            const checkDate = `${statement.month+1}/${day}/${statement.year}`;
            const checkAmount = parseFloat((Math.random() * 200.99 + 50).toFixed(2)); // $50.00-$250.99
            
            // Add check transaction
            statement.transactions.push({
              date: checkDate,
              description: `CHECK #${checkNumber}`,
              amount: -checkAmount,
              balance: 0, // Will be recalculated
              checkNumber: checkNumber
            });
            
            // Only add memo content in 25% of checks (always with an invoice number)
            const includeMemo = Math.random() < 0.25;
            
            // Add to checks array
            statement.checks.push({
              checkNumber,
              date: checkDate,
              amount: checkAmount,
              payee: generateRandomPayee(),
              memo: includeMemo ? generateRandomInvoice() : ""
            });
          }
        }
        else if (account.accountType === 'savings') {
          // Add monthly interest
          const interestDay = monthData[statementIndex].daysInMonth;
          const interestDate = `${statement.month+1}/${interestDay}/${statement.year}`;
                        const interestAmount = parseFloat((statement.startingBalance * 0.0025).toFixed(2));
          
          statement.transactions.push({
            date: interestDate,
            description: "INTEREST PAYMENT",
            amount: interestAmount,
            balance: 0 // Will be calculated later
          });
          
          // Add other savings transactions if not the first month
          if (statementIndex > 0) {
            const transactionCount = getTransactionCount(baseTransactionCount);
            
            for (let i = 0; i < transactionCount; i++) {
              const day = Math.floor(Math.random() * 25) + 1;
              const transDate = `${statement.month+1}/${day}/${statement.year}`;
              
              // 70% deposits, 30% withdrawals
              const isDeposit = Math.random() < 0.7;
              const amount = isDeposit ? 
                parseFloat((Math.random() * 250.99 + 50).toFixed(2)) : // $50.00-$300.99 deposit
                -parseFloat((Math.random() * 100.99 + 25).toFixed(2)); // $25.00-$125.99 withdrawal
              
              statement.transactions.push({
                date: transDate,
                description: isDeposit ? "DEPOSIT" : "WITHDRAWAL",
                amount: amount,
                balance: 0 // Will be calculated later
              });
            }
          }
        }
        else if (account.accountType === 'credit') {
          // Add purchases
          const purchaseCount = getTransactionCount(baseTransactionCount);
          
          for (let i = 0; i < purchaseCount; i++) {
            const day = Math.floor(Math.random() * 25) + 1;
            const purchaseDate = `${statement.month+1}/${day}/${statement.year}`;
            const purchaseAmount = parseFloat((Math.random() * 130.99 + 20).toFixed(2)); // $20.00-$150.99
            
            statement.transactions.push({
              date: purchaseDate,
              description: `PURCHASE - ${generateRandomMerchant()}`,
              amount: purchaseAmount, // Positive for credit cards (increases balance)
              balance: 0 // Will be calculated later
            });
          }
        }
      });
    });
    
    // === STEP 2: Add inter-account transfers and payments ===
    // Only add transfers if we have multiple account types and not in the first (oldest) month
    if (allAccounts.length > 1 && config.transferFrequency !== 'none') {
      for (let monthIndex = 1; monthIndex < monthData.length; monthIndex++) {
        // Get the current month data
        const currentMonth = monthData[monthIndex];
        
        // Find accounts by type
        const checkingAccount = allAccounts.find(a => a.accountType === 'checking');
        const savingsAccount = allAccounts.find(a => a.accountType === 'savings');
        const creditAccount = allAccounts.find(a => a.accountType === 'credit');
        
        // Get the current month statements
        const checkingStatement = checkingAccount?.statements[monthIndex];
        const savingsStatement = savingsAccount?.statements[monthIndex];
        const creditStatement = creditAccount?.statements[monthIndex];
        
        // === STEP 2A: Add transfers between checking and savings ===
        if (checkingStatement && savingsStatement) {
          // Determine number of transfers based on frequency
          let transferCount = 1; // Default
          
          switch (config.transferFrequency) {
            case 'low':
              transferCount = 1;
              break;
            case 'medium':
              transferCount = Math.floor(Math.random() * 2) + 1; // 1-2
              break;
            case 'high':
              transferCount = Math.floor(Math.random() * 2) + 2; // 2-3
              break;
          }
          
          // Add transfers
          for (let i = 0; i < transferCount; i++) {
            const day = Math.floor(Math.random() * 20) + 5; // Days 5-24
            const transferDate = `${currentMonth.month+1}/${day}/${currentMonth.year}`;
            const transferAmount = parseFloat((Math.random() * 200.99 + 50).toFixed(2)); // $50.00-$250.99
            const transferId = `T-${currentMonth.year}${currentMonth.month}${day}-${i}`;
            
            // Add transfer to checking (outgoing)
            checkingStatement.transactions.push({
              date: transferDate,
              description: `TRANSFER TO SAVINGS ${savingsAccount.accountNumber.slice(-4)}`,
              amount: -transferAmount,
              balance: 0, // Will be calculated later
              transferId
            });
            
            // Add transfer to savings (incoming)
            savingsStatement.transactions.push({
              date: transferDate,
              description: `TRANSFER FROM CHECKING ${checkingAccount.accountNumber.slice(-4)}`,
              amount: transferAmount,
              balance: 0, // Will be calculated later
              transferId
            });
          }
        }
        
        // === STEP 2B: Add credit card payments ===
        if (checkingStatement && creditStatement) {
          // Only add payment if credit card has a balance
          // This condition is simplified to always add a payment in non-first months
          const day = Math.floor(Math.random() * 10) + 15; // Days 15-24
          const paymentDate = `${currentMonth.month+1}/${day}/${currentMonth.year}`;
          
          // Determine payment amount (80% chance of full payment)
          const isFullPayment = Math.random() < 0.8;
          let paymentAmount;
          
          if (isFullPayment) {
            // Pay 90-100% of the current balance
            paymentAmount = Math.floor(creditStatement.startingBalance * 0.9);
          } else {
            // Minimum payment: 2-5% or $25 minimum
            paymentAmount = Math.max(25, Math.floor(creditStatement.startingBalance * 0.03));
          }
          
          // Only add payment if it's meaningful
          if (paymentAmount >= 25) {
            // Create a unique payment ID
            const paymentId = `P-${currentMonth.year}${currentMonth.month}${day}`;
            
            // Add payment to checking account (outgoing)
            checkingStatement.transactions.push({
              date: paymentDate,
              description: `PAYMENT TO ${creditAccount.accountNumber.slice(-4)} CREDIT CARD`,
              amount: -paymentAmount,
              balance: 0, // Will be calculated later
              paymentId
            });
            
            // Add payment to credit card (reduces balance)
            creditStatement.transactions.push({
              date: paymentDate,
              description: "PAYMENT - THANK YOU",
              amount: -paymentAmount, // Negative for credit cards (decreases balance)
              balance: 0, // Will be calculated later
              paymentId
            });
          }
        }
      }
    }
    
    // === STEP 3: Sort all transactions by date and calculate running balances ===
    allAccounts.forEach(account => {
      account.statements.forEach((statement, statementIndex) => {
        // Sort transactions by date
        statement.transactions.sort((a, b) => {
          // Special transactions always in specific positions
          if (a.description === "OPENING BALANCE") return -1;
          if (b.description === "OPENING BALANCE") return 1;
          
          // Compare dates
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          
          if (dateA.getTime() !== dateB.getTime()) {
            return dateA - dateB;
          }
          
          // For same date, keep linked transactions together
          if (a.transferId && b.transferId && a.transferId === b.transferId) {
            return a.amount < 0 ? -1 : 1; // Outgoing first, then incoming
          }
          
          if (a.paymentId && b.paymentId && a.paymentId === b.paymentId) {
            return a.amount < 0 ? -1 : 1; // Payment first, then receipt
          }
          
          return 0; // Same date, no special ordering
        });
        
        // Calculate running balances
        let balance = statement.startingBalance;
        let totalDebits = 0;
        let totalCredits = 0;
        
        statement.transactions.forEach(transaction => {
          if (transaction.description !== "OPENING BALANCE") {
            if (transaction.amount !== null) {
              balance += transaction.amount;
              transaction.balance = balance;
              
              // Update totals
              if (account.accountType === 'credit') {
                // For credit cards: purchases (positive) are debits, payments (negative) are credits
                if (transaction.amount > 0) {
                  totalDebits += transaction.amount;
                } else {
                  totalCredits += Math.abs(transaction.amount);
                }
              } else {
                // For checking/savings: deposits (positive) are credits, withdrawals (negative) are debits
                if (transaction.amount > 0) {
                  totalCredits += transaction.amount;
                } else {
                  totalDebits += Math.abs(transaction.amount);
                }
              }
            }
          }
        });
        
        // Add closing balance transaction
        statement.transactions.push({
          date: monthData[statementIndex].endDate,
          description: "CLOSING BALANCE",
          amount: null,
          balance: balance
        });
        
        // Update statement summary values
        statement.endingBalance = balance;
        statement.totalDebits = totalDebits;
        statement.totalCredits = totalCredits;
        
        // For credit cards, update available credit
        if (account.accountType === 'credit') {
          statement.availableCredit = statement.creditLimit - balance;
        }
        
        // If not the last statement, update next month's starting balance
        if (statementIndex < account.statements.length - 1) {
          account.statements[statementIndex + 1].startingBalance = balance;
          
          // Update opening balance transaction
          const openingTransaction = account.statements[statementIndex + 1].transactions.find(
            t => t.description === "OPENING BALANCE"
          );
          
          if (openingTransaction) {
            openingTransaction.balance = balance;
          }
        }
      });
    });
    
    // Set the generated statements and display settings
    setStatements(allAccounts);
    setActiveAccount(0);
    setActiveMonth(monthData.length - 1); // Show most recent month
  };
  
  // Debug state
  const [debugInfo, setDebugInfo] = useState([]);
  
  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Bank Statement Generator</h1>
      
      {/* Display the configuration screen if no statements have been generated yet */}
      {!statements ? (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Month</label>
              <select
                name="statementMonth"
                value={config.statementMonth}
                onChange={(e) => setConfig({...config, statementMonth: parseInt(e.target.value, 10)})}
                className="w-full p-2 border rounded"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>{formatMonth(i)}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Year</label>
              <select
                name="statementYear"
                value={config.statementYear}
                onChange={(e) => setConfig({...config, statementYear: parseInt(e.target.value, 10)})}
                className="w-full p-2 border rounded"
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <option key={i} value={currentYear - 2 + i}>{currentYear - 2 + i}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Number of Months</label>
              <select
                name="statementCount"
                value={config.statementCount}
                onChange={(e) => setConfig({...config, statementCount: parseInt(e.target.value, 10)})}
                className="w-full p-2 border rounded"
              >
                <option value={3}>3 months</option>
                <option value={6}>6 months</option>
                <option value={12}>12 months</option>
                <option value={24}>24 months</option>
              </select>
            </div>
          </div>
          
          <div className="border-t border-b py-4 my-4">
            <h3 className="font-medium mb-3">Account Configuration</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Checking Accounts (0-3)</label>
                <input 
                  type="number"
                  min="0"
                  max="3"
                  value={config.accountCounts.checking}
                  onChange={(e) => handleAccountCountChange('checking', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Savings Accounts (0-2)</label>
                <input 
                  type="number"
                  min="0"
                  max="2"
                  value={config.accountCounts.savings}
                  onChange={(e) => handleAccountCountChange('savings', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Credit Accounts (0-2)</label>
                <input 
                  type="number"
                  min="0"
                  max="2"
                  value={config.accountCounts.credit}
                  onChange={(e) => handleAccountCountChange('credit', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Transfer Frequency</label>
                <select
                  name="transferFrequency"
                  value={config.transferFrequency}
                  onChange={(e) => setConfig({...config, transferFrequency: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="none">None (No transfers)</option>
                  <option value="low">Low (Few transfers)</option>
                  <option value="medium">Medium (Regular transfers)</option>
                  <option value="high">High (Many transfers)</option>
                </select>
              </div>
            </div>
            
            {config.accounts && config.accounts.map((account, index) => (
              <div key={index} className="border rounded p-3 mb-3">
                <h4 className="font-medium mb-2 text-blue-700">
                  {account && account.type && account.type.charAt(0).toUpperCase() + account.type.slice(1)} Account {(account && account.index) + 1}
                </h4>
                
                {/* Basic Account Details Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Account Name</label>
                    <input 
                      type="text"
                      value={account.accountName}
                      onChange={(e) => handleAccountChange(index, 'accountName', e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Account Holder</label>
                    <input 
                      type="text"
                      value={account.accountHolder}
                      onChange={(e) => handleAccountChange(index, 'accountHolder', e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Account Number</label>
                    <input 
                      type="text"
                      value={account.accountNumber}
                      onChange={(e) => handleAccountChange(index, 'accountNumber', e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Initial Balance</label>
                    <input 
                      type="number"
                      value={account.initialBalance}
                      onChange={(e) => handleAccountChange(index, 'initialBalance', e.target.value)}
                      step="0.01"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
                
                {/* Transaction Settings Section - THIS IS THE ADDED SECTION */}
                <div className="mt-4 pt-3 border-t grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-blue-600">
                      Monthly Transactions
                    </label>
                    <input 
                      type="number"
                      value={account.transactionsPerMonth}
                      onChange={(e) => handleAccountChange(index, 'transactionsPerMonth', e.target.value)}
                      className="w-full p-2 border border-blue-300 rounded bg-blue-50"
                      min={account.type === 'savings' ? 1 : (account.type === 'checking' ? 5 : 3)}
                      max={account.type === 'savings' ? 15 : (account.type === 'checking' ? 200 : 50)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Sets target transaction volume with ±25% variance
                    </p>
                  </div>
                  
                  {account.type === 'credit' && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Credit Limit</label>
                      <input 
                        type="number"
                        value={account.creditLimit}
                        onChange={(e) => handleAccountChange(index, 'creditLimit', e.target.value)}
                        step="0.01"
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <button 
            onClick={() => generateAllStatements()}
            className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 mt-2"
          >
            Generate Statements
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-4 flex justify-between">
            <h2 className="text-xl font-semibold">Generated Statements</h2>
            <button 
              onClick={() => setStatements(null)}
              className="py-2 px-4 bg-gray-200 rounded hover:bg-gray-300"
            >
              Back to Config
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow mb-6">
            {/* Account Tabs */}
            {statements && statements.length > 1 && (
              <div className="border-b overflow-x-auto">
                <div className="flex flex-nowrap">
                  {statements.map((statement, index) => (
                    <button
                      key={index}
                      className={`py-2 px-4 whitespace-nowrap ${activeAccount === index ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
                      onClick={() => setActiveAccount(index)}
                    >
                      {statement.accountName}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Month Navigation Controls */}
            {statements && 
             statements[activeAccount] && 
             statements[activeAccount].statements && 
             statements[activeAccount].statements.length > 3 && (
              <div className="border-b overflow-x-auto bg-gray-50 p-2 flex justify-between items-center">
                <button 
                  onClick={() => setActiveMonth(Math.max(0, activeMonth - 1))}
                  className="px-2 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
                  disabled={activeMonth === 0}
                >
                  Previous Month
                </button>
                
                <span className="text-sm font-medium">
                  Showing month {activeMonth + 1} of {statements[activeAccount].statements.length}
                </span>
                
                <button 
                  onClick={() => setActiveMonth(Math.min(statements[activeAccount].statements.length - 1, activeMonth + 1))}
                  className="px-2 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
                  disabled={activeMonth === statements[activeAccount].statements.length - 1}
                >
                  Next Month
                </button>
              </div>
            )}
            
            {/* Month Tabs - only show when there are few enough months */}
            {statements && 
             statements[activeAccount] && 
             statements[activeAccount].statements && 
             statements[activeAccount].statements.length > 1 &&
             statements[activeAccount].statements.length <= 12 && (
              <div className="border-b overflow-x-auto bg-gray-50">
                <div className="flex flex-nowrap">
                  {statements[activeAccount].statements.map((statement, index) => (
                    <button
                      key={index}
                      className={`py-1 px-3 whitespace-nowrap text-sm ${activeMonth === index ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
                      onClick={() => setActiveMonth(index)}
                    >
                      {formatMonth(statement.month)} {statement.year}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Statement Content */}
            {statements && 
             statements[activeAccount] && 
             statements[activeAccount].statements && 
             statements[activeAccount].statements.length > 0 && 
             activeMonth >= 0 && 
             activeMonth < statements[activeAccount].statements.length && (
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold">{statements[activeAccount].bankName}</h3>
                    <p className="text-gray-500">Account Statement</p>
                  </div>
                  <div className="text-right">
                    <p>Statement Date: {statements[activeAccount].statements[activeMonth].endDate}</p>
                    <p>Account Number: {statements[activeAccount].accountNumber}</p>
                    {statements[activeAccount].accountType === 'credit' && (
                      <p>Credit Limit: {formatCurrency(statements[activeAccount].statements[activeMonth].creditLimit)}</p>
                    )}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-medium mb-2">Account Information</h4>
                  <div className="border rounded overflow-hidden">
                    <table className="w-full">
                      <tbody>
                        <tr className="border-b">
                          <td className="p-2 border-r bg-gray-50">Account Holder</td>
                          <td className="p-2">{statements[activeAccount].accountHolder}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 border-r bg-gray-50">Account Type</td>
                          <td className="p-2">{statements[activeAccount].accountType.charAt(0).toUpperCase() + statements[activeAccount].accountType.slice(1)}</td>
                        </tr>
                        <tr>
                          <td className="p-2 border-r bg-gray-50">Statement Period</td>
                          <td className="p-2">{statements[activeAccount].statements[activeMonth].startDate} to {statements[activeAccount].statements[activeMonth].endDate}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-medium mb-2">Account Summary</h4>
                  <div className="border rounded overflow-hidden">
                    <table className="w-full">
                      <tbody>
                        <tr className="border-b">
                          <td className="p-2 border-r bg-gray-50">Opening Balance</td>
                          <td className="p-2">{formatCurrency(statements[activeAccount].statements[activeMonth].startingBalance)}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 border-r bg-gray-50">Total {statements[activeAccount].accountType === 'credit' ? 'Charges' : 'Debits'}</td>
                          <td className="p-2 text-red-600">{formatCurrency(statements[activeAccount].statements[activeMonth].totalDebits)}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 border-r bg-gray-50">Total {statements[activeAccount].accountType === 'credit' ? 'Payments' : 'Credits'}</td>
                          <td className="p-2 text-green-600">{formatCurrency(statements[activeAccount].statements[activeMonth].totalCredits)}</td>
                        </tr>
                        <tr>
                          <td className="p-2 border-r bg-gray-50 font-medium">Ending Balance</td>
                          <td className="p-2 font-medium">{formatCurrency(statements[activeAccount].statements[activeMonth].endingBalance)}</td>
                        </tr>
                        {statements[activeAccount].accountType === 'credit' && 
                         statements[activeAccount].statements[activeMonth].availableCredit !== null && (
                          <tr className="border-t border-dashed">
                            <td className="p-2 border-r bg-gray-50">Available Credit</td>
                            <td className="p-2">{formatCurrency(statements[activeAccount].statements[activeMonth].availableCredit)}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-medium mb-2">Transaction History</h4>
                  <div className="border rounded overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="p-2 text-left">Date</th>
                          <th className="p-2 text-left">Description</th>
                          <th className="p-2 text-right">Amount</th>
                          <th className="p-2 text-right">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {statements[activeAccount].statements[activeMonth].transactions.map((transaction, index) => (
                          <tr key={index} 
                              className={`${transaction.description.includes("OPENING") || transaction.description.includes("CLOSING") ? "bg-gray-100 font-medium" : ""} 
                                         ${(transaction.transferId || transaction.paymentId) ? "bg-blue-50" : ""}`}>
                            <td className="p-2">{transaction.date}</td>
                            <td className="p-2">{transaction.description}</td>
                            <td className={`p-2 text-right ${
                              transaction.amount === null ? "" :
                              statements[activeAccount].accountType === 'credit' 
                                ? (transaction.amount < 0 ? "text-green-600" : "text-red-600")
                                : (transaction.amount > 0 ? "text-green-600" : "text-red-600")
                            }`}>
                              {transaction.amount === null ? "-" : formatCurrency(transaction.amount)}
                            </td>
                            <td className="p-2 text-right">{formatCurrency(transaction.balance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Check images for checking account */}
                {statements[activeAccount].accountType === 'checking' &&
                 statements[activeAccount].statements[activeMonth].checks && 
                 statements[activeAccount].statements[activeMonth].checks.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Cleared Checks</h4>
                    <div className="grid grid-cols-1 gap-4">
                      {statements[activeAccount].statements[activeMonth].checks.map((check, index) => (
                        <div key={index} className="border rounded-md overflow-hidden">
                          <div className="bg-gray-50 p-2 border-b">
                            <span className="font-medium">Check #{check.checkNumber}</span> - <span className="text-sm">{check.date}</span>
                          </div>
                          <div className="p-4">
                            {/* Check image */}
                            <div className="border-2 border-blue-700 bg-blue-50 mb-4 overflow-hidden rounded-sm" style={{maxWidth: '650px', width: '100%', aspectRatio: '2.33/1'}}>
                              <div className="relative p-3 h-full">
                                {/* Date on black line (moved left) */}
                                <div className="absolute top-14 right-28 border-b-2 border-black w-24"></div>
                                <div className="absolute top-8 right-28 text-right">
                                  <div className="text-sm">{check.date}</div>
                                </div>
                                
                                {/* Account holder (top left) */}
                                <div className="absolute top-3 left-3">
                                  <div className="flex items-center">
                                    <div className="mr-2">
                                      <svg width="36" height="36" viewBox="0 0 36 36" className="text-blue-700">
                                        <circle cx="18" cy="18" r="18" fill="currentColor" />
                                        <text x="18" y="22" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
                                          {statements[activeAccount].accountHolder.charAt(0)}
                                        </text>
                                      </svg>
                                    </div>
                                    <div>
                                      <div className="font-semibold text-blue-700">{statements[activeAccount].accountHolder}</div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Bank name (top center) */}
                                <div className="absolute top-3 left-0 right-0 text-center">
                                  <div className="font-bold text-lg text-blue-800">{statements[activeAccount].bankName}</div>
                                </div>
                                
                                {/* Check number (top right) */}
                                <div className="absolute top-3 right-3 text-right">
                                  <div className="mt-2 font-bold">{String(check.checkNumber).padStart(6, '0')}</div>
                                </div>
                                
                                {/* Pay to the order of section */}
                                <div className="absolute top-24 left-3 right-3 flex justify-between">
                                  <div className="flex items-center">
                                    <div className="text-sm leading-none mr-2">
                                      PAY TO THE<br/>ORDER OF
                                    </div>
                                    <div className="flex-grow border-b border-gray-800" style={{minWidth: '300px', height: '18px'}}>
                                      <span className="relative -top-1">{check.payee}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="ml-2">
                                    <div className="border border-gray-800 px-2 py-1 font-bold text-right">
                                      $ **{check.amount.toFixed(2)}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Amount in words */}
                                <div className="absolute top-36 left-3 right-3">
                                  <div className="flex flex-col">
                                    <div className="border-b border-gray-800" style={{minHeight: '18px'}}>
                                      <span className="relative -top-1">{formatAmountInWords(check.amount)}</span>
                                    </div>
                                    <div className="text-xs mt-1">DOLLARS</div>
                                  </div>
                                </div>
                                
                                {/* Always show MEMO section, but only put content in 25% of checks */}
                                <div className="absolute bottom-10 left-3 right-3">
                                  <div className="flex justify-between">
                                    <div style={{width: '40%'}}>
                                      <div className="text-xs">MEMO</div>
                                      <div className="border-b border-gray-800" style={{height: '18px'}}>
                                        {check.memo && (
                                          <span className="relative -top-1">{check.memo}</span>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div style={{width: '40%'}} className="text-right">
                                      <div className="text-xs">Authorized Signature</div>
                                      <div className="border-b border-gray-800 flex justify-end items-end" style={{height: '18px'}}>
                                        <span className="italic">{statements[activeAccount].accountHolder}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* MICR Line - 20% larger font */}
                                <div className="absolute bottom-1 left-3 right-3 font-mono" style={{ fontSize: '0.9rem' }}>
                                  ⑆{statements[activeAccount].routingNumber}⑆ ⑈{statements[activeAccount].accountNumber.replace(/[^0-9]/g, '')}⑈ {String(check.checkNumber).padStart(6, '0')}⑉
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-6 text-center text-gray-500 text-sm">
                  <p>This is a demo statement generated for testing purposes only.</p>
                  <p>All information is fictional and does not represent real financial data.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Debug panel */}
      <div id="debug-output" className="mt-4 p-2 bg-gray-50 text-xs text-gray-600 rounded"></div>
    </div>
  );
};

export default BankStatementGenerator;
