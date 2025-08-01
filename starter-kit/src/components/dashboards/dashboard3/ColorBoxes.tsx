
import { Icon } from "@iconify/react";
import { Button, Modal } from "flowbite-react";
import CardBox from "src/components/shared/CardBox";
import { useWallet } from "src/hooks/useWallet";
import { fetchPortfolioData } from "src/services/portfolioService";
import { useState, useEffect } from "react";
import WelcomeCard from "./WelcomeCard";

const ColorBoxes = () => {
  const { account, chainId } = useWallet();
  const [selectedProtocol, setSelectedProtocol] = useState<any>(null);
  const [protocolBreakdown, setProtocolBreakdown] = useState<any>(null);
  const [portfolioData, setPortfolioData] = useState({
    totalValue: 0,
    aaveValue: 0,
    sparkValue: 0,
    uniswapValue: 0,
    curveValue: 0,
    oneInchValue: 0,
    pendleValue: 0,
    protocolsValue: 0,
    walletValue: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (account && chainId) {
      fetchPortfolioDataFromService();
    }
  }, [account, chainId]);

  const fetchPortfolioDataFromService = async () => {
    if (!account || !chainId) return;

    try {
      setLoading(true);
      const data = await fetchPortfolioData(account, chainId);
      setPortfolioData(data);
    } catch (error) {
      console.error("Error fetching portfolio data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatUSDValue = (value: number) => {
    if (value >= 1000) {
      return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    } else {
      return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  const fetchProtocolBreakdown = async (protocolTitle: string) => {
    if (!account || !chainId) return null;

    try {
      console.log(`🔍 Fetching breakdown for ${protocolTitle}...`);
      
      // Get snapshot data for supplied amounts (same as interest table)
      const snapshotResponse = await fetch(`http://localhost:5003/proxy?url=https://api.1inch.dev/portfolio/portfolio/v5.0/protocols/snapshot?addresses=${account}&chain_id=${chainId}`);
      const snapshotData = await snapshotResponse.json();

      if (!snapshotData.result) return null;

      const protocols = snapshotData.result || [];
      
      // Find protocols matching the selected protocol (handle version suffixes)
      const matchingProtocols = protocols.filter((protocol: any) => {
        const protocolName = protocol.protocol_group_name?.toLowerCase() || '';
        const titleLower = protocolTitle.toLowerCase();
        
        return protocolName.includes(titleLower) || titleLower.includes(protocolName) ||
               (titleLower.includes('aave') && protocolName.includes('aave')) ||
               (titleLower.includes('pendle') && protocolName.includes('pendle')) ||
               (titleLower.includes('uniswap') && protocolName.includes('uniswap')) ||
               (titleLower.includes('curve') && protocolName.includes('curve')) ||
               (titleLower.includes('spark') && protocolName.includes('spark')) ||
               (titleLower.includes('1inch') && protocolName.includes('1inch'));
      });

      console.log(`Found ${matchingProtocols.length} matching protocols for ${protocolTitle}:`, matchingProtocols.map((p: any) => p.protocol_group_name));

      if (matchingProtocols.length === 0) {
        return {
          supplied: 0,
          interest: 0,
          borrowed: 0, // Placeholder for future implementation
          debt: 0      // Placeholder for future implementation
        };
      }

      // Calculate total supplied amount (same logic as interest table)
      const stablecoins = ['usds', 'usdc', 'usdt', 'dai', 'busd', 'frax', 'usdp', 'tusd', 'usdn'];
      
      let totalSupplied = 0;

      matchingProtocols.forEach((protocol: any) => {
        // Calculate supplied amount from underlying tokens
        const suppliedAmount = (protocol.underlying_tokens || []).reduce((sum: number, token: any) => {
          const tokenSymbol = (token.symbol || '').toLowerCase();
          const isStablecoin = stablecoins.some(stable => tokenSymbol.includes(stable));
          const priceToUse = isStablecoin ? 1.0 : (token.price_usd || 0);
          const tokenValue = (token.amount || 0) * priceToUse;
          return sum + tokenValue;
        }, 0);

        totalSupplied += suppliedAmount;
      });

      // Get EXACT current value from protocol cards (same as interest table)
      let currentValueFromCards = 0;
      const protocolName = protocolTitle.toLowerCase();
      if (protocolName.includes('spark')) {
        currentValueFromCards = portfolioData.sparkValue;
      } else if (protocolName.includes('aave')) {
        currentValueFromCards = portfolioData.aaveValue;
      } else if (protocolName.includes('pendle')) {
        currentValueFromCards = portfolioData.pendleValue;
      } else if (protocolName.includes('uniswap')) {
        currentValueFromCards = portfolioData.uniswapValue;
      } else if (protocolName.includes('curve')) {
        currentValueFromCards = portfolioData.curveValue;
      } else if (protocolName.includes('1inch')) {
        currentValueFromCards = portfolioData.oneInchValue;
      }

      // Interest = Protocol Card Value - Supplied (EXACT same as interest table)
      const interest = Math.max(0, currentValueFromCards - totalSupplied);

      console.log(`💰 ${protocolTitle} Breakdown:`, {
        supplied: totalSupplied,
        currentValueFromCards: currentValueFromCards,
        interest: interest,
        borrowed: 0,
        debt: 0
      });

      return {
        supplied: totalSupplied,
        interest: interest,
        borrowed: 0, // Placeholder - will be implemented later
        debt: 0      // Placeholder - will be implemented later
      };

    } catch (error) {
      console.error(`Error fetching ${protocolTitle} breakdown:`, error);
      return {
        supplied: 0,
        interest: 0,
        borrowed: 0,
        debt: 0
      };
    }
  };

  const portfolioCards = [
    {
      bg: "primary-gradient",
      logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x808507121B80c02388fAd14726482e061B8da827/logo.png", // Actual Pendle logo
      fallbackIcon: "solar:leaf-bold-duotone",
      color: "bg-primary",
      title: "Pendle",
      price: loading ? "..." : formatUSDValue(portfolioData.pendleValue),
      value: portfolioData.pendleValue,
      link: "#",
      externalLink: "https://app.pendle.finance/",
    },
    {
      bg: "warning-gradient",
      logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9/logo.png", // Actual Aave logo
      fallbackIcon: "solar:safe-2-bold-duotone",
      color: "bg-warning",
      title: "Aave",
      price: loading ? "..." : formatUSDValue(portfolioData.aaveValue),
      value: portfolioData.aaveValue,
      link: "#",
      externalLink: "https://app.aave.com/",
    },
    {
      bg: "secondary-gradient",
      logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xD533a949740bb3306d119CC777fa900bA034cd52/logo.png", // Actual Curve logo
      fallbackIcon: "solar:graph-bold-duotone",
      color: "bg-secondary",
      title: "Curve",
      price: loading ? "..." : formatUSDValue(portfolioData.curveValue),
      value: portfolioData.curveValue,
      link: "#",
      externalLink: "https://curve.fi/",
    },
    {
      bg: "error-gradient",
      logo: "https://asset-metadata-service-production.s3.amazonaws.com/asset_icons/eec087023aa976ee9fe4aa05b54d35d918c9a45c7770000f5745ea6ce14adaf1.png", // Actual Spark logo
      fallbackIcon: "solar:flame-bold-duotone",
      color: "bg-error",
      title: "Spark",
      price: loading ? "..." : formatUSDValue(portfolioData.sparkValue),
      value: portfolioData.sparkValue,
      link: "#",
      externalLink: "https://app.spark.fi/",
    },
    {
      bg: "success-gradient",
      logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo.png", // Actual Uniswap logo
      fallbackIcon: "solar:atom-bold-duotone",
      color: "bg-success",
      title: "Uniswap",
      price: loading ? "..." : formatUSDValue(portfolioData.uniswapValue),
      value: portfolioData.uniswapValue,
      link: "#",
      externalLink: "https://app.uniswap.org/",
    },
    {
      bg: "secondary-gradient",
      logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x111111111117dC0aa78b770fA6A738034120C302/logo.png", // Actual 1inch logo
      fallbackIcon: "cryptocurrency:1inch",
      color: "bg-info",
      title: "1inch",
      price: loading ? "..." : formatUSDValue(portfolioData.oneInchValue),
      value: portfolioData.oneInchValue,
      link: "#",
      externalLink: "https://app.1inch.io/",
    },
  ];

    return (
    <>
      <CardBox className="w-full max-w-none">
        {/* Welcome Card */}
        <WelcomeCard
          totalValue={portfolioData.totalValue}
          protocolsValue={portfolioData.protocolsValue}
          walletValue={portfolioData.walletValue}
          loading={loading}
        />

        {/* Portfolio Cards */}
        <div className="w-full">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 w-full">
            {portfolioCards.map((item, index) => (
              <div className="w-full" key={index}>
                  <div
                    className={`text-center px-5 py-30 rounded-tw ${item.bg}`}
                    style={{ 
                      filter: item.value === 0 ? 'grayscale(0.7)' : 'none',
                      opacity: item.value === 0 ? 0.7 : 1
                    }}
                  >
                    <span
                      className={`h-12 w-12 mx-auto flex items-center justify-center rounded-tw ${item.color} p-2`}
                    >
                      <img
                        src={item.logo}
                        alt={`${item.title} logo`}
                        className="object-contain max-w-full max-h-full"
                        style={{ height: '28px', width: '28px', borderRadius: '20px' }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          console.log(`Failed to load logo for ${item.title}, using fallback icon`);
                          target.style.display = 'none';
                          const iconFallback = target.nextSibling as HTMLElement;
                          if (iconFallback) iconFallback.style.display = 'flex';
                        }}
                        onLoad={() => {
                          console.log(`Successfully loaded logo for ${item.title}`);
                        }}
                      />
                      <div className="hidden items-center justify-center w-full h-full">
                        <Icon
                          icon={item.fallbackIcon}
                          className="text-white"
                          height={24}
                        />
                      </div>
                    </span>
                    <p className="text-ld font-normal mt-4 mb-2">
                      {item.title}
                    </p>
                    <h4 className="text-22">{item.price}</h4>
                    <div className="flex items-center justify-center gap-2 mt-5">
                      <Button
                        onClick={async () => {
                          setSelectedProtocol(item);
                          // Fetch real protocol breakdown data
                          const breakdown = await fetchProtocolBreakdown(item.title);
                          setProtocolBreakdown(breakdown);
                        }}
                        className="bg-white hover:bg-dark text-ld font-semibold hover:text-white shadow-sm py-1 px-2 dark:bg-darkgray dark:hover:bg-dark"
                        size="xs"
                      >
                        Details
                      </Button>
                      <Button
                        onClick={() => window.open(item.externalLink, '_blank', 'noopener,noreferrer')}
                        className="bg-white hover:bg-dark shadow-sm p-1 dark:bg-darkgray dark:hover:bg-dark group"
                        size="xs"
                        title={`Open ${item.title} dashboard`}
                      >
                        <Icon
                          icon="material-symbols:open-in-new"
                          height={16}
                          className="text-gray-600 group-hover:text-white"
                        />
                      </Button>
                    </div>
                   </div>
                 </div>
               ))}
             </div>
           </div>
         </CardBox>

         {/* Protocol Details Modal */}
         <Modal
           show={selectedProtocol !== null}
           onClose={() => {
             setSelectedProtocol(null);
             setProtocolBreakdown(null);
           }}
           size="lg"
         >
           <Modal.Header>
             <div className="flex items-center space-x-3">
               <img
                 src={selectedProtocol?.logo}
                 alt={`${selectedProtocol?.title} logo`}
                 className="h-8 w-8 object-contain"
                 style={{ borderRadius: '20px' }}
               />
               <div>
                 <h3 className="text-lg font-semibold">{selectedProtocol?.title} Protocol</h3>
                 <p className="text-sm text-gray-500">Ethereum Network</p>
               </div>
             </div>
           </Modal.Header>
           <Modal.Body>
             <div className="space-y-6">
               {/* Current Portfolio Value */}
               <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                 <h4 className="text-sm font-medium text-gray-500 mb-2">Current Portfolio Value</h4>
                 <p className="text-2xl font-bold">{selectedProtocol?.price}</p>
               </div>

               {/* Portfolio Breakdown - Real Data */}
               {protocolBreakdown ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                     <h5 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Supplied</h5>
                     <p className="text-lg font-semibold">
                       ${protocolBreakdown.supplied.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                     </p>
                     <p className="text-xs text-gray-500">Lending + farming positions</p>
                   </div>
                   
                   <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                     <h5 className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">Interest Earned</h5>
                     <p className="text-lg font-semibold">
                       ${protocolBreakdown.interest.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                     </p>
                     <p className="text-xs text-gray-500">Available rewards</p>
                   </div>
                 </div>
               ) : (
                 <div className="text-center py-4">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                   <p className="text-sm text-gray-500 mt-2">Loading breakdown...</p>
                 </div>
               )}

               {/* Borrowed/Debt Section - Only for lending protocols that support borrowing */}
               {protocolBreakdown && selectedProtocol && (
                 (() => {
                   const protocolTitle = selectedProtocol.title.toLowerCase();
                   const showBorrowedSection = protocolTitle.includes('spark') || 
                                             protocolTitle.includes('aave') || 
                                             protocolTitle.includes('pendle') || 
                                             protocolTitle.includes('1inch');
                   
                   return showBorrowedSection ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                         <h5 className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Borrowed</h5>
                         <p className="text-lg font-semibold">
                           ${protocolBreakdown.borrowed.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                         </p>
                         <p className="text-xs text-gray-500">Total borrowed amount</p>
                       </div>
                       
                       <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                         <h5 className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-1">Debt Interest</h5>
                         <p className="text-lg font-semibold">
                           ${protocolBreakdown.debt.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                         </p>
                         <p className="text-xs text-gray-500">Accrued debt interest</p>
                       </div>
                     </div>
                   ) : null;
                 })()
               )}

               {/* Action Buttons */}
               <div className="flex space-x-3">
                 <Button
                   onClick={() => window.open(selectedProtocol?.externalLink, '_blank', 'noopener,noreferrer')}
                   className="flex-1 bg-blue-600 hover:bg-blue-700"
                 >
                   Manage Position
                 </Button>
                 <Button
                   color="gray"
                   onClick={() => setSelectedProtocol(null)}
                   className="flex-1"
                 >
                   Close
                 </Button>
               </div>

               {/* No Position Message */}
               {protocolBreakdown && protocolBreakdown.supplied === 0 && protocolBreakdown.interest === 0 && (
                 <div className="text-center py-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                   <Icon
                     icon="solar:info-circle-outline"
                     className="mx-auto mb-2 text-yellow-600 dark:text-yellow-400"
                     height={24}
                   />
                   <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
                     No active positions found
                   </p>
                   <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                     Start earning by supplying assets to {selectedProtocol?.title}
                   </p>
                 </div>
               )}
             </div>
           </Modal.Body>
         </Modal>
       </>
     );
};

export default ColorBoxes;
