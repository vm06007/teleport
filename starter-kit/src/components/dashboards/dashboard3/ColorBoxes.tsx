
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
    compoundValue: 0,
    uniswapValue: 0,
    curveValue: 0
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

  const portfolioCards = [
    {
      bg: "primary-gradient",
      icon: "solar:dollar-minimalistic-linear",
      color: "bg-primary",
      title: "Total Portfolio",
      price: loading ? "Loading..." : `$${portfolioData.totalValue.toLocaleString()}`,
      link: "#",
    },
    {
      bg: "warning-gradient",
      icon: "solar:recive-twice-square-linear",
      color: "bg-warning",
      title: "Aave",
      price: loading ? "Loading..." : `$${portfolioData.aaveValue.toLocaleString()}`,
      link: "#",
    },
    {
      bg: "secondary-gradient",
      icon: "ic:outline-backpack",
      color: "bg-secondary",
      title: "Curve",
      price: loading ? "Loading..." : `$${portfolioData.curveValue.toLocaleString()}`,
      link: "#",
    },
    {
      bg: "error-gradient",
      icon: "ic:baseline-sync-problem",
      color: "bg-error",
      title: "Compound",
      price: loading ? "Loading..." : `$${portfolioData.compoundValue.toLocaleString()}`,
      link: "#",
    },
    {
      bg: "success-gradient",
      icon: "ic:outline-forest",
      color: "bg-success",
      title: "Uniswap",
      price: loading ? "Loading..." : `$${portfolioData.uniswapValue.toLocaleString()}`,
      link: "#",
    },
  ];

  return (
    <>
      <CardBox>
        {/* Portfolio Cards */}
        <div className="overflow-x-auto">
          <SimpleBar>
            <div className="flex gap-30">
              {portfolioCards.map((item, index) => (
                <div className="lg:basis-1/5 md:basis-1/4 basis-full lg:shrink shrink-0" key={index}>
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
          </SimpleBar>
        </div>
      </CardBox>
    </>
  );
};

export default ColorBoxes;
