// Script to verify bidding configuration
import dotenv from 'dotenv';
dotenv.config();

console.log('=== Bidding Configuration Verification ===');

// Check environment variables
console.log('\nEnvironment Variables:');
console.log('VITE_RELAYER_URL:', process.env.VITE_RELAYER_URL || 'Not set');
console.log('VITE_KMS_VERIFIER_CONTRACT:', process.env.VITE_KMS_VERIFIER_CONTRACT || 'Not set');
console.log('VITE_INPUT_VERIFIER_CONTRACT:', process.env.VITE_INPUT_VERIFIER_CONTRACT || 'Not set');
console.log('VITE_INPUT_VERIFICATION_CONTRACT:', process.env.VITE_INPUT_VERIFICATION_CONTRACT || 'Not set');
console.log('VITE_ACL_CONTRACT:', process.env.VITE_ACL_CONTRACT || 'Not set');
console.log('VITE_DECRYPTION_ORACLE_CONTRACT:', process.env.VITE_DECRYPTION_ORACLE_CONTRACT || 'Not set');

console.log('\n=== Verification Complete ===');