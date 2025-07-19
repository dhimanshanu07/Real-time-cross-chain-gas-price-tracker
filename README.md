Project Overview
Chain Cost Vision is a real-time cross-chain gas fee tracker and transaction cost simulator.
It monitors gas prices across Ethereum, Polygon, and Arbitrum networks and allows users to simulate transaction costs dynamically in both Live and Simulation modes.

Key Features
⚡ Real-time Gas Monitoring
Live gas data updates using WebSocket providers (Alchemy RPC endpoints).
Tracks baseFee, priorityFee, and calculates totalGas per chain.

🔄 Cross-Chain Comparison
Compare gas fees across Ethereum, Polygon, and Arbitrum in a clean UI with color-coded indicators.

🧮 Transaction Cost Simulation
Simulate transaction costs based on custom gasLimit and amount.
Shows detailed breakdown of gas in ETH, gas in USD, and total transaction cost.

📈 History Tracking
Stores historical gas data in 15-minute buckets to visualize volatility.

💰 ETH/USD Price Integration
Uses mock price data or real feeds to estimate USD costs.

🎛️ Mode Switching
Toggle between Live Mode (real-time data) and Simulation Mode (custom scenarios).

🗃️ State Management
Built with Zustand for efficient local state handling of gas data, history, and simulations.

Tech Stack
React + TypeScript – Frontend UI and business logic

Vite – Fast build and development environment

shadcn/ui – Reusable UI components

Tailwind CSS – Utility-first styling

Zustand – Global state management for chains, gas data, and simulation

ethers.js – Blockchain data interaction via WebSockets (Alchemy RPC)

Installation & Development
Local Setup
Ensure you have Node.js and npm installed.

bash
Copy
Edit
# 1. Clone the repository
git clone <YOUR_GIT_URL>

# 2. Move into the project directory
cd <YOUR_PROJECT_NAME>

# 3. Install dependencies
npm install

# 4. Run the development server
npm run dev
Usage Guide
Live Mode
See real-time updates of cross-chain gas fees as blocks are mined.

Simulation Mode
Enter a transaction amount and gas limit to calculate cross-chain costs in USD & ETH.

Switching Modes
Use the mode toggle buttons in the header to switch between Live and Simulation.

Folder Structure
Folder/File	Purpose
useGasStore.ts	Zustand store for gas & simulation
useWeb3Data.ts	Web3 integration and data fetching
TransactionSimulator.tsx	UI for custom simulation
SimulationTable.tsx	Table displaying simulation results
Header.tsx	Application header and mode switch

Future Enhancements (Optional)
Add charts for historical gas price trends

Integrate real ETH/USD price feeds (e.g., Chainlink, CoinGecko)

Add support for more chains (e.g., Optimism, BSC)

License
This project is open for personal and commercial use. Modify, extend, or integrate it as needed.




<img width="1905" height="905" alt="Screenshot 2025-07-19 230812" src="https://github.com/user-attachments/assets/ad50ce9f-f2e8-4aff-bcb1-afb2981ef9d5" />

