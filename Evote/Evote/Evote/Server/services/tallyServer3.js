import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Constants for encryption
const p = 1009; // Prime number
const g = 541;  // Generator
const d3 = 690; // Third server's share of the private key (x3)

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
    const { c1 } = req.body;
    if (!c1) {
        return res.status(400).json({ error: 'Missing c1 parameter' });
    }

    // Calculate partial decryption using server 3's private key
    // w3 = c1^(d3) mod p where d3 is server 3's share of the private key
    const w3 = modPow(c1, d3, p);
    
    console.log('Server 3 - Input c1:', c1);
    console.log('Server 3 - Computed w3:', w3);
    
    res.json({ partial: w3 });
});

const PORT = 5003;
app.listen(PORT, () => {
    console.log(`Tally server 3 running on port ${PORT}`);
}); 