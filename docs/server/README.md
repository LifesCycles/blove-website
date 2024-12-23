# BLOVE Rewards Server

This server handles social media verification and reward distribution for BLOVE token.

## Deployment Steps

### 1. Redis Setup
1. Go to [Redis Cloud](https://redis.com/try-free/)
2. Sign up for a free account
3. Create a new subscription (Free tier - 30MB)
4. Create a new database
5. Copy the Redis URL (will look like: `redis://default:password@host:port`)

### 2. Render Setup
1. Go to [Render.com](https://render.com)
2. Sign up for a free account
3. Connect your GitHub repository
4. Create a new Web Service
5. Select the repository and branch
6. Choose the `docs/server` directory
7. Set the following environment variables:
   - `PORT`: 3000
   - `REDIS_URL`: Your Redis Cloud URL
   - `SIGNER_PRIVATE_KEY`: Your wallet private key (without 0x prefix)
   - `BLOVE_CONTRACT_ADDRESS`: Your deployed token contract address
   - `VERIFICATION_SECRET`: Your generated verification secret

## Testing the Rewards System

### 1. Get Verification Code
```bash
curl https://your-render-url.onrender.com/api/verification-code/YOUR_WALLET_ADDRESS
```

### 2. Tweet Format
Tweet must include:
- The verification code received
- Tag @BLOVE_CRYPTO
- The website URL (blove.com)

### 3. Submit for Verification
```bash
curl -X POST https://your-render-url.onrender.com/api/verify-share \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "twitter",
    "proof": "https://twitter.com/username/status/tweet_id",
    "userAddress": "YOUR_WALLET_ADDRESS"
  }'
```

## Rate Limits
- IP-based: 100 requests per 15 minutes
- Wallet-based: 2 rewards per day
- Verification codes expire after 1 hour
- Tweet URLs can only be used once
