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

// Constants for encryption
const p = 1009; // Prime number
const g = 541;  // Generator
const secret = 690; // Secret key
const h = modPow(g, secret, p);

// Helper function to get random number
const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const voteEncryptionService = {
    encryptVote: async (vote) => {
        try {
            // Convert vote to number (-1 for yes, 1 for no)
            const vi = vote === 'yes' ? -1 : 1;
            
            // Generate random y between 1 and p-1
            const y = getRandomInt(1, p-1);
            
            // Calculate c1 = g^y mod p
            const c1 = modPow(g, y, p);
            
            // Calculate c2 = g^vi * h^y mod p
            const c2 = (modPow(g, vi, p) * modPow(h, y, p)) % p;
            
            // Ensure positive values
            const c1_positive = c1 < 0 ? c1 + p : c1;
            const c2_positive = c2 < 0 ? c2 + p : c2;
            
            // Validate the encrypted values
            if (!c1_positive || !c2_positive || isNaN(c1_positive) || isNaN(c2_positive)) {
                throw new Error('Invalid encrypted vote data received');
            }
            
            console.log('Encrypted vote:', { vi, y, c1: c1_positive, c2: c2_positive });
            
            return { c1: c1_positive, c2: c2_positive };
        } catch (error) {
            console.error('Encryption error:', error);
            throw new Error('Failed to encrypt vote: ' + error.message);
        }
    },

    decryptVote: async (c1, c2) => {
        try {
            if (typeof c1 !== 'number' || typeof c2 !== 'number' || isNaN(c1) || isNaN(c2)) {
                throw new Error('Invalid encrypted values');
            }

            const s = modPow(c1, secret, p);
            const sInverse = modPow(s, p - 2, p);
            let voteValue = (c2 * sInverse) % p;
            
            // Ensure voteValue is positive
            if (voteValue < 0) {
                voteValue = (voteValue + p) % p;
            }

            if (voteValue === p - 1) return -1; // Yes
            if (voteValue === 1) return 1;      // No
            throw new Error('Invalid decrypted vote value');
        } catch (error) {
            console.error('Decryption error:', error);
            throw new Error('Failed to decrypt vote: ' + error.message);
        }
    },

    async setup() {
        return {
            p: p,
            g: g,
            h: h
        };
    },

    getTallyResults: async (encryptedVotes) => {
        try {
            if (!Array.isArray(encryptedVotes) || encryptedVotes.length === 0) {
                return { result: "No votes", d: 0 };
            }

            console.log('Processing votes:', encryptedVotes);

            // Calculate product of all c1 and c2 values
            let product_c1 = 1;
            let product_c2 = 1;
            
            // Process each vote
            encryptedVotes.forEach(vote => {
                if (!vote.encryptedValue || !vote.encryptedValue.c1 || !vote.encryptedValue.c2) {
                    console.error('Invalid vote format:', vote);
                    return;
                }
                
                // Multiply the encrypted values (homomorphic property)
                product_c1 = (product_c1 * vote.encryptedValue.c1) % p;
                product_c2 = (product_c2 * vote.encryptedValue.c2) % p;
            });

            console.log('Combined encrypted values:', { product_c1, product_c2 });

            // Get partial decryptions from both servers
            const [server1Response, server2Response] = await Promise.all([
                fetch('http://localhost:5001/partial-decrypt', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ c1: product_c1 })
                }).then(res => {
                    if (!res.ok) throw new Error('Server 1 failed to decrypt');
                    return res.json();
                }),
                fetch('http://localhost:5002/partial-decrypt', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ c1: product_c1 })
                }).then(res => {
                    if (!res.ok) throw new Error('Server 2 failed to decrypt');
                    return res.json();
                })
            ]);

            // Combine partial decryptions
            const s1 = server1Response.partial;
            const s2 = server2Response.partial;
            
            console.log('Partial decryptions:', { s1, s2 });
            
            // Calculate final s value
            const s = (s1 * s2) % p;
            
            // Calculate s_inverse = s^(p-2) mod p
            const s_inverse = modPow(s, p - 2, p);
            
            // Calculate m = c2 * s_inverse mod p
            let m = (product_c2 * s_inverse) % p;
            
            // Ensure m is positive
            if (m < 0) m = (m + p) % p;

            console.log('Decryption values:', { s, s_inverse, m });

            // Find the discrete log to get the vote difference
            let d = null;
            const maxVotes = encryptedVotes.length;
            
            // Search for d in the range [-maxVotes, maxVotes]
            for (let candidate_d = -maxVotes; candidate_d <= maxVotes; candidate_d++) {
                const test_value = modPow(g, candidate_d, p);
                if (test_value === m) {
                    d = candidate_d;
                    break;
                }
            }

            console.log('Vote counting result:', {
                total_votes: maxVotes,
                difference: d,
                m: m
            });

            // Determine result based on d (matching reference project logic)
            let result;
            if (d === null) {
                result = "Error in vote counting";
            } else if (d < 0) {
                result = "Yes";
            } else if (d === 0) {
                result = "Equal Votes";
            } else {
                result = "No";
            }

            return {
                result,
                d: d || 0,
                total_votes: maxVotes,
                yes_votes: Math.round((maxVotes - (d || 0)) / 2),
                no_votes: Math.round((maxVotes + (d || 0)) / 2)
            };
        } catch (error) {
            console.error('Tally error:', error);
            throw new Error('Failed to tally votes: ' + error.message);
        }
    }
};

export default voteEncryptionService; 