# Setting up Hardhat Project with Zama fhEVM Template

This guide provides detailed step-by-step instructions for setting up a Hardhat project with Zama fhEVM template for Fully Homomorphic Encryption (FHE) development.

## Prerequisites

Before starting, ensure you have the following installed:
- Node.js 20.x (Required for Zama FHEVM compatibility)
- npm or yarn
- Git

## Step 1: Environment Setup

### 1.1 Install Node.js 20.x
```bash
# Check your current Node.js version
node --version

# If you don't have Node.js 20.x, install it using nvm (Node Version Manager)
# For Windows:
# Download from https://nodejs.org/en/download/

# For macOS/Linux:
# Install nvm first
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
# Install Node.js 20.x
nvm install 20
nvm use 20
```

### 1.2 Clone the Repository
```bash
git clone <repository-url>
cd ZepoMINT
```

### 1.3 Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend/app
npm install

# Return to root directory
cd ../../..
```

## Step 2: Environment Configuration

### 2.1 Create Environment File
```bash
# Copy the example environment file
cp .env.example .env
```

### 2.2 Configure Environment Variables
Edit the `.env` file with your actual values:

```env
# Sepolia Testnet Configuration
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Local Development
LOCAL_RPC_URL=http://127.0.0.1:8545
```

## Step 3: Local Development Setup

### 3.1 Start Hardhat Node
Open a new terminal and start the Hardhat local Ethereum node:
```bash
npx hardhat node
```

This will start a local Ethereum node with 20 test accounts, each with 10,000 ETH.

### 3.2 Deploy Contracts to Local Node
In a separate terminal, deploy the contracts:
```bash
npm run deploy:local
```

This will:
- Compile the smart contracts
- Deploy them to the local Hardhat node
- Save deployment information to `deployments/localhost-deployment.json`

### 3.3 Start Frontend Development Server
```bash
cd frontend/app
npx vite
```

The frontend will be available at http://localhost:5173

## Step 4: Wallet Configuration

### 4.1 Configure MetaMask for Local Development
1. Open MetaMask in your browser
2. Click on the network dropdown and select "Localhost 8545"
3. If "Localhost 8545" is not available, add it manually:
   - Network Name: Localhost 8545
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency Symbol: ETH

### 4.2 Import Test Accounts
Import one of the test accounts from the Hardhat node output:
- Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
- Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

## Step 5: Testing

### 5.1 Run Unit Tests (Local - Non-FHE functionality)
```bash
cd backend
npx hardhat test
```

Note: FHE tests will be automatically skipped on local Hardhat networks as they require Zama's testnet environment.

### 5.2 Run Integration Tests
```bash
npx hardhat test test/integration.test.js
```

## Step 6: Sepolia Testnet Deployment

### 6.1 Compile Contracts
```bash
cd backend
npm run compile
```

### 6.2 Deploy to Sepolia
```bash
npm run deploy:sepolia
```

This will deploy the contracts to Sepolia testnet using the configuration in your `.env` file.

## Step 7: Zama Testnet Deployment (for FHE functionality)

### 7.1 Compile Contracts
```bash
cd backend
npm run compile
```

### 7.2 Deploy to Zama Testnet
```bash
npm run deploy:zama
```

Note: FHE contracts require Zama's specialized runtime environment. They will not work on standard Hardhat local networks.

### 7.3 Run FHE Tests on Zama Testnet
```bash
cd backend
npm run test:zama
```

## Step 8: Project Structure Understanding

The project follows this structure:
```
├── backend/
│   ├── contracts/           # Smart contracts
│   ├── scripts/             # Deployment scripts
│   ├── test/                # Test files
│   └── hardhat.config.js    # Hardhat configuration
├── frontend/
│   └── app/                 # React frontend
├── scripts/                 # Development scripts
├── docs/                    # Documentation
└── .env.example            # Environment example
```

## Step 9: Making Changes

### 9.1 Smart Contract Development
1. Edit contracts in `backend/contracts/`
2. Recompile: `npx hardhat compile --force`
3. Redeploy: `npm run deploy:local`

### 9.2 Frontend Development
1. Edit files in `frontend/app/`
2. The frontend will automatically reload with changes

## Troubleshooting Common Issues

### Issue 1: Node.js Version Compatibility
**Problem**: Hardhat doesn't work with Node.js 23+
**Solution**: Downgrade to Node.js 20.x

### Issue 2: Missing Environment Variables
**Problem**: Deployment fails due to missing RPC URLs or private keys
**Solution**: Ensure `.env` file is properly configured

### Issue 3: Hardhat Node Not Running
**Problem**: Deployment fails because Hardhat node is not running
**Solution**: Start `npx hardhat node` before deploying

### Issue 4: Compilation Errors
**Problem**: Contracts fail to compile
**Solution**: Run `npm run compile` to force recompilation

### Issue 5: Network Connection Issues
**Problem**: Cannot connect to Sepolia or Zama testnet
**Solution**: Check RPC URL in `.env` file

### Issue 6: FHE Tests Being Skipped
**Problem**: FHE tests are skipped during local testing
**Solution**: Use `npm run test:zama` to run FHE tests on Zama testnet

## Security Considerations

1. **Never commit private keys** to version control
2. **Use separate accounts** for development and production
3. **Regularly update dependencies** to patch security vulnerabilities
4. **Follow security best practices** for smart contract development
5. **The test accounts and private keys** provided by Hardhat are publicly known - never use them on any live network

## FHE Development Best Practices

1. **Separate FHE initialization** from contract construction
2. **Use explicit initialization functions** that can be called after deployment
3. **Handle FHE operations** in dedicated functions
4. **Check FHE initialization status** before operations
5. **Provide clear error messages** for uninitialized FHE values
6. **Write tests that can adapt** to different network environments
7. **Skip FHE tests on local networks** automatically
8. **Use Zama testnet** for comprehensive FHE testing

## Available FHE Functions

The Zama fhEVM provides the following core FHE operations:
- **Arithmetic**: `TFHE.add()`, `TFHE.sub()`, `TFHE.mul()`, `TFHE.div()`
- **Comparison**: `TFHE.eq()`, `TFHE.ne()`, `TFHE.gt()`, `TFHE.ge()`, `TFHE.lt()`, `TFHE.le()`
- **Bitwise**: `TFHE.and()`, `TFHE.or()`, `TFHE.xor()`
- **Conversion**: `TFHE.asEuint32()`, `TFHE.asEuint256()`, etc.
- **Utility**: `TFHE.allow()`, `TFHE.allowThis()`

Note: Functions like `TFHE.decrypt()` and `TFHE.select()` are not available in production environments for security reasons.

## Next Steps

1. **Customize the contract** for your specific NFT requirements
2. **Enhance the frontend** with additional features
3. **Implement additional security measures**
4. **Run comprehensive audits** before mainnet deployment
5. **Test FHE functionality** on Zama testnet
6. **Optimize gas usage** and contract performance