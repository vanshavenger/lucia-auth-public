# Lucia Authentication System

A robust and feature-rich authentication system built with Lucia, offering various authentication methods and security features.

## Features

- **Email Verification**: Secure user registration with email verification.
- **Multiple OAuth Providers**:
  - GitHub
  - Google
  - Discord
- **Password Recovery**: Implemented "Forgot Password" functionality.
- **Magic Link Authentication**: Passwordless login via email.
- **Custom Lucia Integration**: Built from scratch for maximum flexibility.
- **Secure Password Hashing**: Utilizes `@node-rs/argon` for efficient and secure password hashing.
- **Two-Factor Authentication (2FA)**: Coming soon!
- **Authenticator App Support**: Coming soon!

## Getting Started

### Prerequisites

- Next Js (v14 or later)
- npm or yarn or bun or pnpm
- Postgress
- Docker (Just the basics)

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/vanshavenger/lucia-auth-system.git
   cd lucia-auth-system
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:

   ```
    DATABASE_URL='postgresql://postgres:postgres@postgres:5432/postgres'
    GOOGLE_CLIENT_ID=
    GOOGLE_CLIENT_SECRET=
    GITHUB_CLIENT_SECRET=
    GITHUB_CLIENT_ID=
    DISCORD_CLIENT_ID=
    DISCORD_CLIENT_SECRET=
    APP_NAME='http://localhost:3000'
    JWT_SECRET=''
    GMAIL_PASSWORD=
    GMAIL_USER=
   ```

   or you can copy .env.sample for starters

4. Start the development server:
   ```
   docker compose up --build
   ```

## Usage

### Email Verification

After registration, users will receive a verification email. They must click the link in the email to verify their account.

### OAuth Login

Users can log in using their GitHub, Google, or Discord accounts. Click on the respective buttons on the login page.

### Forgot Password

1. Click on the "Forgot Password" link on the login page.
2. Enter your email address.
3. Check your email for password reset instructions.

### Magic Link Login

1. On the login page, choose "Login with Magic Link".
2. Enter your email address.
3. Check your email for the magic link and click it to log in.

## Security

- Passwords are hashed using `@node-rs/argon` for top-notch security.
- Two-Factor Authentication (2FA) will be available soon for an extra layer of security.

## Contributing

We welcome contributions!

## License

This project is licensed under the MIT License!

## Acknowledgments

- [Lucia Auth](https://lucia-auth.com/) for the excellent authentication library.
- All contributors and supporters of this project.

## Contact

For any queries or support, please open an issue in this repository or contact us at vanshchopra101@gmail.com
