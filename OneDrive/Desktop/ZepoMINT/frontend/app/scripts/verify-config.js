// Script to verify environment configuration
console.log('=== ZepoMINT Environment Configuration Verification ===');

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

if (isBrowser) {
  console.log('Running in browser environment');
  
  // Check Vite environment variables
  console.log('\n=== Environment Variables ===');
  console.log('VITE_RELAYER_URL:', import.meta.env.VITE_RELAYER_URL);
  console.log('VITE_KMS_VERIFIER_CONTRACT:', import.meta.env.VITE_KMS_VERIFIER_CONTRACT);
  console.log('VITE_ACL_CONTRACT:', import.meta.env.VITE_ACL_CONTRACT);
  console.log('VITE_INPUT_VERIFIER_CONTRACT:', import.meta.env.VITE_INPUT_VERIFIER_CONTRACT);
  console.log('VITE_DECRYPTION_ORACLE_CONTRACT:', import.meta.env.VITE_DECRYPTION_ORACLE_CONTRACT);
  console.log('VITE_RAINBOWKIT_PROJECT_ID:', import.meta.env.VITE_RAINBOWKIT_PROJECT_ID);
  
  // Validate required variables
  console.log('\n=== Validation ===');
  const requiredVars = [
    'VITE_RELAYER_URL',
    'VITE_KMS_VERIFIER_CONTRACT',
    'VITE_ACL_CONTRACT',
    'VITE_INPUT_VERIFIER_CONTRACT'
  ];
  
  let allValid = true;
  for (const varName of requiredVars) {
    const value = import.meta.env[varName];
    if (!value) {
      console.error(`❌ Missing required environment variable: ${varName}`);
      allValid = false;
    } else {
      console.log(`✅ ${varName}: ${value}`);
    }
  }
  
  if (allValid) {
    console.log('\n✅ All required environment variables are set');
  } else {
    console.log('\n❌ Some required environment variables are missing');
  }
  
  // Test relayer URL accessibility
  if (import.meta.env.VITE_RELAYER_URL) {
    console.log('\n=== Relayer URL Test ===');
    console.log('Testing relayer URL:', import.meta.env.VITE_RELAYER_URL);
    
    // In a real implementation, we would test the URL here
    // For now, we'll just log that we would test it
    console.log('Note: Actual URL testing would be done in the RelayerConfigTest component');
  }
} else {
  console.log('This script is intended to run in a browser environment with Vite');
  console.log('Please run it in the browser console or as part of the React application');
}

console.log('\n=== End of Verification ===');