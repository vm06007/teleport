import { useWallet } from "src/hooks/useWallet";
import { Icon } from "@iconify/react";
import welcomeIcon from "/src/assets/images/svgs/1.svg";

interface WelcomeCardProps {
  totalValue: number;
  protocolsValue: number;
  walletValue: number;
  loading: boolean;
}

const WelcomeCard = ({ totalValue, protocolsValue, walletValue, loading }: WelcomeCardProps) => {
  const { account, isConnected } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatUSDValue = (value: number) => {
    if (value >= 1000) {
      return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    } else {
      return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  if (!isConnected || !account) {
    return null;
  }

  return (
    <div
      className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg p-6 mb-6 pb-0 pt-0"
      style={{
        background: 'url(https://ethglobal.b-cdn.net/events/unite/images/xzcwd/default.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
      >
      <div className="flex items-center justify-between">
        {/* Left side - Text content */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Icon icon="solar:chart-2-bold-duotone" className="text-white" height={20} />
            </div>
            <div>
              <h2 className="text-white text-xl font-semibold">Welcome Back</h2>
              <p className="text-white/80 text-sm">{formatAddress(account)}</p>
            </div>
          </div>

          {/* Portfolio Summary */}
          <div className="flex gap-8">
            <div className="text-center">
              <p className="text-white/60 text-sm mb-1">Total Portfolio</p>
              <p className="text-white text-2xl font-bold">
                {loading ? "..." : formatUSDValue(totalValue)}
              </p>
            </div>
            <div className="w-px bg-white/20"></div>
            <div className="text-center">
              <p className="text-white/60 text-sm mb-1">In Wallet</p>
              <p className="text-white text-2xl font-bold">
                {loading ? "..." : formatUSDValue(walletValue)}
              </p>
            </div>
            <div className="w-px bg-white/20"></div>
            <div className="text-center">
              <p className="text-white/60 text-sm mb-1">In Protocols</p>
              <p className="text-white text-2xl font-bold">
                {loading ? "..." : formatUSDValue(protocolsValue)}
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Welcome Background Image */}
        <div className="flex-shrink-0 ml-6"
        style={{
          transform: 'scale(2)',
          top: '-22px',
          position: 'relative',
          right: '70px'
        }}
        >
          <img
            src={welcomeIcon}
            alt="welcome icon"
            className="xl:max-w-[170px] lg:max-w-36 md:max-w-36 max-w-32"
          />
        </div>
      </div>
    </div>
  );
};

export default WelcomeCard;