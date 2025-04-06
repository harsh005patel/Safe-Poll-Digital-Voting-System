import requests
from flask import Flask, request, jsonify
import random
from functools import reduce
from flask_cors import CORS
import os
import json

# Constants for encryption (matching your JavaScript implementation)
p = 23    # Prime number
g = 5     # Generator
h = 11    # Public key
s = 9     # Secret key
b = 3     # Random coefficient for polynomial
n = 3     # Number of servers
t = 2     # Threshold

BASE_URL = "http://127.0.0.1"

app = Flask(__name__)
CORS(app)

# Store election data in memory (in production, use a database)
elections = {}

def mod_pow(base, exponent, modulus):
    if modulus == 1:
        return 0
    
    # Handle negative exponents
    if exponent < 0:
        # First find modular multiplicative inverse of base
        inverse = mod_inverse(base, modulus)
        # Then calculate positive exponent
        return mod_pow(inverse, -exponent, modulus)
    
    result = 1
    base = base % modulus
    while exponent > 0:
        if exponent % 2 == 1:
            result = (result * base) % modulus
        base = (base * base) % modulus
        exponent = exponent // 2
    return result

def mod_inverse(a, m):
    m0 = m
    y = 0
    x = 1

    if m == 1:
        return 0

    while a > 1:
        q = a // m
        t = m
        m = a % m
        a = t
        t = y
        y = x - q * y
        x = t

    if x < 0:
        x += m0
    return x

def gcd(a, b):
    while b != 0:
        a, b = b, a % b
    return a

def find_coprime_numbers(p, count):
    numbers = []
    num = 1
    while len(numbers) < count:
        if gcd(num, p) == 1:
            numbers.append(num)
        num += 1
    return numbers

def generate_polynomial(t, secret):
    # Using fixed coefficients as in your implementation
    return [9, 3]

def evaluate_polynomial(coefficients, x):
    return sum(c * (x ** i) for i, c in enumerate(coefficients))

def calculate_modular_product(election_id, prime_p):
    file_path = f'encrypted_data_{election_id}.txt'
    if not os.path.exists(file_path):
        return 1, 1, 0

    with open(file_path, 'r') as file:
        lines = file.readlines()

    c1_values = []
    c2_values = []

    for line in lines:
        c1, c2 = map(int, line.strip().split())
        c1_values.append(c1)
        c2_values.append(c2)

    product_c1 = reduce(lambda x, y: (x * y) % prime_p, c1_values, 1)
    product_c2 = reduce(lambda x, y: (x * y) % prime_p, c2_values, 1)

    return product_c1, product_c2, len(c1_values)

def fetch_data_from_servers():
    # For now, return fixed values as in your implementation
    return 12, 15  # These are the shares for servers 1 and 2

def calculate_w1_w2(product_c1, data_from_5001, data_from_5002):
    w1 = mod_pow(product_c1, data_from_5001, p) 
    w2 = mod_pow(product_c1, data_from_5002, p) 
    return w1, w2

def calculate_c1_secret(w1, w2, l1=2, l2=-1):
    w1_l1 = mod_pow(w1, l1, p)  # w1^l1 mod p
    w2_l2 = mod_pow(w2, -1, p) if l2 == -1 else mod_pow(w2, l2, p)
    c1_secret = (w1_l1 * w2_l2) % p  # (w1^l1 * w2^l2) mod p
    return c1_secret

def calculate_d(m, g, p, votes):
    d = None
    # For n votes, the maximum possible d value is n (all votes for one candidate)
    # and minimum is -n (all votes for other candidate)
    search_range = votes  # Use the actual number of votes as the range
    
    print(f"Searching for d in range [-{search_range}, {search_range}]")
    print(f"Looking for d where g^d ≡ m (mod p)")
    print(f"g = {g}, m = {m}, p = {p}")
    
    for candidate_d in range(-search_range, search_range + 1):
        expected_m = mod_pow(g, candidate_d, p)
        if expected_m == m:
            d = candidate_d
            print(f"Found d = {d}")
            print(f"Verification: g^d ≡ {expected_m} ≡ {m} (mod p)")
            break
            
    if d is None:
        print(f"Warning: Could not find d value for m = {m}")
        print(f"Searched range: [-{search_range}, {search_range}]")
        
    return d

@app.route('/elections', methods=['POST'])
def create_election():
    data = request.get_json()
    election_id = data.get('election_id')
    title = data.get('title')
    candidates = data.get('candidates', [])
    
    if not election_id or not title or not candidates:
        return jsonify({"error": "Missing required fields"}), 400
        
    if election_id in elections:
        return jsonify({"error": "Election ID already exists"}), 400
        
    elections[election_id] = {
        'title': title,
        'candidates': candidates,
        'status': 'active',
        'votes': 0,
        'setup_completed': False
    }
    
    # Create empty file for this election
    with open(f'encrypted_data_{election_id}.txt', 'w') as file:
        pass
        
    return jsonify({
        "message": "Election created successfully",
        "election_id": election_id,
        "title": title,
        "candidates": candidates
    }), 201

@app.route('/elections/<election_id>', methods=['GET'])
def get_election(election_id):
    if election_id not in elections:
        return jsonify({"error": "Election not found"}), 404
        
    return jsonify(elections[election_id]), 200

@app.route('/elections', methods=['GET'])
def list_elections():
    return jsonify(list(elections.values())), 200

@app.route('/elections/<election_id>/setup', methods=['GET'])
def setup_election(election_id):
    if election_id not in elections:
        return jsonify({"error": "Election not found"}), 404
        
    polynomial = generate_polynomial(t, s)  # Using s instead of secret
    shares = {i: evaluate_polynomial(polynomial, i) for i in range(1, n + 1)}

    # Store shares in election data
    elections[election_id]['shares'] = shares
    elections[election_id]['setup_completed'] = True

    return jsonify({
        "message": "Setup complete",
        "secret": s,
        "shares": shares
    }), 200

@app.route('/elections/<election_id>/vote', methods=['POST'])
def vote(election_id):
    if election_id not in elections:
        return jsonify({"error": "Election not found"}), 404
        
    if elections[election_id]['status'] != 'active':
        return jsonify({"error": "Election is not active"}), 400
        
    if not elections[election_id].get('setup_completed'):
        return jsonify({"error": "Election setup not completed"}), 400
        
    data = request.get_json()
    vote = data.get('vote')  # 'yes' or 'no'

    if vote not in ['yes', 'no']:
        return jsonify({"error": "Vote must be 'yes' or 'no'"}), 400

    try:
        # Convert vote to number (1 for yes, -1 for no)
        vi = 1 if vote == 'yes' else -1
        
        # Generate alpha (coprime with p)
        alphas = find_coprime_numbers(p, 3)
        alpha = random.choice(alphas)
        
        # Calculate m1 = g^vi mod p
        m1 = mod_pow(g, vi, p)
        
        # Calculate c1 = g^alpha mod p
        c1 = mod_pow(g, alpha, p)
        
        # Calculate c2 = (h^alpha * m1) mod p
        h_alpha = mod_pow(h, alpha, p)
        c2 = (h_alpha * m1) % p

        # Append vote to election-specific file
        with open(f'encrypted_data_{election_id}.txt', 'a') as file:
            file.write(f"{c1} {c2}\n")

        elections[election_id]['votes'] += 1

        return jsonify({
            "message": "Vote recorded successfully", 
            "c1": c1, 
            "c2": c2
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/elections/<election_id>/tally', methods=['GET'])
def tally_election(election_id):
    if election_id not in elections:
        return jsonify({"error": "Election not found"}), 404
        
    try:
        data_from_5001, data_from_5002 = fetch_data_from_servers()
        product_c1, product_c2, votes = calculate_modular_product(election_id, p)
        
        print(f"\nTallying election {election_id}")
        print(f"Total votes: {votes}")
        print(f"Product c1: {product_c1}")
        print(f"Product c2: {product_c2}")
        
        w1, w2 = calculate_w1_w2(product_c1, data_from_5001, data_from_5002)
        print(f"Partial decryptions: w1 = {w1}, w2 = {w2}")
        
        c1_secret = calculate_c1_secret(w1, w2)
        print(f"c1^s = {c1_secret}")
        
        mod_inv_c1_secret = mod_inverse(c1_secret, p)
        print(f"(c1^s)^-1 = {mod_inv_c1_secret}")
        
        m = (mod_inv_c1_secret * product_c2) % p
        print(f"m = {m}")
        
        d = calculate_d(m, g, p, votes)
        print(f"Final d value: {d}")

        result = "Equal Votes" if d == 0 else "Yes" if d and d < 0 else "No"

        # Update election status
        elections[election_id]['status'] = 'completed'
        elections[election_id]['result'] = result
        elections[election_id]['d_value'] = abs(d) if d is not None else "No solution found"

        return jsonify({
            "message": "Tally successful",
            "votes": votes,
            "product_c1": product_c1,
            "product_c2": product_c2,
            "data_from_5001": data_from_5001,
            "data_from_5002": data_from_5002,
            "w1": w1,
            "w2": w2,
            "c1_secret": c1_secret,
            "mod_inv_c1_secret": mod_inv_c1_secret,
            "m": m,
            "d": abs(d) if d is not None else "No solution found",
            "result": result,
            "public_key": h
        }), 200

    except Exception as e:
        print(f"Error in tally_election: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/elections/<election_id>/status', methods=['GET'])
def get_election_status(election_id):
    if election_id not in elections:
        return jsonify({"error": "Election not found"}), 404
        
    return jsonify({
        "status": elections[election_id]['status'],
        "votes": elections[election_id]['votes'],
        "result": elections[election_id].get('result'),
        "d_value": elections[election_id].get('d_value'),
        "setup_completed": elections[election_id].get('setup_completed', False)
    }), 200

if __name__ == '__main__':
    app.run(port=4434)

