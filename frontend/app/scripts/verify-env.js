// Simple script to verify environment variables
console.log('=== Environment Variables Verification ===');

// Check if we're in Node.js environment
if (typeof process !== 'undefined' && process.env) {
  console.log('Running in Node.js environment');
  console.log('Environment variables from process.env:');
  console.log(process.env);
} else {
  console.log('Not running in Node.js environment');
}

// Check if we have import.meta.env (Vite environment)
if (typeof import !== 'undefined' && import.meta && import.meta.env) {
  console.log('Running in Vite environment');
  console.log('Environment variables from import.meta.env:');
  console.log(import.meta.env);
  
  // Check specific Zama variables
  const zamaVars = [
    'VITE_RELAYER_URL',
    'VITE_KMS_VERIFIER_CONTRACT',
    'VITE_INPUT_VERIFIER_CONTRACT',
    'VITE_ACL_CONTRACT',
    'VITE_DECRYPTION_ORACLE_CONTRACT',
    'VITE_FHEVM_EXECUTOR_CONTRACT',
    'VITE_HCU_LIMIT_CONTRACT'
  ];
  
  console.log('\n=== Zama Specific Variables ===');
  for (const varName of zamaVars) {
    const value = import.meta.env[varName];
    if (value) {
      console.log(`✅ ${varName}: ${value}`);
    } else {
      console.log(`❌ ${varName}: NOT FOUND`);
    }
  }
} else {
  console.log('import.meta.env not available');
}

console.log('=== Verification Complete ===');