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
const a2 = 15;   // Share for server 2 (f(2) = (s + b*2) mod p)

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

    // Calculate partial decryption using server 2's share
    // w2 = c1^a2 mod p where a2 is server 2's share
    const w2 = modPow(c1, a2, p);
    
    console.log('Server 2 - Input c1:', c1);
    console.log('Server 2 - Share a2:', a2);
    console.log('Server 2 - Computed w2:', w2);
    
    res.json({ partial: w2 });
});

const PORT = 5002;
app.listen(PORT, () => {
    console.log(`Tally server 2 running on port ${PORT}`);
}); 