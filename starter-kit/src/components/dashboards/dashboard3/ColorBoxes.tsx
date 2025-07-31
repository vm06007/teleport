
import { Icon } from "@iconify/react";
import { Button } from "flowbite-react";
import SimpleBar from "simplebar-react";
import { Link } from "react-router";
import CardBox from "src/components/shared/CardBox";
import { useWallet } from "src/hooks/useWallet";
import { fetchPortfolioData } from "src/services/portfolioService";
import { useState, useEffect } from "react";
const ColorboxData = [
  {
    bg: "primary-gradient",
    icon: "solar:dollar-minimalistic-linear",
    color: "bg-primary",
    title: "Total Orders",
    price: "16,689",
    link: "#",
  },
  {
    bg: "warning-gradient",
    icon: "solar:recive-twice-square-linear",
    color: "bg-warning",
    title: "Return Item",
    price: "148",
    link: "#",
  },
  {
    bg: "secondary-gradient",
    icon: "ic:outline-backpack",
    color: "bg-secondary",
    title: "Annual Budget",
    price: "$156K",
    link: "#",
  },
  {
    bg: "error-gradient",
    icon: "ic:baseline-sync-problem",
    color: "bg-error",
    title: "Cancel Orders",
    price: "64",
    link: "#",
  },
  {
    bg: "success-gradient",
    icon: "ic:outline-forest",
    color: "bg-success",
    title: "Total Income ",
    price: "$36,715",
    link: "#",
  },
];

const ColorBoxes = () => {
  const { account, isConnected, chainId } = useWallet();
  const [portfolioData, setPortfolioData] = useState({
    totalValue: 0,
    aaveValue: 0,
    sparkValue: 0,
    uniswapValue: 0,
    curveValue: 0,
    oneInchValue: 0
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
      icon: "solar:dollar-minimalistic-linear",
      color: "bg-primary",
      title: "Total Portfolio",
      price: loading ? "..." : formatUSDValue(portfolioData.totalValue),
      link: "#",
    },
    {
      bg: "warning-gradient",
      icon: "solar:recive-twice-square-linear",
      color: "bg-warning",
      title: "Aave",
      price: loading ? "..." : formatUSDValue(portfolioData.aaveValue),
      link: "#",
    },
    {
      bg: "secondary-gradient",
      icon: "ic:outline-backpack",
      color: "bg-secondary",
      title: "Curve",
      price: loading ? "..." : formatUSDValue(portfolioData.curveValue),
      link: "#",
    },
    {
      bg: "error-gradient",
      icon: "solar:flash-bold-duotone",
      color: "bg-error",
      title: "Spark",
      price: loading ? "..." : formatUSDValue(portfolioData.sparkValue),
      link: "#",
    },
    {
      bg: "success-gradient",
      icon: "ic:outline-forest",
      color: "bg-success",
      title: "Uniswap",
      price: loading ? "..." : formatUSDValue(portfolioData.uniswapValue),
      link: "#",
    },
    {
      bg: "info-gradient",
      icon: "cryptocurrency:1inch",
      color: "bg-info",
      title: "1inch",
      price: loading ? "..." : formatUSDValue(portfolioData.oneInchValue),
      link: "#",
    },
  ];

  return (
    <>
      <CardBox className="w-full max-w-none">
        {/* Portfolio Cards */}
        <div className="w-full">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 w-full">
            {portfolioCards.map((item, index) => (
              <div className="w-full" key={index}>
                  <div
                    className={`text-center px-5 py-30 rounded-tw ${item.bg}`}
                  >
                    <span
                      className={`h-12 w-12 mx-auto flex items-center justify-center rounded-tw ${item.color}`}
                    >
                      <Icon
                        icon={item.icon}
                        className="text-white"
                        height={24}
                      />
                    </span>
                    <p className="text-ld font-normal mt-4 mb-2">
                      {item.title}
                    </p>
                    <h4 className="text-22">{item.price}</h4>
                                         <Button
                       as={Link}
                       to={item.link}
                       className="w-fit mx-auto mt-5 bg-white hover:bg-dark text-ld font-semibold hover:text-white shadow-sm py-1 px-1 dark:bg-darkgray dark:hover:bg-dark"
                       size="xs"
                     >
                       View Details
                     </Button>
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
