
import CardBox from "../../shared/CardBox";
import { Icon } from "@iconify/react";
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Badge } from "flowbite-react";
import React, { useState, useEffect } from "react";
import { useWallet } from "../../../hooks/useWallet";
import { fetchPortfolioData } from "../../../services/portfolioService";


// Interest is now calculated directly from API profit/loss data

export interface TableTypeRowSelection {
  logo?: string;
  protocol?: string;
  chain?: string;
  protocolIcon?: string;
  tokens: {
    id: string;
    symbol: string;
    color: string;
    icon: string;
  }[];
  apy?: string;
  supplied?: string;
  currentValue?: string;
  claimableInterest?: string;
  status?: string;
  statuscolor?: string;
  selection?: any;
}

// Match the protocols from ColorBoxes component
const protocolsConfig = [
  {
    name: "Pendle",
    icon: "solar:chart-2-bold-duotone",
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x808507121B80c02388fAd14726482e061B8da827/logo.png",
    chain: "Ethereum",
    color: "primary"
  },
  {
    name: "Aave",
    icon: "solar:recive-twice-square-linear",
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9/logo.png",
    chain: "Ethereum",
    color: "warning"
  },
  {
    name: "Curve",
    icon: "ic:outline-backpack",
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xD533a949740bb3306d119CC777fa900bA034cd52/logo.png",
    chain: "Ethereum",
    color: "secondary"
  },
  {
    name: "Spark",
    icon: "solar:flame-linear",
    logo: "https://asset-metadata-service-production.s3.amazonaws.com/asset_icons/eec087023aa976ee9fe4aa05b54d35d918c9a45c7770000f5745ea6ce14adaf1.png",
    chain: "Ethereum",
    color: "error"
  },
  {
    name: "Uniswap",
    icon: "ic:outline-forest",
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo.png",
    chain: "Ethereum",
    color: "success"
  }
];

const basicTableData: TableTypeRowSelection[] = [
  {
    logo: protocolsConfig[1].logo, // Aave
    protocol: "Aave",
    chain: "Ethereum",
    protocolIcon: protocolsConfig[1].icon,
    tokens: [
      {
        id: "1",
        symbol: "USDC",
        color: "primary",
        icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
      },
      {
        id: "2",
        symbol: "ETH",
        color: "secondary",
        icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",
      },
    ],
    apy: "4.2%",
    supplied: "$32,530",
    currentValue: "$34,530",
    claimableInterest: "$2,000",
    status: "Active",
    statuscolor: "success",
  },
  {
    logo: protocolsConfig[2].logo, // Curve
    protocol: "Curve",
    chain: "Ethereum",
    protocolIcon: protocolsConfig[2].icon,
    tokens: [
      {
        id: "1",
        symbol: "3CRV",
        color: "error",
        icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xD533a949740bb3306d119CC777fa900bA034cd52/logo.png",
      },
      {
        id: "2",
        symbol: "USDT",
        color: "success",
        icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
      },
    ],
    apy: "7.3%",
    supplied: "$110,722",
    currentValue: "$122,722",
    claimableInterest: "$12,000",
    status: "Active",
    statuscolor: "success",
  },
  {
    logo: protocolsConfig[4].logo, // Uniswap
    protocol: "Uniswap",
    chain: "Ethereum",
    protocolIcon: protocolsConfig[4].icon,
    tokens: [
      {
        id: "1",
        symbol: "USDT",
        color: "success",
        icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
      },
      {
        id: "2",
        symbol: "USDC",
        color: "primary",
        icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
      },
    ],
    apy: "12.5%",
    supplied: "$1,100",
    currentValue: "$1,234",
    claimableInterest: "$134",
    status: "Active",
    statuscolor: "success",
  },
  {
    logo: protocolsConfig[0].logo, // Pendle
    protocol: "Pendle",
    chain: "Ethereum",
    protocolIcon: protocolsConfig[0].icon,
    tokens: [
      {
        id: "1",
        symbol: "PT-stETH",
        color: "primary",
        icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",
      },
      {
        id: "2",
        symbol: "YT-stETH",
        color: "warning",
        icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",
      },
    ],
    apy: "18.4%",
    supplied: "$50,000",
    currentValue: "$50,626",
    claimableInterest: "$626",
    status: "Active",
    statuscolor: "success",
  },
  {
    logo: protocolsConfig[3].logo, // Spark
    protocol: "Spark",
    chain: "Ethereum",
    protocolIcon: protocolsConfig[3].icon,
    tokens: [
      {
        id: "1",
        symbol: "DAI",
        color: "warning",
        icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png",
      },
      {
        id: "2",
        symbol: "sDAI",
        color: "warning",
        icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png",
      },
    ],
    apy: "5.1%",
    supplied: "$58,000",
    currentValue: "$61,182",
    claimableInterest: "$3,182",
    status: "Active",
    statuscolor: "success",
  },
];

const columnHelper = createColumnHelper<TableTypeRowSelection>();

const columns = [
  columnHelper.accessor("selection", {
    header: ({ table }) => {
      const ref = React.useRef<HTMLInputElement>(null);

      React.useEffect(() => {
        if (ref.current) {
          ref.current.indeterminate = table.getIsSomeRowsSelected();
        }
      }, [table.getIsSomeRowsSelected()]);

      return (
        <input
          type="checkbox"
          ref={ref}
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          className=" h-[18px] w-[18px] border border-border dark:border-darkborder bg-white dark:bg-transparent !data-[checked]:bg-primary dark:data-[checked]:bg-primary rounded cursor-pointer focus:ring-0 focus:ring-offset-0 outline-none"
        />
      );
    },
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        className=" h-[18px] w-[18px] border border-border dark:border-darkborder bg-white dark:bg-transparent !data-[checked]:bg-primary dark:data-[checked]:bg-primary rounded cursor-pointer focus:ring-0 focus:ring-offset-0 outline-none"
      />
    ),
    id: "selection",
  }),
  columnHelper.accessor("logo", {
    cell: (info) => (
      <div className="flex items-center space-x-3 p-1">
        <div className="h-10 w-10 flex items-center justify-center bg-white dark:bg-dark p-1" style={{ borderRadius: '20px' }}>
          <img
            src={info.getValue()}
            alt={info.row.original.protocol}
            className="object-contain"
            style={{ height: '32px', borderRadius: '20px' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              console.log(`Failed to load image: ${target.src} for protocol: ${info.row.original.protocol}`);
              target.style.display = 'none';
              const iconFallback = target.nextSibling as HTMLElement;
              if (iconFallback) iconFallback.style.display = 'flex';
            }}
            onLoad={() => {
              console.log(`Successfully loaded image for protocol: ${info.row.original.protocol}`);
            }}
          />
          <div className="hidden items-center justify-center bg-gray-200 dark:bg-gray-700" style={{ height: '32px', width: '32px', borderRadius: '20px' }}>
            {info.row.original.protocolIcon ? (
              <Icon
                icon={info.row.original.protocolIcon}
                className="text-lg"
                style={{ color: '#666' }}
              />
            ) : (
              <span className="text-xs font-medium">
                {info.row.original.protocol?.charAt(0)}
              </span>
            )}
          </div>
        </div>
        <div className="truncate max-w-32">
          <h6 className="text-sm font-medium">{info.row.original.protocol}</h6>
          <p className="text-xs text-gray-500">{info.row.original.chain}</p>
        </div>
      </div>
    ),
    header: () => <span>Protocol</span>,
  }),
  columnHelper.accessor("tokens", {
    header: () => <span>Tokens</span>,
    cell: (info) => (
      <div className="flex">
        {info.getValue().map((token) => (
          <div className="-ms-2" key={token.id} title={token.symbol}>
            <div className="h-8 w-8 border-2 border-white dark:border-darkborder bg-white dark:bg-dark flex justify-center items-center p-1" style={{ borderRadius: '20px' }}>
              <img
                src={token.icon}
                alt={token.symbol}
                className="object-contain"
                style={{ height: '28px', borderRadius: '20px' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const sibling = target.nextSibling as HTMLElement;
                  if (sibling) sibling.style.display = 'flex';
                }}
              />
              <div
                className={`hidden items-center justify-center bg-${token.color} text-white text-xs font-medium`}
                style={{ height: '28px', width: '28px', borderRadius: '20px' }}
              >
                {token.symbol.charAt(0)}
              </div>
            </div>
          </div>
        ))}
      </div>
    ),
  }),
  columnHelper.accessor("apy", {
    header: () => <span>APY</span>,
    cell: (info) => (
      <span className="text-base font-semibold text-green-600 dark:text-green-400">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("supplied", {
    header: () => <span>Supplied</span>,
    cell: (info) => <p className="text-base font-medium">{info.getValue()}</p>,
  }),
  columnHelper.accessor("claimableInterest", {
    header: () => <span>Interest</span>,
    cell: (info) => (
      <span className="text-base font-semibold text-blue-600 dark:text-blue-400">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("status", {
    header: () => <span>Status</span>,
    cell: (info) => (
      <Badge
        color={`light${info.row.original.statuscolor}`}
        className="capitalize"
      >
        {info.getValue()}
      </Badge>
    ),
  }),
];
const RevenueForcastChart = () => {
  const { account, isConnected, chainId } = useWallet();
  const [data, setData] = useState<TableTypeRowSelection[]>(basicTableData);
  const [loading, setLoading] = useState(false);
  const [rowSelection, setRowSelection] = useState({});

  // Fetch real portfolio data and calculate claimable interest
  const fetchRealPortfolioData = async () => {
    if (!account || !isConnected) {
      console.log("No wallet connected, using fallback data");
      setData(basicTableData);
      return;
    }

    try {
      setLoading(true);

      const walletAddress = account;
      const currentChainId = chainId || 1; // Default to Ethereum mainnet

      // Get protocol card values (exact same data source as cards)
      const protocolCardData = await fetchPortfolioData(walletAddress, currentChainId);

      // Get snapshot data for supplied amounts only
      const snapshotResponse = await fetch(`http://localhost:5003/proxy?url=https://api.1inch.dev/portfolio/portfolio/v5.0/protocols/snapshot?addresses=${walletAddress}&chain_id=${currentChainId}`);
      const snapshotData = await snapshotResponse.json();

      if (snapshotData.result && protocolCardData) {
        const protocols = snapshotData.result || [];

        console.log('🎯 Using EXACT same data as protocol cards:', protocolCardData);

        // Define the specific protocols we want to show (matching the cards)
        const targetProtocols = ['pendle', 'aave', 'curve', 'spark', 'uniswap', '1inch', 'oneinch'];

        // Filter to only show our target protocols that have positions > $0
        // Exclude Uniswap V2 specifically
        const relevantProtocols = protocols.filter((protocol: any) => {
          const protocolGroupName = protocol.protocol_group_name?.toLowerCase() || '';
          const protocolGroupId = protocol.protocol_group_id?.toLowerCase() || '';

          // Exclude Uniswap V2 specifically
          if (protocolGroupName.includes('uniswap v2') || protocolGroupName.includes('uniswap_v2')) {
            console.log(`🚫 Excluding ${protocol.protocol_group_name} from table`);
            return false;
          }

          return protocol.value_usd > 0 && targetProtocols.some(target =>
            protocolGroupName.includes(target) || protocolGroupId.includes(target)
          );
        });

        const realData = relevantProtocols.map((protocol: any) => {
          const protocolName = protocol.protocol_group_name;

          console.log(`=== ${protocolName} Simple Calculation ===`);

          // Step 1: Get EXACT value from protocol cards
          let currentValue = 0;
          if (protocolName.toLowerCase().includes('spark')) {
            currentValue = protocolCardData.sparkValue;
          } else if (protocolName.toLowerCase().includes('aave')) {
            currentValue = protocolCardData.aaveValue;
          } else if (protocolName.toLowerCase().includes('curve')) {
            currentValue = protocolCardData.curveValue;
          } else if (protocolName.toLowerCase().includes('uniswap')) {
            currentValue = protocolCardData.uniswapValue;
          } else if (protocolName.toLowerCase().includes('pendle')) {
            currentValue = protocolCardData.pendleValue;
          } else if (protocolName.toLowerCase().includes('1inch')) {
            currentValue = protocolCardData.oneInchValue;
          }

          if (currentValue === 0) {
            console.log(`❌ ${protocolName} has $0 value - skipping`);
            return null;
          }

          console.log('🎯 Protocol Card Value:', currentValue);
          console.log('🎯 This is the EXACT value shown in the card above');

          // Step 2: Get SUPPLIED AMOUNT from snapshot API (underlying tokens only)
          const stablecoins = ['usds', 'usdc', 'usdt', 'dai', 'busd', 'frax', 'usdp', 'tusd', 'usdn'];

          const suppliedAmount = (protocol.underlying_tokens || []).reduce((sum: number, token: any) => {
            const tokenSymbol = (token.symbol || '').toLowerCase();
            const isStablecoin = stablecoins.some(stable => tokenSymbol.includes(stable));
            const priceToUse = isStablecoin ? 1.0 : (token.price_usd || 0);
            const tokenValue = (token.amount || 0) * priceToUse;

            console.log(`📋 Token ${token.symbol}: ${token.amount} × $${priceToUse} = $${tokenValue}`);
            return sum + tokenValue;
          }, 0);

          console.log('📋 Supplied Amount (from snapshot tokens):', suppliedAmount);

          // Step 3: Calculate Interest = Current Value - Supplied Amount
          const claimableInterest = Math.max(0, currentValue - suppliedAmount);
          const roi = suppliedAmount > 0 ? (claimableInterest / suppliedAmount) * 100 : 0;

          console.log('💰 Simple Interest Calculation:');
          console.log('  Protocol Card Value:', currentValue);
          console.log('  Supplied Amount:', suppliedAmount);
          console.log('  Interest = Card Value - Supplied');
          console.log('  Interest =', currentValue, '-', suppliedAmount, '=', claimableInterest);

          console.log(`✅ ${protocolName} Final Results:`, {
            currentValue: '$' + currentValue.toFixed(0),
            suppliedAmount: '$' + suppliedAmount.toFixed(0),
            claimableInterest: '$' + claimableInterest.toFixed(0),
            roi: roi.toFixed(1) + '%'
          });

          // Get protocol config for UI elements
          const protocolConfig = protocolsConfig.find(config =>
            config.name.toLowerCase() === protocolName.toLowerCase()
          );

          return {
            logo: protocolConfig?.logo || "https://via.placeholder.com/32",
            protocol: protocolName,
            chain: "Ethereum",
            protocolIcon: protocolConfig?.icon || "solar:chart-bold-duotone",
            tokens: protocolConfig?.name === "Aave" ? [
              {
                id: "1",
                symbol: "USDC",
                color: "primary",
                icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
              },
              {
                id: "2",
                symbol: "ETH",
                color: "secondary",
                icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",
              },
            ] : protocolConfig?.name === "Spark" ? [
              {
                id: "1",
                symbol: "DAI",
                color: "warning",
                icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png",
              },
              {
                id: "2",
                symbol: "ETH",
                color: "secondary",
                icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",
              },
            ] : [
              {
                id: "1",
                symbol: "ETH",
                color: "primary",
                icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",
              }
            ],
            apy: `${roi.toFixed(1)}%`,
            supplied: `$${Math.max(0, suppliedAmount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
            currentValue: `$${currentValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
            claimableInterest: `$${Math.max(0, claimableInterest).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
            status: claimableInterest > 0 ? "Active" : "No Profit",
            statuscolor: claimableInterest > 0 ? "success" : "warning"
          };
        });

        // Filter out null entries (protocols not found in current API)
        const validData = realData.filter((item: any) => item !== null) as TableTypeRowSelection[];

        console.log('🔄 Before grouping - Found', validData.length, 'protocol entries');
        validData.forEach((p: any) => {
          console.log(`  ${p.protocol}: Supplied ${p.supplied}, Interest ${p.claimableInterest}`);
        });

        // Group by protocol and sum supplied amounts
        const groupedData = validData.reduce((acc: any, item: any) => {
          const protocolKey = item.protocol.toLowerCase();

          if (!acc[protocolKey]) {
            // First entry for this protocol - use protocol card value
            let protocolCardValue = 0;
            if (protocolKey.includes('spark')) {
              protocolCardValue = protocolCardData.sparkValue;
            } else if (protocolKey.includes('aave')) {
              protocolCardValue = protocolCardData.aaveValue;
            } else if (protocolKey.includes('curve')) {
              protocolCardValue = protocolCardData.curveValue;
            } else if (protocolKey.includes('uniswap')) {
              protocolCardValue = protocolCardData.uniswapValue;
            } else if (protocolKey.includes('pendle')) {
              protocolCardValue = protocolCardData.pendleValue;
            } else if (protocolKey.includes('1inch')) {
              protocolCardValue = protocolCardData.oneInchValue;
            }

            acc[protocolKey] = {
              ...item,
              suppliedAmountRaw: 0, // Track raw number for summing
              currentValueRaw: protocolCardValue // Use protocol card value
            };
          }

          // Sum the supplied amounts (parse back from formatted string)
          const suppliedAmount = parseFloat(item.supplied.replace(/[$,]/g, ''));
          acc[protocolKey].suppliedAmountRaw += suppliedAmount;

          return acc;
        }, {});

        // Convert grouped data back to array and recalculate values
        const consolidatedData = Object.values(groupedData).map((item: any) => {
          const currentValue = item.currentValueRaw;
          const totalSupplied = item.suppliedAmountRaw;
          const interest = Math.max(0, currentValue - totalSupplied);
          const roi = totalSupplied > 0 ? (interest / totalSupplied) * 100 : 0;

          console.log(`🎯 ${item.protocol} CONSOLIDATED:`);
          console.log(`  Protocol Card Value: $${currentValue.toLocaleString()}`);
          console.log(`  Total Supplied: $${totalSupplied.toLocaleString()}`);
          console.log(`  Interest: $${interest.toLocaleString()}`);

          return {
            ...item,
            supplied: `$${Math.max(0, totalSupplied).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
            currentValue: `$${currentValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
            claimableInterest: `$${Math.max(0, interest).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
            apy: `${roi.toFixed(1)}%`,
            status: interest > 0 ? "Active" : "No Profit",
            statuscolor: interest > 0 ? "success" : "warning"
          };
        });

        console.log('✅ After consolidation - Final', consolidatedData.length, 'unique protocols');
        consolidatedData.forEach((p: any) => {
          console.log(`  ${p.protocol}: Supplied ${p.supplied} + Interest ${p.claimableInterest} = Total ${p.currentValue}`);
        });

        // Set the consolidated data
        setData(consolidatedData);
      }
    } catch (error) {
      console.error("Error fetching protocol snapshot data:", error);
      // Show empty table if API fails - no mock data
      console.warn("Failed to fetch real protocol data. Connect a wallet with DeFi positions to see actual supplied amounts and interest.");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (account && isConnected) {
      fetchRealPortfolioData();
    }
  }, [account, isConnected, chainId]);

  // Calculate totals from real data
  const totals = data.reduce((acc, row) => {
    const supplied = parseFloat(row.supplied?.replace(/[$,]/g, '') || '0');
    const claimable = parseFloat(row.claimableInterest?.replace(/[$,]/g, '') || '0');
    return {
      totalSupplied: acc.totalSupplied + supplied,
      totalClaimable: acc.totalClaimable + claimable
    };
  }, { totalSupplied: 0, totalClaimable: 0 });

  // Calculate average APY
  const avgAPY = data.length > 0
    ? (data.reduce((acc, row) => acc + parseFloat(row.apy?.replace('%', '') || '0'), 0) / data.length).toFixed(1)
    : '0.0';

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
  });

  return (
    <>
      <CardBox>
        <div className="md:flex justify-between items-center">
          <div>
            <h5 className="card-title">Interest</h5>
          </div>
            </div>
        <div className="border border-ld rounded-md overflow-hidden mb-6">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-gray-600">Loading PnL and claimable interest data...</span>
            </div>
            ) : (
            <table className="min-w-full">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className={`text-base text-ld font-semibold text-left border-b border-ld p-2`}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-border dark:divide-darkborder">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={`whitespace-nowrap text-sm p-2`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>
        </div>
        <div className="flex md:flex-row flex-col gap-3">
          <div className="md:basis-1/3 basis-full">
            <div className="flex gap-3 items-center">
              <span className="h-12 w-12 flex-shrink-0 flex items-center justify-center bg-muted dark:bg-dark rounded-tw">
                <Icon
                  icon="solar:pie-chart-2-linear"
                  className="text-ld"
                  height={24}
                />
              </span>
              <div>
                <p>Total Supplied</p>
                <h5 className="font-medium text-lg">${totals.totalSupplied.toLocaleString()}</h5>
              </div>
            </div>
          </div>
          <div className="md:basis-1/3 basis-full">
            <div className="flex gap-3 items-center">
              <span className="h-12 w-12 flex-shrink-0 flex items-center justify-center bg-lightprimary rounded-tw">
                <Icon
                  icon="solar:hand-money-linear"
                  className="text-primary"
                  height={24}
                />
              </span>
              <div>
                <p>Claimable Interest</p>
                <h5 className="font-medium text-lg">${totals.totalClaimable.toLocaleString()}</h5>
              </div>
            </div>
          </div>
          <div className="md:basis-1/3 basis-full">
            <div className="flex gap-3 items-center">
              <span className="h-12 w-12 flex-shrink-0 flex items-center justify-center bg-lightsuccess rounded-tw">
                <Icon
                  icon="solar:percentage-circle-linear"
                  className="text-success"
                  height={24}
                />
              </span>
              <div>
                <p>Avg APY</p>
                <h5 className="font-medium text-lg">{avgAPY}%</h5>
              </div>
            </div>
          </div>
        </div>
      </CardBox>
    </>
  );
};

export default RevenueForcastChart;
