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
    // Use the same method as Python's pow(a, -1, m)
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

// Helper function for GCD
const gcd = (a, b) => {
    while (b !== 0) {
        [a, b] = [b, a % b];
    }
    return a;
};

// Helper function to find coprime numbers
const findCoprimeNumbers = (p, count) => {
    const numbers = [];
    let num = 1;
    while (numbers.length < count) {
        if (gcd(num, p) === 1) {
            numbers.push(num);
        }
        num++;
    }
    return numbers;
};

// Constants for encryption
const p = 23;    // Prime number
const g = 5;     // Generator
const h = 11;    // Public key h = g^x mod p where x is secret key
const s = 9;     // Secret key
const n = 3;     // Number of authorities
const t = 2;     // Threshold for decryption
const b = 3;     // Random coefficient for polynomial

// Helper function to get random number
const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const voteEncryptionService = {
    encryptVote: (vote) => {
        try {
            // Convert vote to number (1 for candidate A, -1 for candidate B)
            const vi = vote === 'yes' ? 1 : -1;
            
            // Generate alpha (coprime with p)
            const alphas = findCoprimeNumbers(p, 3);
            const alpha = alphas[Math.floor(Math.random() * alphas.length)];
            
            // Calculate m1 = g^vi mod p
            const m1 = modPow(g, vi, p);
            
            // Calculate c1 = g^alpha mod p
            const c1 = modPow(g, alpha, p);
            
            // Calculate c2 = (h^alpha * m1) mod p
            const h_alpha = modPow(h, alpha, p);
            const c2 = (h_alpha * m1) % p;
            
            console.log('Encrypted vote:', { vi, alpha, m1, c1, c2 });
            return { c1, c2 };
        } catch (error) {
            console.error('Error encrypting vote:', error);
            throw new Error('Failed to encrypt vote');
        }
    },

    async setup() {
        // Generate shares using polynomial f(x) = (s + bx) mod p
        const shares = [];
        for (let i = 1; i <= n; i++) {
            const share = (s + b * i) % p;
            shares.push({ x: i, y: share });
        }
        
        return {
            p: p,
            g: g,
            h: h,
            shares: shares
        };
    },

    getTallyResults: async (combinedVotes) => {
        try {
            const { c1, c2 } = combinedVotes;
            
            console.log('Processing combined votes:', { c1, c2 });
            
            // Get partial decryptions from tally servers
            const [w1Response, w2Response] = await Promise.all([
                fetch('http://localhost:5001/partial-decrypt', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ c1 })
                }),
                fetch('http://localhost:5002/partial-decrypt', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ c1 })
                })
            ]);

            if (!w1Response.ok || !w2Response.ok) {
                throw new Error('Failed to get partial decryptions');
            }

            const w1 = await w1Response.json();
            const w2 = await w2Response.json();
            
            console.log('Raw partial decryptions:', { w1, w2 });
            
            // Extract decryption values
            const w1_value = w1.partial;
            const w2_value = w2.partial;

            console.log('Extracted decryption values:', { w1_value, w2_value });
            
            // Calculate c1^s using Lagrange interpolation
            // For n=3, t=2, we use lambda1=2 and lambda2=-1
            const l1 = 2;  // lambda1
            const l2 = -1; // lambda2
            const w1_l1 = modPow(w1_value, l1, p);  // w1^2 mod p
            const w2_l2 = l2 === -1 ? modInverse(w2_value, p) : modPow(w2_value, l2, p);  // w2^(-1) mod p
            const c1_s = (w1_l1 * w2_l2) % p;  // (w1^2 * w2^(-1)) mod p
            console.log('Calculated c1^s:', c1_s);

            // Calculate modular inverse of c1^s
            const c1_inv_s = modInverse(c1_s, p);
            console.log('Calculated c1^-s:', c1_inv_s);

            // Calculate m = c2 * c1^-s mod p
            const m = (c2 * c1_inv_s) % p;
            console.log('Calculated m:', m);
            
            // Get total number of votes from the combined votes
            const totalVotes = combinedVotes.totalVotes || 3; // Default to 3 if not provided
            console.log('Total votes:', totalVotes);

            // Calculate d using the same method as Python
            let d = null;
            // Search in a wider range to ensure we find the correct d
            const searchRange = Math.max(totalVotes * 2, 10); // Use at least 10 or twice the total votes
            console.log('Searching for d in range:', { start: -searchRange, end: searchRange });
            
            for (let i = -searchRange; i <= searchRange; i++) {
                const expectedM = modPow(g, i, p);
                if (i % 10 === 0) { // Log every 10th check to avoid spam
                    console.log(`Checking d = ${i}: expected m = ${expectedM}, actual m = ${m}`);
                }
                if (expectedM === m) {
                    d = i;
                    console.log('Found d:', d);
                    break;
                }
            }
            
            if (d === null) {
                console.error('Failed to find d value. Debug info:', {
                    combinedVotes,
                    w1_value,
                    w2_value,
                    c1_s,
                    c1_inv_s,
                    m,
                    totalVotes
                });
                throw new Error('Could not find valid d value in vote range');
            }
            
            console.log('Final calculated d:', d);
            
            // Return the result based on d value
            if (d === 0) {
                return { result: 'Equal Votes', d, total_votes: totalVotes };
            } else if (d > 0) {
                return { result: 'Yes', d, total_votes: totalVotes }; // Candidate A wins
            } else {
                return { result: 'No', d, total_votes: totalVotes }; // Candidate B wins
            }
        } catch (error) {
            console.error('Error in getTallyResults:', error);
            throw error;
        }
    }
};

export default voteEncryptionService; 