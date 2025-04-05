import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Constants for encryption
const p = 1009; // Prime number
const g = 541;  // Generator
const secret1 = 234; // First server's secret key

// Helper function for modular exponentiation
const modPow = (base, exponent, modulus) => {
    if (modulus === 1) return 0;
    let result = 1;
    base = base % modulus;
    while (exponent > 0) {
        if (exponent % 2 === 1) {
            result = (result * base) % modulus;
        }
        exponent = Math.floor(exponent / 2);
        base = (base * base) % modulus;
    }
    return result;
};

app.post('/partial-decrypt', (req, res) => {
    try {
        const { c1 } = req.body;
        
        if (!c1 || typeof c1 !== 'number') {
            return res.status(400).json({ error: 'Invalid c1 value' });
        }
        
        console.log('Server 1 received c1:', c1);
        
        // Calculate partial decryption using server's secret
        const partial = modPow(c1, secret1, p);
        
        console.log('Server 1 partial decryption:', partial);
        
        res.json({ partial });
    } catch (error) {
        console.error('Error in partial decryption:', error);
        res.status(500).json({ error: 'Failed to compute partial decryption' });
    }
});

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Tally server 1 running on port ${PORT}`);
}); 