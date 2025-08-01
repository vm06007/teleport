
import { Icon } from "@iconify/react";
import { Button } from "flowbite-react";
import { Link } from "react-router";
import CardBox from "src/components/shared/CardBox";
import { useWallet } from "src/hooks/useWallet";
import { fetchPortfolioData } from "src/services/portfolioService";
import { useState, useEffect } from "react";
import WelcomeCard from "./WelcomeCard";

const ColorBoxes = () => {
  const { account, chainId } = useWallet();
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

  const portfolioCards = [
    {
      bg: "primary-gradient",
      logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x808507121B80c02388fAd14726482e061B8da827/logo.png", // Actual Pendle logo
      fallbackIcon: "solar:leaf-bold-duotone",
      color: "bg-primary",
      title: "Pendle",
      price: loading ? "..." : formatUSDValue(portfolioData.pendleValue),
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
                        as={Link}
                        to={item.link}
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
       </>
     );
};

export default ColorBoxes;
