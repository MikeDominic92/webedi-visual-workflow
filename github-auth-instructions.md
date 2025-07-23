# GitHub Authentication Instructions

To authenticate GitHub CLI and continue with deployment, please follow these steps:

## Option 1: Web Browser Authentication (Recommended)

1. Open a Command Prompt or PowerShell window
2. Run this command:
   ```
   "C:\Program Files\GitHub CLI\gh.exe" auth login
   ```
3. Choose the following options:
   - What account do you want to log into? **GitHub.com**
   - What is your preferred protocol for Git operations? **HTTPS**
   - Authenticate Git with your GitHub credentials? **Yes**
   - How would you like to authenticate GitHub CLI? **Login with a web browser**

4. Press Enter when prompted and your browser will open
5. Enter the 8-digit code shown in your terminal
6. Authorize GitHub CLI

## Option 2: Personal Access Token

If you prefer to use a Personal Access Token:

1. Go to https://github.com/settings/tokens/new
2. Create a new token with these scopes:
   - `repo` (Full control of private repositories)
   - `workflow` (Update GitHub Action workflows)
   - `admin:org` (if you're using an organization)

3. Copy the token
4. Run: `"C:\Program Files\GitHub CLI\gh.exe" auth login`
5. Choose **Paste an authentication token** when prompted
6. Paste your token

## After Authentication

Once authenticated, come back here and we'll continue with:
- Creating the GitHub repository
- Pushing your code
- Deploying to Netlify

The authentication only needs to be done once!