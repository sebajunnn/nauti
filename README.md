# Nauti

A decentralized marketplace for buying and selling blocks built with Next.js, Tailwind CSS, shadcn/ui, and smart contracts.

## Prerequisites

Before you begin, ensure you have installed:

-   [Node.js](https://nodejs.org/) (v18.x or higher)
-   [pnpm](https://pnpm.io/) (v8.x or higher)
-   [Git](https://git-scm.com/)

## 🚀 Quick Start

1. Clone the repository:

```bash
git clone https://github.com/your-username/blocks-for-sale.git
cd blocks-for-sale
```

2. Install dependencies:

```bash
pnpm install
```

3. Start local hardhat node:

```bash
pnpm contracts:chain
```

4. Start the development environment:

```bash
# Start the Next.js frontend
pnpm dev
```

The app should now be running on [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
blocks-for-sale/
├── packages/
│   ├── nextjs/                 # Next.js frontend application
│   │   ├── components/         # React components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── pages/             # Next.js pages
│   │   └── styles/            # Global styles and Tailwind CSS config
│   └── hardhat/               # Smart contract development environment
├── pnpm-workspace.yaml        # Workspace configuration
└── package.json              # Root package.json
```

## 🛠 Development

### Frontend Development

The frontend is built with:

-   Next.js 13 (App Router)
-   TypeScript
-   Tailwind CSS
-   shadcn/ui
-   wagmi/viem for Web3 interactions

To start the frontend in development mode:

```bash
pnpm dev
```

### Smart Contract Development

Smart contracts are developed using Hardhat. To work with contracts:

```bash
# Deploy contracts
pnpm contracts:deploy
```

## 📚 Additional Documentation

-   [Frontend Documentation](./packages/nextjs/README.md)
-   [Smart Contract Documentation](./packages/contracts/README.md)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

-   [Scaffold-ETH 2](https://github.com/scaffold-eth/scaffold-eth-2)
-   [shadcn/ui](https://ui.shadcn.com/)
-   [wagmi](https://wagmi.sh/)
