   // ============================================
        // THEME MANAGEMENT
        // ============================================
        
        /**
         * Initialize theme on page load
         * Checks localStorage for saved preference or uses system preference
         */
        function initializeTheme() {
            const savedTheme = localStorage.getItem('theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const theme = savedTheme || (prefersDark ? 'dark' : 'light');
            setTheme(theme);
        }
        
        /**
         * Set the theme and save preference
         * @param {string} theme - 'light' or 'dark'
         */
        function setTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            
            const sunIcon = document.getElementById('sunIcon');
            const moonIcon = document.getElementById('moonIcon');
            
            if (theme === 'dark') {
                sunIcon.classList.add('hidden');
                moonIcon.classList.remove('hidden');
            } else {
                sunIcon.classList.remove('hidden');
                moonIcon.classList.add('hidden');
            }
        }
        
        /**
         * Toggle between light and dark themes
         */
        function toggleTheme() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        }
        
        // ============================================
        // API INTERACTION
        // ============================================
        
        /**
         * Fetch country data from REST Countries API v3.1
         * This is a FREE public API - NO API KEY REQUIRED!
         * @param {string} countryName - Name of the country to search
         * @returns {Promise<Object>} Country data object
         */
        async function fetchCountryData(countryName) {
            // Encode the country name to handle special characters and spaces
            const encodedName = encodeURIComponent(countryName);
            
            // REST Countries API v3.1 endpoint
            const apiUrl = `https://restcountries.com/v3.1/name/${encodedName}`;
            
            console.log('🌍 Fetching from API:', apiUrl);
            
            try {
                // Make the API request
                const response = await fetch(apiUrl);
                
                console.log('📡 Response status:', response.status);
                
                // Handle different response statuses
                if (response.status === 404) {
                    throw new Error(`Country "${countryName}" not found. Please check the spelling and try again.`);
                }
                
                if (!response.ok) {
                    throw new Error(`API Error: ${response.status} - ${response.statusText}`);
                }
                
                // Parse JSON response
                const data = await response.json();
                
                console.log('✅ Data received:', data);
                
                // API returns an array, we want the first (most relevant) result
                if (data && data.length > 0) {
                    return data[0];
                } else {
                    throw new Error('No data returned from API');
                }
                
            } catch (error) {
                console.error('❌ Fetch error:', error);
                
                // Provide user-friendly error messages
                if (error.message.includes('Failed to fetch')) {
                    throw new Error('Network error. Please check your internet connection and make sure you are running this through a web server (not file://)');
                }
                
                throw error;
            }
        }
        
        // ============================================
        // DATA FORMATTING UTILITIES
        // ============================================
        
        /**
         * Format number with thousands separators
         * @param {number} num - Number to format
         * @returns {string} Formatted number
         */
        function formatNumber(num) {
            return num.toLocaleString('en-US');
        }
        
        /**
         * Extract language names from languages object
         * @param {Object} languages - Languages object from API
         * @returns {Array<string>} Array of language names
         */
        function getLanguages(languages) {
            if (!languages) return ['Not available'];
            return Object.values(languages);
        }
        
        /**
         * Format currency information
         * @param {Object} currencies - Currencies object from API
         * @returns {string} Formatted currency string
         */
        function getCurrencies(currencies) {
            if (!currencies) return 'Not available';
            
            const currencyList = Object.values(currencies).map(curr => {
                return curr.symbol ? `${curr.name} (${curr.symbol})` : curr.name;
            });
            
            return currencyList.join(', ');
        }
        
        // ============================================
        // UI UPDATE FUNCTIONS
        // ============================================
        
        /**
         * Display country information in the UI
         * @param {Object} country - Country data from API
         */
        function displayCountryInfo(country) {
            console.log('🎨 Displaying country info for:', country.name.common);
            
            // Update flag
            document.getElementById('countryFlag').src = country.flags.svg;
            document.getElementById('countryFlag').alt = `Flag of ${country.name.common}`;
            
            // Update basic information
            document.getElementById('countryName').textContent = country.name.common;
            document.getElementById('officialName').textContent = country.name.official;
            document.getElementById('capital').textContent = country.capital ? country.capital[0] : 'Not available';
            document.getElementById('region').textContent = `${country.region}${country.subregion ? ' - ' + country.subregion : ''}`;
            
            // Update statistics
            document.getElementById('population').textContent = formatNumber(country.population);
            document.getElementById('area').textContent = `${formatNumber(country.area)} km²`;
            document.getElementById('currencies').textContent = getCurrencies(country.currencies);
            
            // Update languages with badges
            const languagesContainer = document.getElementById('languages');
            languagesContainer.innerHTML = '';
            getLanguages(country.languages).forEach(lang => {
                languagesContainer.appendChild(createBadge(lang));
            });
            
            // Update internet domains
            const domainsContainer = document.getElementById('domains');
            domainsContainer.innerHTML = '';
            const domains = country.tld || ['Not available'];
            domains.forEach(domain => {
                domainsContainer.appendChild(createBadge(domain));
            });
            
            // Update embedded map
            const lat = country.latlng[0];
            const lng = country.latlng[1];
            document.getElementById('countryMap').src = 
                `https://maps.google.com/maps?q=${lat},${lng}&z=5&output=embed`;
            
            // Update additional information
            document.getElementById('timezones').textContent = country.timezones.join(', ');
            document.getElementById('continent').textContent = country.continents ? country.continents[0] : 'Not available';
            
            const callingCode = country.idd.root ? 
                `${country.idd.root}${country.idd.suffixes ? country.idd.suffixes[0] : ''}` : 'Not available';
            document.getElementById('callingCode').textContent = callingCode;
            
            document.getElementById('borders').textContent = country.borders ? 
                `${country.borders.length} countries` : 'None (island/isolated)';
            
            document.getElementById('independent').textContent = country.independent ? 'Yes' : 'No';
            document.getElementById('unMember').textContent = country.unMember ? 'Yes' : 'No';
        }
        
        /**
         * Create a styled badge element
         * @param {string} text - Text to display in badge
         * @returns {HTMLElement} Badge element
         */
        function createBadge(text) {
            const badge = document.createElement('span');
            badge.className = 'px-4 py-2 rounded-lg text-sm font-medium';
            badge.style.background = 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))';
            badge.style.color = 'white';
            badge.textContent = text;
            return badge;
        }
        
        /**
         * Show loading state
         */
        function showLoading() {
            document.getElementById('loadingState').classList.remove('hidden');
            document.getElementById('resultsContainer').classList.add('hidden');
            document.getElementById('errorMessage').classList.add('hidden');
        }
        
        /**
         * Show results section
         */
        function showResults() {
            document.getElementById('loadingState').classList.add('hidden');
            document.getElementById('resultsContainer').classList.remove('hidden');
            document.getElementById('errorMessage').classList.add('hidden');
            
            // Smooth scroll to results
            document.getElementById('resultsContainer').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
        
        /**
         * Show error message
         * @param {string} message - Error message to display
         */
        function showError(message) {
            const errorDiv = document.getElementById('errorMessage');
            errorDiv.querySelector('p').textContent = message;
            errorDiv.classList.remove('hidden');
            document.getElementById('loadingState').classList.add('hidden');
            document.getElementById('resultsContainer').classList.add('hidden');
        }
        
        // ============================================
        // MAIN SEARCH FUNCTION
        // ============================================
        
        /**
         * Main search function - orchestrates the entire search process
         * This is called when user clicks search or presses Enter
         */
        async function searchCountry() {
            // Get and validate input
            const countryName = document.getElementById('countryInput').value.trim();
            
            if (!countryName) {
                showError('Please enter a country name');
                return;
            }
            
            // Show loading state
            showLoading();
            
            try {
                // Fetch data from API
                const countryData = await fetchCountryData(countryName);
                
                // Display the data
                displayCountryInfo(countryData);
                
                // Show results
                showResults();
                
            } catch (error) {
                // Show error to user
                showError(error.message);
            }
        }
        
        // ============================================
        // EVENT LISTENERS
        // ============================================
        
        // Theme toggle button click
        document.getElementById('themeToggle').addEventListener('click', toggleTheme);
        
        // Search button click
        document.getElementById('searchBtn').addEventListener('click', searchCountry);
        
        // Enter key press in input field
        document.getElementById('countryInput').addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                searchCountry();
            }
        });
        
        // ============================================
        // INITIALIZATION
        // ============================================
        
        // Initialize theme when page loads
        initializeTheme();
        
        // Log ready message
        console.log('✅ Country Explorer loaded successfully!');
        console.log('🌍 Using REST Countries API v3.1');
        console.log('🔑 No API key required - completely free!');
        console.log('📝 Try searching for any country...');
        