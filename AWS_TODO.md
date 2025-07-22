# Quick Setup Steps

## 1. Create AWS Account

- Go to [aws.amazon.com](https://aws.amazon.com) and sign up.
- Requires a credit card, but you won't be charged for free tier usage.

## 2. Enable Bedrock Access

- Go to the AWS Bedrock console.
- Request model access for **Claude 3.5 Sonnet** (usually approved instantly).

## 3. Create IAM User (Recommended Over Root Credentials)

- Create a user with programmatic access.
- Attach the policy: `AmazonBedrockFullAccess`  
  (or create a custom policy with just `bedrock:InvokeModel`).
- Save the **Access Key ID** and **Secret Access Key**.

## 4. Set Environment Variables

1. Create AWS Account: Go to aws.amazon.com and sign up (requires credit card but won't charge for free tier usage)
2. Enable Bedrock Access:


    - Go to AWS Bedrock console
    - Request model access for "Claude 3.5 Sonnet" (usually approved instantly)

3. Create IAM User (recommended over root credentials):


    - Create user with programmatic access
    - Attach policy: AmazonBedrockFullAccess (or create custom policy with just bedrock:InvokeModel)
    - Save the Access Key ID and Secret Access Key

4. Environment Variables You'll Need:
   AI_PROVIDER=bedrock
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_key_here  
   AWS_SECRET_ACCESS_KEY=your_secret_here
   BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
