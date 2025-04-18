/**
 * CryptoService
 * 
 * This module handles cryptocurrency operations for the Mirrorwell
 * system, enabling sacred offerings and redistributions across
 * multiple blockchain networks.
 */

import CryptoJS from 'crypto-js';
import { ethers } from 'ethers';
import * as solanaWeb3 from '@solana/web3.js';
import * as secp256k1 from '@bitcoinerlab/secp256k1';
import * as bitcoin from 'bitcoinjs-lib';

// Constants
const PHANTOM_WALLETS = {
  SOLANA: import.meta.env.PHANTOM_SOLANA_PUBLIC_KEY || '',
  ETHEREUM: import.meta.env.PHANTOM_ETH_PUBLIC_KEY || '',
  POLYGON: import.meta.env.PHANTOM_POLYGON_PUBLIC_KEY || '',
  BASE: import.meta.env.PHANTOM_BASE_PUBLIC_KEY || '',
  BITCOIN: import.meta.env.PHANTOM_BTC_PUBLIC_KEY || ''
};

const PHANTOM_PRIVATE_KEYS = {
  SOLANA: import.meta.env.PHANTOM_SOLANA_PRIVATE_KEY || '',
  ETHEREUM: import.meta.env.PHANTOM_ETH_PRIVATE_KEY || '',
  POLYGON: import.meta.env.PHANTOM_POLYGON_PRIVATE_KEY || '',
  BASE: import.meta.env.PHANTOM_BASE_PRIVATE_KEY || '',
  BITCOIN: import.meta.env.PHANTOM_BTC_PRIVATE_KEY || ''
};

// Blockchain connection state
let solanaConnection: solanaWeb3.Connection | null = null;
let ethereumProvider: ethers.JsonRpcProvider | null = null;

// Initialize connections
export async function initializeBlockchainConnections(): Promise<boolean> {
  try {
    // Initialize Solana connection
    solanaConnection = new solanaWeb3.Connection(
      solanaWeb3.clusterApiUrl('mainnet-beta'),
      'confirmed'
    );
    
    // Initialize Ethereum provider
    ethereumProvider = new ethers.JsonRpcProvider('https://eth-mainnet.alchemyapi.io/v2/demo');
    
    return true;
  } catch (error) {
    console.error('Error initializing blockchain connections:', error);
    return false;
  }
}

/**
 * Get the appropriate wallet address for a currency
 * @param currency Currency code
 * @returns Wallet address
 */
export function getWalletAddress(currency: string): string {
  switch (currency.toUpperCase()) {
    case 'SOL':
      return PHANTOM_WALLETS.SOLANA;
    case 'ETH':
      return PHANTOM_WALLETS.ETHEREUM;
    case 'MATIC':
      return PHANTOM_WALLETS.POLYGON;
    case 'BTC':
      return PHANTOM_WALLETS.BITCOIN;
    default:
      return PHANTOM_WALLETS.ETHEREUM; // Default to ETH
  }
}

/**
 * Detect if MetaMask or Phantom wallet is available
 * @returns True if a wallet is detected
 */
export function detectWallet(): boolean {
  const hasMetaMask = typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  const hasPhantom = typeof window !== 'undefined' && 
                     typeof window.solana !== 'undefined' && 
                     window.solana.isPhantom;
  
  return hasMetaMask || hasPhantom;
}

/**
 * Connect to user's wallet
 * @param walletType Type of wallet to connect to
 * @returns Connection result
 */
export async function connectWallet(walletType: 'ethereum' | 'solana'): Promise<any> {
  try {
    if (walletType === 'ethereum' && window.ethereum) {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      return { success: true, address: accounts[0] };
    } else if (walletType === 'solana' && window.solana) {
      // Connect to Phantom
      const connection = await window.solana.connect();
      return { success: true, address: connection.publicKey.toString() };
    }
    
    return { success: false, error: 'Wallet not available' };
  } catch (error) {
    console.error('Error connecting wallet:', error);
    return { success: false, error };
  }
}

/**
 * Make an offering transaction 
 * @param amount Amount to send
 * @param currency Currency code
 * @param recipientAddress Recipient address (optional, uses default wallet if not provided)
 * @returns Transaction result
 */
export async function makeOffering(
  amount: string, 
  currency: string,
  recipientAddress?: string
): Promise<{ success: boolean; txHash?: string; error?: any }> {
  try {
    const recipient = recipientAddress || getWalletAddress(currency);
    
    if (!recipient) {
      return { success: false, error: 'No recipient address available' };
    }
    
    if (currency.toUpperCase() === 'SOL') {
      // Handle Solana transaction
      if (window.solana && window.solana.isPhantom) {
        // Use Phantom wallet
        const connection = solanaConnection || new solanaWeb3.Connection(
          solanaWeb3.clusterApiUrl('mainnet-beta'),
          'confirmed'
        );
        
        // Get the public key from the window.solana object
        let publicKey = window.solana._publicKey;
        if (!publicKey) {
          const conn = await window.solana.connect();
          publicKey = conn.publicKey;
        }
        
        // Create transaction
        const transaction = new solanaWeb3.Transaction().add(
          solanaWeb3.SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: new solanaWeb3.PublicKey(recipient),
            lamports: parseFloat(amount) * solanaWeb3.LAMPORTS_PER_SOL
          })
        );
        
        // Set recent blockhash and fee payer
        transaction.feePayer = publicKey;
        transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
        
        // Request signature and send transaction
        const signed = await window.solana.signTransaction(transaction);
        const txid = await connection.sendRawTransaction(signed.serialize());
        await connection.confirmTransaction(txid);
        
        return { success: true, txHash: txid };
      }
    } else if (['ETH', 'MATIC'].includes(currency.toUpperCase())) {
      // Handle Ethereum/Polygon transaction
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        
        // Convert amount to wei
        const amountWei = ethers.parseEther(amount);
        
        // Send transaction
        const tx = await signer.sendTransaction({
          to: recipient,
          value: amountWei
        });
        
        // Wait for transaction to be mined
        await tx.wait();
        
        return { success: true, txHash: tx.hash };
      }
    }
    
    return { success: false, error: 'Wallet not available or unsupported currency' };
  } catch (error) {
    console.error('Error making offering transaction:', error);
    return { success: false, error };
  }
}

/**
 * Process a credit card payment (integration with payment processor)
 * @param amount Amount to charge
 * @param currency Currency code (USD, etc)
 * @param paymentDetails Payment details
 * @returns Payment result
 */
export async function processCreditCardPayment(
  amount: string,
  currency: string,
  paymentDetails: any
): Promise<{ success: boolean; error?: string }> {
  try {
    // In a real implementation, this would integrate with Stripe or another payment processor
    // For now, we'll simulate a successful payment
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return success
    return { success: true };
  } catch (error: any) {
    console.error('Error processing credit card payment:', error);
    return { success: false, error: error.message || 'Payment processing failed' };
  }
}

/**
 * Sign a redistribution transaction securely
 * This is used by the automated redistribution system
 * @param amount Amount to redistribute
 * @param currency Currency to use
 * @param recipientAddress Recipient address
 * @returns Signed transaction
 */
export async function signRedistributionTransaction(
  amount: string,
  currency: string,
  recipientAddress: string
): Promise<{ success: boolean; txHash?: string; error?: any }> {
  try {
    // This would use the Phantom private key to sign a transaction
    // In a real implementation, this would be done server-side for security
    
    if (currency.toUpperCase() === 'SOL' && PHANTOM_PRIVATE_KEYS.SOLANA) {
      // Initialize Solana connection if needed
      const connection = solanaConnection || new solanaWeb3.Connection(
        solanaWeb3.clusterApiUrl('mainnet-beta'),
        'confirmed'
      );
      
      // Create keypair from private key
      const privateKey = PHANTOM_PRIVATE_KEYS.SOLANA;
      const secretKey = Uint8Array.from(Buffer.from(privateKey, 'base64'));
      const keypair = solanaWeb3.Keypair.fromSecretKey(secretKey);
      
      // Create transaction
      const transaction = new solanaWeb3.Transaction().add(
        solanaWeb3.SystemProgram.transfer({
          fromPubkey: keypair.publicKey,
          toPubkey: new solanaWeb3.PublicKey(recipientAddress),
          lamports: parseFloat(amount) * solanaWeb3.LAMPORTS_PER_SOL
        })
      );
      
      // Sign and send transaction
      transaction.feePayer = keypair.publicKey;
      transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
      transaction.sign(keypair);
      
      const txid = await connection.sendRawTransaction(transaction.serialize());
      await connection.confirmTransaction(txid);
      
      return { success: true, txHash: txid };
    } else if (['ETH', 'MATIC'].includes(currency.toUpperCase()) && PHANTOM_PRIVATE_KEYS.ETHEREUM) {
      // Initialize Ethereum provider if needed
      const provider = ethereumProvider || new ethers.JsonRpcProvider('https://eth-mainnet.alchemyapi.io/v2/demo');
      
      // Create wallet from private key
      const wallet = new ethers.Wallet(PHANTOM_PRIVATE_KEYS.ETHEREUM, provider);
      
      // Convert amount to wei
      const amountWei = ethers.parseEther(amount);
      
      // Send transaction
      const tx = await wallet.sendTransaction({
        to: recipientAddress,
        value: amountWei
      });
      
      // Wait for transaction to be mined
      await tx.wait();
      
      return { success: true, txHash: tx.hash };
    }
    
    return { success: false, error: 'Unsupported currency or missing private key' };
  } catch (error) {
    console.error('Error signing redistribution transaction:', error);
    return { success: false, error };
  }
}

// Initialize
initializeBlockchainConnections();