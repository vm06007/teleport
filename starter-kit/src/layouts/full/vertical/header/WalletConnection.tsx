import { useWallet } from "src/hooks/useWallet";
import { Icon } from "@iconify/react";

const WalletConnection = () => {
  const { account, isConnecting, connectWallet, disconnectWallet, isConnected, chainId } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getChainName = (chainId: number) => {
    switch (chainId) {
      case 1: return "Multichain";
      case 137: return "Polygon";
      case 42161: return "Arbitrum";
      default: return `Chain ${chainId}`;
    }
  };

  const getChainIcon = (chainId: number) => {
    switch (chainId) {
      case 1: return "cryptocurrency:eth";
      case 137: return "cryptocurrency:matic";
      case 42161: return "cryptocurrency:arb";
      default: return "cryptocurrency:generic";
    }
  };

  if (!isConnected) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="h-10 px-4 bg-primary hover:bg-primary/80 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-50"
        >
          <Icon icon="solar:wallet-money-bold-duotone" height={16} />
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Network Selector */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-darkminisidebar rounded-lg border border-gray-200 dark:border-gray-700">
        <Icon icon={getChainIcon(chainId!)} height={16} className="text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {getChainName(chainId!)}
        </span>
        <Icon icon="solar:alt-arrow-down-bold-duotone" height={12} className="text-gray-500" />
      </div>

      {/* Wallet Address */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-darkminisidebar rounded-lg border border-gray-200 dark:border-gray-700">
        <Icon icon="solar:wallet-money-bold-duotone" height={16} className="text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {formatAddress(account!)}
        </span>
      </div>

      {/* Disconnect Button */}
      <button
        onClick={disconnectWallet}
        className="h-10 w-10 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition-colors"
        title="Disconnect Wallet"
      >
        <Icon icon="solar:logout-2-bold-duotone" height={16} />
      </button>
    </div>
  );
};

export default WalletConnection; 