
import { Icon } from "@iconify/react";
import { Button, Modal } from "flowbite-react";
import CardBox from "src/components/shared/CardBox";
import { useWallet } from "src/hooks/useWallet";
import { fetchPortfolioData } from "src/services/portfolioService";
import { useState, useEffect } from "react";
import WelcomeCard from "./WelcomeCard";
import RevenueForcastChart from "./RevenueForcastChart";
import { fetchUserUniswapPositions, type UniswapPosition } from "src/services/uniswapService";
import { useCollectInterest } from "src/hooks/useCollectInterest";
import { getTokenMetadata, generateRandomAPY } from "../../../utils/tokenMappings";
import "./modal-blur.css";

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
    const [protocolBreakdowns, setProtocolBreakdowns] = useState<any>({});
    const [loading, setLoading] = useState(false);

    // Uniswap positions state
    const [uniswapPositions, setUniswapPositions] = useState<UniswapPosition[]>([]);
    const [selectedPositions, setSelectedPositions] = useState<Set<string>>(new Set());
    const [loadingPositions, setLoadingPositions] = useState(false);

    // Token breakdown toggle state
    const [showTokenBreakdown, setShowTokenBreakdown] = useState(false);

    // Wagmi hook for collecting interest and exiting positions
    const {
        collectInterest,
        collectUniswapFees,
        exitPosition,
        isPending,
        isConfirming,
        isConfirmed,
        error: collectError,
        hash,
        operationType
    } = useCollectInterest(selectedProtocol?.title || '');

    useEffect(() => {
        if (account && chainId) {
            fetchPortfolioDataFromService();
        }
    }, [account, chainId]);

    const fetchPortfolioDataFromService = async () => {
        if (!account || !chainId) return;

        try {
            setLoading(true);

            // Fetch both portfolio data and detailed breakdown
            const [portfolioData, snapshotResponse] = await Promise.all([
                fetchPortfolioData(account, chainId),
                fetch(`http://localhost:5003/proxy?url=https://api.1inch.dev/portfolio/portfolio/v5.0/protocols/snapshot?addresses=${account}&chain_id=${chainId}`)
                    .then(res => res.json())
            ]);

            console.log("📊 Fetched Portfolio Data:", portfolioData);
            console.log("📊 Fetched Snapshot Data:", snapshotResponse);

            const protocols = snapshotResponse.result || [];
            const stablecoins = ['usds', 'usdc', 'usdt', 'dai', 'busd', 'frax', 'usdp', 'tusd', 'usdn'];

            // Helper function to calculate protocol breakdown
            const calculateProtocolBreakdown = (protocolNames: string[]) => {
                console.log(`🔍 Calculating breakdown for protocols:`, protocolNames);

                const matchingProtocols = protocols.filter((protocol: any) => {
                    const protocolName = protocol.protocol_group_name?.toLowerCase() || '';
                    const matches = protocolNames.some(name =>
                        protocolName.includes(name) || name.includes(protocolName)
                    );

                    if (matches) {
                        console.log(`✅ Found matching protocol: ${protocol.protocol_group_name} for ${protocolNames.join(', ')}`);
                    }

                    return matches;
                });

                console.log(`📊 Found ${matchingProtocols.length} matching protocols for ${protocolNames.join(', ')}`);

                let totalSupplied = 0;
                let totalRewards = 0;

                matchingProtocols.forEach((protocol: any) => {
                    // Calculate supplied using stablecoin logic
                    const suppliedAmount = (protocol.underlying_tokens || []).reduce((sum: number, token: any) => {
                        const tokenSymbol = (token.symbol || '').toLowerCase();
                        const isStablecoin = stablecoins.some(stable => tokenSymbol.includes(stable));

                        if (isStablecoin) {
                            return sum + (token.amount || 0); // 1:1 conversion
                        } else {
                            return sum + (token.value_usd || 0); // Market price
                        }
                    }, 0);

                    // Calculate rewards
                    const rewardsAmount = (protocol.reward_tokens || []).reduce((sum: number, token: any) => {
                        return sum + (token.value_usd || 0);
                    }, 0);

                    console.log(`💰 ${protocol.protocol_group_name}: supplied=${suppliedAmount}, rewards=${rewardsAmount}`);

                    totalSupplied += suppliedAmount;
                    totalRewards += rewardsAmount;
                });

                // Extract token information with metadata
                const tokens: any[] = [];
                matchingProtocols.forEach((protocol: any) => {
                    (protocol.underlying_tokens || []).forEach((token: any) => {
                        const tokenSymbol = (token.symbol || '').toLowerCase();
                        const isStablecoin = stablecoins.some(stable => tokenSymbol.includes(stable));
                        const metadata = getTokenMetadata(token.symbol || '');

                        if (token.amount > 0 || token.value_usd > 0) {
                            tokens.push({
                                symbol: token.symbol || '',
                                amount: token.amount || 0,
                                valueUsd: token.value_usd || 0,
                                icon: metadata.icon,
                                name: metadata.name,
                                apy: generateRandomAPY(token.symbol || ''),
                                isStablecoin
                            });
                        }
                    });
                });

                const result = {
                    supplied: totalSupplied,
                    interest: totalRewards,
                    total: totalSupplied + totalRewards,
                    borrowed: 0,  // Placeholder - will implement later
                    debt: 0,      // Placeholder - will implement later
                    tokens: tokens
                };

                console.log(`📊 Final result for ${protocolNames.join(', ')}:`, result);
                return result;
            };

            // Calculate breakdowns for all protocols
            const breakdowns = {
                aave: calculateProtocolBreakdown(['aave']),
                spark: calculateProtocolBreakdown(['spark']),
                uniswap: calculateProtocolBreakdown(['uniswap']),
                curve: calculateProtocolBreakdown(['curve']),
                oneInch: calculateProtocolBreakdown(['1inch']),
                pendle: calculateProtocolBreakdown(['pendle'])
            };

            console.log("📊 Calculated Breakdowns:", breakdowns);

            // Update portfolio data to use calculated totals
            const updatedPortfolioData = {
                ...portfolioData,
                aaveValue: breakdowns.aave.total,
                sparkValue: breakdowns.spark.total,
                uniswapValue: breakdowns.uniswap.total,
                curveValue: breakdowns.curve.total,
                oneInchValue: breakdowns.oneInch.total,
                pendleValue: breakdowns.pendle.total,
                protocolsValue: breakdowns.aave.total + breakdowns.spark.total + breakdowns.uniswap.total +
                    breakdowns.curve.total + breakdowns.oneInch.total + breakdowns.pendle.total
            };

            updatedPortfolioData.totalValue = updatedPortfolioData.protocolsValue + updatedPortfolioData.walletValue;

            setPortfolioData(updatedPortfolioData);
            setProtocolBreakdowns(breakdowns);

        } catch (error) {
            console.error("Error fetching portfolio data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCollectInterest = async (protocol: any) => {
        if (!protocol || !account) return;

        try {
            console.log('Collecting interest from:', protocol.title);
            await collectInterest(account);
        } catch (error) {
            console.error('Error collecting interest:', error);
        }
    };

    const handleExitPosition = async (protocol: any) => {
        if (!protocol || !account) return;

        try {
            console.log('Exiting position from:', protocol.title);
            await exitPosition(account);
        } catch (error) {
            console.error('Error exiting position:', error);
        }
    };

    const fetchUniswapPositions = async () => {
        if (!account) return;

        setLoadingPositions(true);
        try {
            console.log('🔍 Fetching Uniswap positions...');

            // Fetch real Uniswap V4 positions from mainnet
            const positions = await fetchUserUniswapPositions(account);
            console.log(`🎯 Found ${positions.length} real Uniswap V4 positions with fees/liquidity`);

            setUniswapPositions(positions);
            console.log(`📊 Found ${positions.length} Uniswap positions`);
        } catch (error) {
            console.error('❌ Error fetching Uniswap positions:', error);
            setUniswapPositions([]);
        } finally {
            setLoadingPositions(false);
        }
    };

    const handlePositionSelection = (tokenId: string, selected: boolean) => {
        const newSelected = new Set(selectedPositions);
        if (selected) {
            newSelected.add(tokenId);
        } else {
            newSelected.delete(tokenId);
        }
        setSelectedPositions(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedPositions.size === uniswapPositions.length) {
            setSelectedPositions(new Set());
        } else {
            setSelectedPositions(new Set(uniswapPositions.map(p => p.tokenId)));
        }
    };

    const handleCollectUniswapFees = async () => {
        if (!account || selectedPositions.size === 0) return;

        const selectedPositionData = uniswapPositions.filter(p =>
            selectedPositions.has(p.tokenId)
        );

        try {
            console.log('Collecting fees from selected positions:', selectedPositionData);
            await collectUniswapFees(account, selectedPositionData);
        } catch (error) {
            console.error('Error collecting Uniswap fees:', error);
        }
    };

    const handleWithdrawLiquidity = async () => {
        if (!account || selectedPositions.size === 0) return;

        const selectedPositionData = uniswapPositions.filter(p =>
            selectedPositions.has(p.tokenId)
        );

        try {
            console.log('Withdrawing liquidity from selected positions:', selectedPositionData);
            // TODO: Implement liquidity withdrawal functionality
            // This would involve calling the PositionManager's burn or withdraw functions
            // For now, just log the operation
            console.log('Withdraw liquidity functionality will be implemented in production');

            // Set operation type for UI feedback
            // This would be part of an actual withdrawal hook call in production
        } catch (error) {
            console.error('Error withdrawing liquidity:', error);
        }
    };

    // Watch for transaction confirmation
    useEffect(() => {
        if (isConfirmed) {
            console.log(`${operationType === 'exit' ? 'Position exited' : 'Interest collected'} successfully!`);
            // Refresh portfolio data to show updated balances
            fetchPortfolioDataFromService();
        }
    }, [isConfirmed, operationType]);

    // Handle collection errors
    useEffect(() => {
        if (collectError) {
            console.error(`Failed to ${operationType === 'exit' ? 'exit position' : 'collect interest'}:`, collectError);
        }
    }, [collectError, operationType]);

    // Handle ESC key to close modal
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && selectedProtocol) {
                setSelectedProtocol(null);
                setProtocolBreakdown(null);
                setShowTokenBreakdown(false); // Reset token breakdown to collapsed
            }
        };

        document.addEventListener('keydown', handleEscKey);
        return () => document.removeEventListener('keydown', handleEscKey);
    }, [selectedProtocol]);

    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (selectedProtocol) {
            // Store current scroll position
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            // Disable body scroll with multiple methods for better browser support


            // Store scroll position for restoration
            document.body.setAttribute('data-scroll-top', scrollTop.toString());
        } else {
            // Get stored scroll position
            const scrollTop = parseInt(document.body.getAttribute('data-scroll-top') || '0');



            // Restore scroll position
            window.scrollTo(0, scrollTop);
            document.body.removeAttribute('data-scroll-top');
        }

        // Cleanup on unmount
        return () => {
            const scrollTop = parseInt(document.body.getAttribute('data-scroll-top') || '0');
            document.body.classList.remove('modal-open');
            document.documentElement.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.left = '';
            document.body.style.right = '';
            document.body.style.width = '';
            document.documentElement.style.overflow = '';
            if (scrollTop > 0) {
                window.scrollTo(0, scrollTop);
            }
            document.body.removeAttribute('data-scroll-top');
        };
    }, [selectedProtocol]);

    // Force blur effect on modal backdrop
    useEffect(() => {
        if (selectedProtocol) {
            // Wait a bit for modal to render, then apply blur
            const timer = setTimeout(() => {
                // Try multiple selectors to catch the backdrop
                const selectors = [
                    '[data-modal-backdrop]',
                    '.fixed.inset-0',
                    'div[class*="fixed"][class*="inset-0"]',
                    '.bg-gray-900',
                    '.bg-opacity-50',
                    '#protocol-modal + div',
                    '#protocol-modal ~ div',
                    'div[style*="z-index"]'
                ];

                selectors.forEach(selector => {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(element => {
                        const htmlElement = element as HTMLElement;
                        // Only apply to elements that look like modal backdrops
                        if (htmlElement.classList.contains('fixed') ||
                            htmlElement.hasAttribute('data-modal-backdrop') ||
                            htmlElement.style.zIndex) {
                            htmlElement.style.backdropFilter = 'blur(3px)';
                            (htmlElement.style as any).webkitBackdropFilter = 'blur(3px)';
                            htmlElement.style.backgroundColor = 'rgba(17, 24, 39, 0.6)';
                            console.log('Applied blur to:', selector, htmlElement);
                        }
                    });
                });
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [selectedProtocol]);

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
            externalLink: "https://app.spark.fi/spk/farm"
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
            externalLink: "https://app.uniswap.org/positions",
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
                                        filter: item.value === 0 ? 'grayscale(1)' : 'none',
                                        opacity: item.value === 0 ? 1 : 1
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
                                            onClick={() => {
                                                setSelectedProtocol(item);

                                                // If it's Uniswap, fetch positions
                                                if (item.title.toLowerCase() === 'uniswap') {
                                                    fetchUniswapPositions();
                                                    setSelectedPositions(new Set()); // Reset selection
                                                }

                                                // Use pre-calculated breakdown data
                                                const protocolKey = item.title.toLowerCase();
                                                const breakdown = protocolBreakdowns[protocolKey === '1inch' ? 'oneInch' : protocolKey];

                                                console.log("🔍 Opening modal for:", item.title);
                                                console.log("🔍 Protocol key:", protocolKey);
                                                console.log("🔍 Available breakdowns:", Object.keys(protocolBreakdowns));
                                                console.log("🔍 Selected breakdown:", breakdown);

                                                // Safety check - provide default if breakdown is undefined
                                                setProtocolBreakdown(breakdown || {
                                                    supplied: 0,
                                                    interest: 0,
                                                    total: 0,
                                                    borrowed: 0,
                                                    debt: 0
                                                });
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
                    setShowTokenBreakdown(false); // Reset token breakdown to collapsed
                }}
                size="lg"
                className="modal-backdrop-blur"
                dismissible={true}
                id="protocol-modal"
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
                    {/* External Link Button positioned next to close button */}
                    <button
                        onClick={() => window.open(selectedProtocol?.externalLink, '_blank', 'noopener,noreferrer')}
                        className="absolute top-[24px] right-[56px] w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-blue-100 dark:bg-gray-700 dark:hover:bg-blue-600 transition-all duration-200 group hover:scale-110 mt-[8px] mr-[8px]"
                        title={`Open ${selectedProtocol?.title} dashboard`}
                    >
                        <Icon
                            icon="material-symbols:open-in-new"
                            height={16}
                            className="text-gray-600 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-300 transition-colors"
                        />
                    </button>
                </Modal.Header>
                <Modal.Body>
                    <div className="space-y-6">
                        {/* Current Portfolio Value - Always show first */}
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-medium text-gray-500">Current Portfolio Value</h4>
                                {protocolBreakdown && protocolBreakdown.tokens && protocolBreakdown.tokens.length > 0 && (
                                    <button
                                        onClick={() => setShowTokenBreakdown(!showTokenBreakdown)}
                                        className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                    >
                                        <Icon
                                            icon={showTokenBreakdown ? "mdi:chevron-up" : "mdi:chevron-down"}
                                            className="text-sm"
                                        />
                                        <span>{showTokenBreakdown ? 'Hide' : 'Show'} Breakdown</span>
                                    </button>
                                )}
                            </div>
                            <p className="text-2xl font-bold">
                                {protocolBreakdown ? (() => {
                                    // Round individual values the same way they're displayed
                                    const roundedSupplied = protocolBreakdown.supplied < 100 ?
                                        Math.round(protocolBreakdown.supplied * 100) / 100 :
                                        Math.round(protocolBreakdown.supplied);
                                    const roundedInterest = protocolBreakdown.interest < 100 ?
                                        Math.round(protocolBreakdown.interest * 100) / 100 :
                                        Math.round(protocolBreakdown.interest);
                                    const total = roundedSupplied + roundedInterest;

                                    console.log(`🧮 Portfolio Value Calculation:`, {
                                        rawSupplied: protocolBreakdown.supplied,
                                        rawInterest: protocolBreakdown.interest,
                                        roundedSupplied,
                                        roundedInterest,
                                        total: total,
                                        ceiling: Math.ceil(total)
                                    });

                                    return `$${Math.ceil(total).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
                                })() : selectedProtocol?.price}
                            </p>
                        </div>

                        {/* Token Breakdown - Collapsible */}
                        {showTokenBreakdown && protocolBreakdown && protocolBreakdown.tokens && protocolBreakdown.tokens.length > 0 && (
                            <div className="space-y-3">
                                {protocolBreakdown.tokens.map((token: any, index: number) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            {token.icon ? (
                                                <img
                                                    src={token.icon}
                                                    alt={token.symbol}
                                                    className="w-8 h-8 rounded-full"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                                                    {token.symbol.charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {token.symbol}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {token.name}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                                                {token.apy}% APY
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {token.amount ?
                                                    `${token.amount.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${token.symbol}` :
                                                    `${(token.valueUsd / (token.symbol === 'USDS' ? 1 : token.symbol === 'ETH' ? 3400 : 1)).toLocaleString('en-US', { maximumFractionDigits: 2 })} ${token.symbol}`
                                                }
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Portfolio Breakdown - Pre-calculated Data - Show third */}
                        {protocolBreakdown && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                    <h5 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Supplied</h5>
                                    <p className="text-lg font-semibold">
                                        ${protocolBreakdown.supplied < 100 ?
                                            protocolBreakdown.supplied.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) :
                                            protocolBreakdown.supplied.toLocaleString('en-US', { maximumFractionDigits: 0 })
                                        }
                                    </p>
                                    <p className="text-xs text-gray-500">Lending + farming positions</p>
                                </div>

                                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                    <h5 className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">Interest Earned</h5>
                                    <p className="text-lg font-semibold">
                                        ${protocolBreakdown.interest < 100 ?
                                            protocolBreakdown.interest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) :
                                            protocolBreakdown.interest.toLocaleString('en-US', { maximumFractionDigits: 0 })
                                        }
                                    </p>
                                    <p className="text-xs text-gray-500">Available rewards</p>
                                </div>
                            </div>
                        )}

                        {/* Uniswap Positions */}

                        {selectedProtocol?.title.toLowerCase() === 'uniswap' ? (
                            <div className="space-y-4">
                                {/* Header with Select All */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-lg font-semibold">Your Uniswap V4 Positions</h4>
                                    </div>
                                    {uniswapPositions.length > 0 && (
                                        <Button
                                            size="xs"
                                            color="gray"
                                            onClick={handleSelectAll}
                                        >
                                            {selectedPositions.size === uniswapPositions.length ? 'Deselect All' : 'Select All'}
                                        </Button>
                                    )}
                                </div>

                                {/* Loading State */}
                                {loadingPositions && (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                        <p className="text-gray-500">Loading positions...</p>
                                    </div>
                                )}

                                {/* Positions List */}
                                {!loadingPositions && uniswapPositions.length > 0 && (
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {uniswapPositions.map((position) => (
                                            <div
                                                key={position.tokenId}
                                                className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200"
                                                onClick={() => handlePositionSelection(position.tokenId, !selectedPositions.has(position.tokenId))}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPositions.has(position.tokenId)}
                                                    onChange={(e) => {
                                                        e.stopPropagation(); // Prevent double-toggle when clicking checkbox directly
                                                        handlePositionSelection(position.tokenId, e.target.checked);
                                                    }}
                                                    className="h-4 w-4 text-blue-600 rounded mr-3"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h5 className="font-medium">
                                                                {position.token0Symbol}/{position.token1Symbol}
                                                            </h5>
                                                            <p className="text-sm text-gray-500">
                                                                Position #{position.tokenId} • Fee: {position.poolKey.fee / 10000}%
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-medium text-green-600">
                                                                ${position.feesUSD?.toFixed(2) || '0.00'}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                Fees Available
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* No Positions */}
                                {!loadingPositions && uniswapPositions.length === 0 && (
                                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <Icon icon="solar:inbox-line-bold-duotone" height={48} className="mx-auto mb-4 text-gray-400" />
                                        <h5 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No V4 Positions Found</h5>
                                        <p className="text-gray-500 mb-2">
                                            V4 position fetching requires specialized indexing (subgraph, events, etc.)
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Showing demo data below for UI demonstration
                                        </p>
                                    </div>
                                )}

                                {/* Summary */}
                                {uniswapPositions.length > 0 && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h5 className="font-medium">Total Fees Available</h5>
                                                <p className="text-sm text-gray-500">
                                                    {selectedPositions.size} of {uniswapPositions.length} positions selected
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-bold text-blue-600">
                                                    ${uniswapPositions
                                                        .filter(p => selectedPositions.has(p.tokenId))
                                                        .reduce((sum, p) => sum + (p.feesUSD || 0), 0)
                                                        .toFixed(2)
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : null}


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
                        {selectedProtocol?.title.toLowerCase() === 'uniswap' ? (
                            // Uniswap Actions
                            <div className="flex space-x-3">
                                <Button
                                    onClick={handleCollectUniswapFees}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                    disabled={isPending || isConfirming || selectedPositions.size === 0}
                                >
                                    {isPending && operationType === 'collect' ? 'Preparing...' :
                                     isConfirming && operationType === 'collect' ? 'Confirming...' :
                                     isConfirmed && operationType === 'collect' ? '✅ Collected!' :
                                     `Collect Fees (${selectedPositions.size})`}
                                </Button>
                                <Button
                                    onClick={handleWithdrawLiquidity}
                                    className="flex-1 bg-red-600 hover:bg-red-700"
                                    disabled={isPending || isConfirming || selectedPositions.size === 0}
                                >
                                    {isPending && operationType === 'withdraw' ? 'Preparing...' :
                                     isConfirming && operationType === 'withdraw' ? 'Confirming...' :
                                     isConfirmed && operationType === 'withdraw' ? '✅ Withdrawn!' :
                                     `Withdraw Liquidity (${selectedPositions.size})`}
                                </Button>
                            </div>
                        ) : (
                            // Other Protocol Actions
                            <div className="flex space-x-3">
                                <Button
                                    onClick={() => handleCollectInterest(selectedProtocol)}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                    disabled={isPending || isConfirming}
                                >
                                    {isPending && operationType === 'collect' ? 'Preparing...' :
                                     isConfirming && operationType === 'collect' ? 'Confirming...' :
                                     isConfirmed && operationType === 'collect' ? '✅ Collected!' :
                                     'Collect Interest'}
                                </Button>
                                <Button
                                    onClick={() => handleExitPosition(selectedProtocol)}
                                    className="flex-1 bg-red-600 hover:bg-red-700"
                                    disabled={isPending || isConfirming}
                                >
                                    {isPending && operationType === 'exit' ? 'Preparing...' :
                                     isConfirming && operationType === 'exit' ? 'Confirming...' :
                                     isConfirmed && operationType === 'exit' ? '✅ Exited!' :
                                     'Exit Protocol'}
                                </Button>
                            </div>
                        )}

                        {/* Success Message */}
                        {isConfirmed && hash && (
                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                                <div className="flex items-center">
                                    <Icon icon="material-symbols:check-circle" className="text-green-600 dark:text-green-400 mr-2" />
                                    <div>
                                        <h5 className="text-sm font-medium text-green-600 dark:text-green-400">
                                            {operationType === 'exit' ? 'Position Exited Successfully!' : 'Interest Collected Successfully!'}
                                        </h5>
                                        <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                                            Transaction:
                                            <a
                                                href={`https://etherscan.io/tx/${hash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="ml-1 underline hover:text-green-700"
                                            >
                                                {hash.slice(0, 10)}...{hash.slice(-8)}
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

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

            {/* Interest Table with pre-calculated data */}
            <RevenueForcastChart protocolBreakdowns={protocolBreakdowns} />
        </>
    );
};

export default ColorBoxes;
