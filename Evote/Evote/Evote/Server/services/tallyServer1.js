import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Constants for encryption
const p = 23;    // Prime number
const g = 5;     // Generator
const h = 11;    // Public key
const s = 9;     // Secret key
const b = 3;     // Random coefficient for polynomial
const a1 = 12;   // Share for server 1 (f(1) = (s + b*1) mod p)

// Helper function for modular exponentiation
const modPow = (base, exponent, modulus) => {
    if (modulus === 1) return 0;
    
    // Handle negative exponents
    if (exponent < 0) {
        // First find modular multiplicative inverse of base
        const inverse = modInverse(base, modulus);
        // Then calculate positive exponent
        return modPow(inverse, -exponent, modulus);
    }
    
    let result = 1;
    base = base % modulus;
    while (exponent > 0) {
        if (exponent % 2 === 1) {
            result = (result * base) % modulus;
        }
        base = (base * base) % modulus;
        exponent = Math.floor(exponent / 2);
    }
    return result;
};

// Helper function for modular multiplicative inverse
const modInverse = (a, m) => {
    let m0 = m;
    let y = 0;
    let x = 1;

    if (m === 1) return 0;

    while (a > 1) {
        const q = Math.floor(a / m);
        let t = m;
        m = a % m;
        a = t;
        t = y;
        y = x - q * y;
        x = t;
    }

    if (x < 0) x += m0;
    return x;
};

app.post('/partial-decrypt', (req, res) => {
    const { c1 } = req.body;
    if (!c1) {
        return res.status(400).json({ error: 'Missing c1 parameter' });
    }

    // Calculate partial decryption using server 1's share
    // w1 = c1^a1 mod p where a1 is server 1's share
    const w1 = modPow(c1, a1, p);
    
    console.log('Server 1 - Input c1:', c1);
    console.log('Server 1 - Share a1:', a1);
    console.log('Server 1 - Computed w1:', w1);
    
    res.json({ partial: w1 });
});

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Tally server 1 running on port ${PORT}`);
}); 